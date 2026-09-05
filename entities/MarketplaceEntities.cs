namespace VivoAmigo.Core.Entities;

public sealed class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<CategoryAttribute> Attributes { get; set; } = new List<CategoryAttribute>();
    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}

public sealed class CategoryAttribute
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string KeyName { get; set; } = null!;
    public string DataType { get; set; } = "STRING";
    public bool IsFilterable { get; set; } = true;
}

public sealed class Listing
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = null!;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "GTQ";
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Persist this property as PostgreSQL JSONB through the EF Core provider.
    public string SpecificationsJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
