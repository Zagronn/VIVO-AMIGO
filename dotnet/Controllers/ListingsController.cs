using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VivoAmigo.Core.Entities;
using VivoAmigo.Core.Services;
using VivoAmigo.Infrastructure.Data;

namespace VivoAmigo.Api.Controllers;

[ApiController]
[Route("api/v1/listings")]
public sealed class ListingsController(VivoAmigoDbContext db, IVectorSearchService vectorSearch) : ControllerBase
{
    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyList<ListingSearchResult>>> Search(
        [FromQuery(Name = "q")] string? query,
        [FromQuery] string? category,
        [FromQuery] string? zone,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int topK = 20,
        CancellationToken cancellationToken = default)
    {
        if (topK is < 1 or > 100) return BadRequest(new { error = "topK must be between 1 and 100" });
        if (minPrice is < 0 || maxPrice is < 0 || minPrice > maxPrice) return BadRequest(new { error = "price range is invalid" });

        var filters = db.Listings.AsNoTracking().Where(listing => listing.Status == "ACTIVE");
        if (!string.IsNullOrWhiteSpace(category)) filters = filters.Where(listing => listing.Category.Slug == category || listing.Category.Name == category);
        if (!string.IsNullOrWhiteSpace(zone)) filters = filters.Where(listing => listing.Zone == zone);
        if (minPrice.HasValue) filters = filters.Where(listing => listing.Price >= minPrice.Value);
        if (maxPrice.HasValue) filters = filters.Where(listing => listing.Price <= maxPrice.Value);

        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(await filters.OrderByDescending(listing => listing.CreatedAt).Take(topK).Select(ListingSearchResult.From).ToListAsync(cancellationToken));
        }

        var semanticIds = await vectorSearch.SearchListingIdsAsync(query, topK, cancellationToken);
        if (semanticIds.Count == 0) return Ok(Array.Empty<ListingSearchResult>());

        var rank = semanticIds.Select((id, index) => new { id, index }).ToDictionary(item => item.id, item => item.index);
        var matches = await filters.Where(listing => semanticIds.Contains(listing.Id)).Select(ListingSearchResult.From).ToListAsync(cancellationToken);
        return Ok(matches.OrderBy(result => rank[result.Id]).ToList());
    }
}

public sealed record ListingSearchResult(Guid Id, string Title, decimal Price, string Currency, string? Zone, string Description, string Category, DateTime CreatedAt)
{
    public static System.Linq.Expressions.Expression<Func<Listing, ListingSearchResult>> From => listing => new(
        listing.Id,
        listing.Title,
        listing.Price,
        listing.Currency,
        listing.Zone,
        listing.Description,
        listing.Category.Slug,
        listing.CreatedAt);
}
