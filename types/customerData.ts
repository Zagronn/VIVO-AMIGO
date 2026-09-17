export interface CustomerProfile {
  customerId: string;
  fullName: string;
  email: string;
  preferredLocale: string;
  phone?: string;
  createdAt: string;
}

export interface CustomerOrders {
  orderId: string;
  customerId: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  totalGTQ: number;
  category: string;
  createdAt: string;
}

export interface CustomerWallet {
  walletId: string;
  customerId: string;
  balanceGTQ: number;
  escrowHeldGTQ: number;
  rewardPoints: number;
  lastActivityAt: string;
}

export interface CustomerReviews {
  reviewId: string;
  customerId: string;
  listingId: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface CustomerStatistics {
  totalSpendGTQ: number;
  averageOrderGTQ: number;
  activeOrderCount: number;
  rewardPoints: number;
  preferredCategories: Array<{ category: string; orderCount: number }>;
}

export interface CustomerKnowledgeBase {
  profile: CustomerProfile;
  orders: CustomerOrders[];
  wallet: CustomerWallet;
  favorites: string[];
  reviews: CustomerReviews[];
  statistics: CustomerStatistics;
}
