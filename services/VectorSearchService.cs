using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

namespace VivoAmigo.Core.Services;

public interface IVectorSearchService
{
    Task<List<Guid>> SearchListingIdsAsync(string query, int topK = 20, CancellationToken cancellationToken = default);
}

public sealed class PineconeVectorSearchService : IVectorSearchService
{
    private const string EmbeddingModel = "text-embedding-3-small";
    private readonly HttpClient _httpClient;
    private readonly string _openAiApiKey;
    private readonly string _pineconeApiKey;
    private readonly Uri _pineconeUrl;

    public PineconeVectorSearchService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _openAiApiKey = RequiredConfig(config, "OpenAI:ApiKey");
        _pineconeApiKey = RequiredConfig(config, "Pinecone:ApiKey");
        _pineconeUrl = RequiredUri(config, "Pinecone:EnvironmentUrl");
    }

    public async Task<List<Guid>> SearchListingIdsAsync(string query, int topK = 20, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query)) throw new ArgumentException("Search query is required.", nameof(query));
        if (topK is < 1 or > 100) throw new ArgumentOutOfRangeException(nameof(topK), "topK must be between 1 and 100.");

        var embedding = await GenerateEmbeddingAsync(query.Trim(), cancellationToken);
        using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(_pineconeUrl, "query"));
        request.Headers.Add("Api-Key", _pineconeApiKey);
        request.Content = JsonContent.Create(new { vector = embedding, topK, includeMatches = true });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PineconeQueryResponse>(cancellationToken);

        return result?.Matches?
            .Select(match => Guid.TryParse(match.Id, out var id) ? id : (Guid?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList() ?? [];
    }

    private async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/embeddings");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _openAiApiKey);
        request.Content = JsonContent.Create(new { model = EmbeddingModel, input = text });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<OpenAiEmbeddingResponse>(cancellationToken);
        var embedding = result?.Data?.FirstOrDefault()?.Embedding;
        if (embedding is null || embedding.Length == 0) throw new InvalidOperationException("OpenAI returned no embedding.");
        return embedding;
    }

    private static string RequiredConfig(IConfiguration config, string key)
    {
        var value = config[key];
        return string.IsNullOrWhiteSpace(value) ? throw new InvalidOperationException($"Configuration '{key}' is required.") : value;
    }

    private static Uri RequiredUri(IConfiguration config, string key)
    {
        var value = RequiredConfig(config, key);
        return Uri.TryCreate(value, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp)
            ? uri
            : throw new InvalidOperationException($"Configuration '{key}' must be an absolute HTTP(S) URL.");
    }
}

public sealed record PineconeQueryResponse(
    [property: JsonPropertyName("matches")] List<PineconeMatch>? Matches);

public sealed record PineconeMatch(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("score")] float Score);

public sealed record OpenAiEmbeddingResponse(
    [property: JsonPropertyName("data")] List<OpenAiEmbeddingData>? Data);

public sealed record OpenAiEmbeddingData(
    [property: JsonPropertyName("embedding")] float[] Embedding);
