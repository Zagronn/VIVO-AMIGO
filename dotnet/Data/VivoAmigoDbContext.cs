using Microsoft.EntityFrameworkCore;
using VivoAmigo.Core.Entities;

namespace VivoAmigo.Infrastructure.Data;

public sealed class VivoAmigoDbContext(DbContextOptions<VivoAmigoDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CategoryAttribute> CategoryAttributes => Set<CategoryAttribute>();
    public DbSet<Listing> Listings => Set<Listing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("categories");
            entity.HasKey(category => category.Id);
            entity.Property(category => category.Name).HasMaxLength(160).IsRequired();
            entity.Property(category => category.Slug).HasMaxLength(180).IsRequired();
            entity.HasIndex(category => category.Slug).IsUnique();
            entity.HasOne(category => category.ParentCategory)
                .WithMany(category => category.SubCategories)
                .HasForeignKey(category => category.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CategoryAttribute>(entity =>
        {
            entity.ToTable("category_attributes");
            entity.HasKey(attribute => attribute.Id);
            entity.Property(attribute => attribute.KeyName).HasMaxLength(120).IsRequired();
            entity.Property(attribute => attribute.DataType).HasMaxLength(20).HasDefaultValue("STRING");
            entity.HasIndex(attribute => new { attribute.CategoryId, attribute.KeyName }).IsUnique();
            entity.HasOne(attribute => attribute.Category)
                .WithMany(category => category.Attributes)
                .HasForeignKey(attribute => attribute.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Listing>(entity =>
        {
            entity.ToTable("listings");
            entity.HasKey(listing => listing.Id);
            entity.Property(listing => listing.Title).HasMaxLength(240).IsRequired();
            entity.Property(listing => listing.Price).HasPrecision(18, 2);
            entity.Property(listing => listing.Currency).HasMaxLength(3).HasDefaultValue("GTQ");
            entity.Property(listing => listing.Zone).HasMaxLength(160);
            entity.Property(listing => listing.Description).HasDefaultValue(string.Empty);
            entity.Property(listing => listing.Status).HasMaxLength(20).HasDefaultValue("ACTIVE");
            entity.Property(listing => listing.SpecificationsJson).HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
            entity.Property(listing => listing.CreatedAt).HasColumnName("created_at");
            entity.HasIndex(listing => new { listing.CategoryId, listing.Price });
            entity.HasOne(listing => listing.Category)
                .WithMany(category => category.Listings)
                .HasForeignKey(listing => listing.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
