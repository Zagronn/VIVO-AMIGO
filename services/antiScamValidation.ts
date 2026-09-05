export interface SellerDocumentStatus {
  userId: string;
  hasCompanyRegistration: boolean;
  hasNotaryDocument: boolean;
  isListingActive: boolean;
  reviewNote: string;
}

export function validateListingForAntiScam(seller: SellerDocumentStatus, isCorporateListing: boolean): SellerDocumentStatus {
  if (isCorporateListing && (!seller.hasCompanyRegistration || !seller.hasNotaryDocument)) {
    return {
      ...seller,
      isListingActive: false,
      reviewNote: 'PENDING_APPROVAL: Documentos notariales o registros empresa requeridos.'
    };
  }

  return {
    ...seller,
    isListingActive: true,
    reviewNote: 'APPROVED: Verificación completa.'
  };
}
