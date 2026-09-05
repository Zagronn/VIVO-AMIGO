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
