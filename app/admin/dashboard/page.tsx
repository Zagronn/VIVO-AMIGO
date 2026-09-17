import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { approveVendor, suspendVendor } from '@/actions/vendors';
import type { OrderStatus, VendorStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Order lifecycle stages that are genuinely good/bad outcomes borrow the
// dataviz skill's reserved status palette; the two "still in progress"
// stages use plain categorical hues so they never impersonate a status.
// See dataviz skill references/palette.md (dark-mode slots, validated).
const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'var(--viz-warning)' },
  PAID: { label: 'Paid', color: 'var(--viz-blue)' },
  SHIPPED: { label: 'Shipped', color: 'var(--viz-violet)' },
  COMPLETED: { label: 'Completed', color: 'var(--viz-good)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--viz-critical)' },
};

const VENDOR_STATUS_META: Record<VendorStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending review', color: 'var(--viz-warning)' },
  ACTIVE: { label: 'Active', color: 'var(--viz-good)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--viz-critical)' },
};

function StatusChip({ status }: { status: keyof typeof ORDER_STATUS_META }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span className="admin-chip">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}

function VendorStatusChip({ status }: { status: keyof typeof VENDOR_STATUS_META }) {
  const meta = VENDOR_STATUS_META[status];
  return (
    <span className="admin-chip">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/dashboard');
  if (user.role !== 'ADMIN') redirect('/');

  const [vendors, orders, customerCount, productCount] = await Promise.all([
    db.vendorProfile.findMany({
      include: { user: true, products: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.order.findMany({
      include: { customer: true, orderItems: true, payment: true, shipment: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.product.count(),
  ]);

  const revenueOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'COMPLETED');
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.totalAmount.toString()), 0);

  const pendingVendors = vendors.filter((v) => v.status === 'PENDING');
  const activeVendors = vendors.filter((v) => v.status === 'ACTIVE');
  const suspendedVendors = vendors.filter((v) => v.status === 'SUSPENDED');

  const statusCounts: Record<OrderStatus, number> = {
    PENDING: 0,
    PAID: 0,
    SHIPPED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const o of orders) statusCounts[o.status]++;
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  // Revenue for the last 7 days, oldest first, for the trend chart.
  const days: { key: string; label: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ key: dayKey(d), label: dayLabel(d), date: d });
  }
  const revenueByDay = days.map((d) => {
    const dayTotal = revenueOrders
      .filter((o) => dayKey(new Date(o.createdAt)) === d.key)
      .reduce((sum, o) => sum + Number(o.totalAmount.toString()), 0);
    return { ...d, value: dayTotal };
  });
  const maxDayRevenue = Math.max(1, ...revenueByDay.map((d) => d.value));

  const recentOrders = orders.slice(0, 10);

  const stats = [
    { label: 'Revenue', value: formatPrice(totalRevenue), sub: `${revenueOrders.length} paid orders`, color: 'var(--viz-blue)' },
    { label: 'Orders', value: String(orders.length), sub: `${statusCounts.PENDING} awaiting payment`, color: 'var(--viz-aqua)' },
    { label: 'Active vendors', value: String(activeVendors.length), sub: `${vendors.length} total sellers`, color: 'var(--viz-violet)' },
    { label: 'Pending applications', value: String(pendingVendors.length), sub: 'need a decision', color: 'var(--viz-warning)' },
    { label: 'Customers', value: String(customerCount), sub: `${productCount} products listed`, color: 'var(--viz-magenta)' },
  ];

  return (
    <div className="admin-shell min-h-screen w-full pb-24 pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Super admin</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Command center</h1>
            <p className="mt-1 text-sm text-white/50">Live view of revenue, orders, and the seller marketplace.</p>
          </div>
          <Link href="/products" className="admin-btn">
            ← Back to storefront
          </Link>
        </div>

        {/* Stat tiles */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="admin-glass admin-glass-hover p-5">
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
              />
              <p className="text-xs uppercase tracking-wide text-white/45">{s.label}</p>
              <p className="mt-2 text-2xl font-bold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-white/40">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Revenue trend — sequential single-hue bar chart, single series (no legend needed). */}
          <div className="admin-glass p-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Revenue, last 7 days</h2>
              <span className="text-xs text-white/40">USD</span>
            </div>
            <div className="mt-6 flex h-40 items-end gap-3">
              {revenueByDay.map((d) => {
                const heightPct = Math.max(4, Math.round((d.value / maxDayRevenue) * 100));
                return (
                  <div key={d.key} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-32 w-full items-end justify-center">
                      <div
                        className="w-full max-w-[28px] rounded-t-[4px] transition-all duration-300"
                        style={{ height: `${heightPct}%`, backgroundColor: 'var(--viz-blue)' }}
                      />
                      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0d0d0d] px-2 py-1 text-[11px] font-semibold opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                        {formatPrice(d.value)}
                      </div>
                    </div>
                    <span className="text-[11px] text-white/40">{d.label}</span>
                  </div>
                );
              })}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-white/40 hover:text-white/70">View as table</summary>
              <table className="mt-3 w-full text-left text-xs">
                <thead className="text-white/40">
                  <tr>
                    <th className="py-1 pr-4 font-medium">Day</th>
                    <th className="py-1 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {revenueByDay.map((d) => (
                    <tr key={d.key}>
                      <td className="py-1.5 pr-4 text-white/70">{d.label}</td>
                      <td className="py-1.5 font-medium">{formatPrice(d.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>

          {/* Order status breakdown — categorical + status colors, direct-labeled. */}
          <div className="admin-glass p-6 lg:col-span-2">
            <h2 className="font-bold">Orders by status</h2>
            <div className="mt-6 space-y-4">
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => {
                const meta = ORDER_STATUS_META[status];
                const count = statusCounts[status];
                const widthPct = Math.max(3, Math.round((count / maxStatusCount) * 100));
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vendor approval queue */}
        <div className="admin-glass mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Seller applications</h2>
            <span className="admin-chip">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--viz-warning)' }} />
              {pendingVendors.length} pending
            </span>
          </div>

          {pendingVendors.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">No pending applications right now.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingVendors.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div>
                    <p className="font-semibold">{v.storeName}</p>
                    <p className="text-xs text-white/40">
                      {v.user.name} · {v.user.email} · applied {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={approveVendor}>
                      <input type="hidden" name="vendorId" value={v.id} />
                      <button type="submit" className="admin-btn-primary">
                        Approve
                      </button>
                    </form>
                    <form action={suspendVendor}>
                      <input type="hidden" name="vendorId" value={v.id} />
                      <button type="submit" className="admin-btn-danger">
                        Reject
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Active sellers ({activeVendors.length})
              </h3>
              <ul className="space-y-2">
                {activeVendors.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{v.storeName}</p>
                      <p className="text-xs text-white/40">{v.products.length} products</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <VendorStatusChip status="ACTIVE" />
                      <form action={suspendVendor}>
                        <input type="hidden" name="vendorId" value={v.id} />
                        <button type="submit" className="text-xs font-semibold text-white/40 hover:text-[var(--viz-critical)]">
                          Suspend
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
                {activeVendors.length === 0 && <p className="text-sm text-white/30">None yet.</p>}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Suspended ({suspendedVendors.length})
              </h3>
              <ul className="space-y-2">
                {suspendedVendors.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                  >
                    <p className="text-sm font-medium">{v.storeName}</p>
                    <div className="flex items-center gap-2">
                      <VendorStatusChip status="SUSPENDED" />
                      <form action={approveVendor}>
                        <input type="hidden" name="vendorId" value={v.id} />
                        <button type="submit" className="text-xs font-semibold text-white/40 hover:text-[var(--viz-good)]">
                          Reinstate
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
                {suspendedVendors.length === 0 && <p className="text-sm text-white/30">None.</p>}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="admin-glass mt-6 overflow-x-auto p-6">
          <h2 className="font-bold">Recent orders</h2>
          <table className="mt-4 w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-white/40">
              <tr>
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Items</th>
                <th className="py-2 pr-4 font-medium">Total</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Shipment</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="text-white/80">
                  <td className="py-3 pr-4 font-mono text-xs text-white/50">#{order.id.slice(-8)}</td>
                  <td className="py-3 pr-4">{order.customer.name}</td>
                  <td className="py-3 pr-4">{order.orderItems.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="py-3 pr-4 font-medium">{formatPrice(order.totalAmount)}</td>
                  <td className="py-3 pr-4">
                    <StatusChip status={order.status} />
                  </td>
                  <td className="py-3 pr-4 text-xs text-white/40">
                    {order.shipment ? order.shipment.trackingCode : '—'}
                  </td>
                  <td className="py-3">
                    <Link href={`/orders/${order.id}`} className="text-xs font-semibold text-[var(--viz-blue)] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/30">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
