import type { CustomerKnowledgeBase, CustomerOrders, CustomerStatistics } from '../types/customerData';

const customerOrders: CustomerOrders[] = [
  { orderId: 'ORD-1001', customerId: 'customer-demo', status: 'COMPLETED', totalGTQ: 1280, category: 'Electrónica', createdAt: '2026-09-09' },
  { orderId: 'ORD-1002', customerId: 'customer-demo', status: 'SHIPPED', totalGTQ: 850, category: 'Hogar', createdAt: '2026-09-08' },
  { orderId: 'ORD-1003', customerId: 'customer-demo', status: 'PENDING', totalGTQ: 450, category: 'Agricultura', createdAt: '2026-09-09' }
];

export function getCustomerStatistics(customerId = 'customer-demo'): CustomerStatistics {
  const orders = customerOrders.filter((order) => order.customerId === customerId);
  const totalSpendGTQ = orders.filter((order) => order.status !== 'CANCELLED' && order.status !== 'REFUNDED').reduce((sum, order) => sum + order.totalGTQ, 0);
  const categoryCounts = new Map<string, number>();
  orders.forEach((order) => categoryCounts.set(order.category, (categoryCounts.get(order.category) || 0) + 1));
  return { totalSpendGTQ, averageOrderGTQ: orders.length ? totalSpendGTQ / orders.length : 0, activeOrderCount: orders.filter((order) => ['PENDING', 'PAID', 'SHIPPED'].includes(order.status)).length, rewardPoints: Math.floor(totalSpendGTQ / 10), preferredCategories: [...categoryCounts.entries()].map(([category, orderCount]) => ({ category, orderCount })) };
}

export function getCustomerKnowledgeBase(customerId = 'customer-demo'): CustomerKnowledgeBase {
  return { profile: { customerId, fullName: 'Cliente Demo', email: 'customer@vivoamigo.com', preferredLocale: 'es', createdAt: '2026-01-12' }, orders: customerOrders.filter((order) => order.customerId === customerId), wallet: { walletId: 'wallet-customer-demo', customerId, balanceGTQ: 3200, escrowHeldGTQ: 850, rewardPoints: getCustomerStatistics(customerId).rewardPoints, lastActivityAt: '2026-09-09' }, favorites: ['toyota-hilux-2022', 'macbook-pro-m3'], reviews: [], statistics: getCustomerStatistics(customerId) };
}
