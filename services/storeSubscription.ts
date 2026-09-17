export type StoreType = 'REAL_ESTATE_AGENT' | 'VEHICLE_DEALER' | 'GENERAL_SELLER';

export interface StoreSubscriptionPlan {
  storeOwnerId: string;
  storeType: StoreType;
  monthlyFeeGTQ: number;
  isActive: boolean;
  nextBillingDate: string;
}

export interface SubscriptionStatus {
  canPostListing: boolean;
  statusMessage: string;
}

export type ListingCategory = 'REAL_ESTATE' | 'VEHICLE' | 'GENERAL';

export const MONTHLY_STORE_RENTAL_GTQ = 50.00;

export function checkStorePostingEligibility(subscription: StoreSubscriptionPlan): SubscriptionStatus {
  if (!subscription.isActive) {
    return {
      canPostListing: false,
      statusMessage: `Su suscripción mensual de Q${MONTHLY_STORE_RENTAL_GTQ.toFixed(2)} está vencida. Por favor, renueve su tienda para publicar nuevos inmuebles o vehículos.`
    };
  }

  return {
    canPostListing: true,
    statusMessage: `Tienda activa. Próximo cobro de Q${MONTHLY_STORE_RENTAL_GTQ.toFixed(2)} el ${subscription.nextBillingDate}.`
  };
}

export function canPostNewListing(category: ListingCategory, subscription: StoreSubscriptionPlan): SubscriptionStatus {
  if (category !== 'REAL_ESTATE' && category !== 'VEHICLE') {
    return { canPostListing: true, statusMessage: 'Este tipo de anuncio no requiere renta mensual de tienda.' };
  }
  return checkStorePostingEligibility(subscription);
}
