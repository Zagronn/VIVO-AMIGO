import { z } from 'zod';

/**
 * Only allow redirecting to a same-site relative path after login/register,
 * so a crafted `?next=` query string can't send a user off-site.
 */
export function safeRedirectPath(value: FormDataEntryValue | null | undefined): string {
  if (typeof value !== 'string') return '/products';
  if (!value.startsWith('/') || value.startsWith('//')) return '/products';
  return value;
}

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Missing product.'),
  rating: z.coerce.number().int().min(1, 'Rating must be 1-5.').max(5, 'Rating must be 1-5.'),
  comment: z.string().trim().min(1, 'Please write a short comment.').max(2000, 'Comment is too long.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const cartItemIdSchema = z.object({
  cartItemId: z.string().min(1),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const shipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required.'),
  carrier: z.string().trim().min(1).max(80).default('VIVO_LOGISTICS'),
});

export const applyVendorSchema = z.object({
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters.').max(120),
});

export const vendorIdSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required.'),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than 0.').max(1_000_000),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().min(1).optional().or(z.literal('')),
  imageUrl: z.string().trim().url('Enter a valid image URL.'),
});

// --- Classifieds -----------------------------------------------------------

export const createRealEstateListingSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than 0.').max(100_000_000),
  listingType: z.enum(['SALE', 'RENT']),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL']),
  bedrooms: z.coerce.number().int().min(0).max(50).optional().or(z.nan().transform(() => undefined)),
  bathrooms: z.coerce.number().int().min(0).max(50).optional().or(z.nan().transform(() => undefined)),
  areaSqm: z.coerce.number().int().positive().optional().or(z.nan().transform(() => undefined)),
  city: z.string().trim().min(2, 'City is required.').max(120),
  imageUrl: z.string().trim().url('Enter a valid image URL.'),
});

export const createVehicleListingSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than 0.').max(10_000_000),
  make: z.string().trim().min(1, 'Make is required.').max(80),
  model: z.string().trim().min(1, 'Model is required.').max(80),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
  condition: z.enum(['NEW', 'USED']),
  transmission: z.string().trim().max(40).optional().or(z.literal('')),
  fuelType: z.string().trim().max(40).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required.').max(120),
  imageUrl: z.string().trim().url('Enter a valid image URL.'),
});

export const createJobListingSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
  description: z.string().trim().min(10, 'Please add a longer description.').max(8000),
  company: z.string().trim().min(1, 'Company is required.').max(160),
  location: z.string().trim().min(1, 'Location is required.').max(160),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  salaryMin: z.coerce.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
  salaryMax: z.coerce.number().int().min(0).optional().or(z.nan().transform(() => undefined)),
  // Pass a real boolean in (e.g. `formData.get('remote') === 'on'`), not the
  // raw FormData string — z.coerce.boolean() would treat "false" as true.
  remote: z.boolean().optional().default(false),
});

export const createSecondHandListingSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than 0.').max(1_000_000),
  category: z.string().trim().min(2, 'Category is required.').max(80),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR']),
  city: z.string().trim().min(2, 'City is required.').max(120),
  imageUrl: z.string().trim().url('Enter a valid image URL.'),
});

export const listingIdSchema = z.object({
  id: z.string().min(1, 'Missing listing.'),
});

// --- VIVO POS ------------------------------------------------------------

export const createPosCatalogItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  price: z.coerce.number().positive('Price must be greater than 0.').max(1_000_000),
  imageUrl: z.string().trim().url('Enter a valid image URL.').optional().or(z.literal('')),
});

export const posCatalogItemIdSchema = z.object({
  id: z.string().min(1, 'Missing catalog item.'),
});

// A sale is submitted as one JSON blob (built client-side, possibly while
// offline) rather than individual FormData fields, since it's a variable-length
// cart. `clientSaleId` is generated on the device the moment the sale is made,
// so replaying this action after a dropped connection never double-books it.
const posSaleLineSchema = z.object({
  catalogItemId: z.string().min(1).optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(9999),
  unitPrice: z.coerce.number().nonnegative().max(1_000_000),
});

export const recordPosSaleSchema = z.object({
  // Both IDs are generated on the device at the moment of sale (not by the
  // server) so a sale logged while offline already has its final receipt
  // link before it ever reaches the network — see components/PosRegister.tsx.
  clientSaleId: z.string().trim().min(1, 'Missing sale ID.').max(100),
  receiptCode: z.string().trim().min(4, 'Missing receipt code.').max(40),
  items: z.array(posSaleLineSchema).min(1, 'Add at least one item to the sale.'),
  customerPhone: z.string().trim().max(30).optional().or(z.literal('')),
});

export const sendPosReceiptSmsSchema = z.object({
  receiptCode: z.string().trim().min(1, 'Missing receipt.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .max(20)
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number, e.g. +502 5555 5555.'),
});

// --- Contact -----------------------------------------------------------

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(160),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  subject: z.string().trim().min(2, 'Subject is required.').max(200),
  message: z.string().trim().min(10, 'Please write a bit more.').max(5000),
});
