import type { SellerDocumentStatus } from './antiScamValidation';
import { validateListingForAntiScam } from './antiScamValidation';

export function autoDeactivateUnverifiedCorporateListing(
  seller: SellerDocumentStatus,
  isCorporateListing: boolean
): SellerDocumentStatus {
  return validateListingForAntiScam(seller, isCorporateListing);
}
