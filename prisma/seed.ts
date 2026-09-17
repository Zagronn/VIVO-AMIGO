import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('Seeding VIVO AMIGO (multi-vendor) database...');

  // --- Users -------------------------------------------------------------
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const adminPasswordHash = await bcrypt.hash('admin1234', 10);

  const admin = await db.user.upsert({
    where: { email: 'admin@vivoamigo.com' },
    update: {},
    create: { email: 'admin@vivoamigo.com', name: 'VIVO Admin', passwordHash: adminPasswordHash, role: 'ADMIN' },
  });

  const demo = await db.user.upsert({
    where: { email: 'demo@vivoamigo.com' },
    update: {},
    create: { email: 'demo@vivoamigo.com', name: 'Demo Customer', passwordHash, role: 'CUSTOMER' },
  });

  const maria = await db.user.upsert({
    where: { email: 'maria@vivoamigo.com' },
    update: {},
    create: { email: 'maria@vivoamigo.com', name: 'Maria Lopez', passwordHash, role: 'CUSTOMER' },
  });

  const carlosUser = await db.user.upsert({
    where: { email: 'carlos.vendor@vivoamigo.com' },
    update: {},
    create: { email: 'carlos.vendor@vivoamigo.com', name: 'Carlos Mendez', passwordHash, role: 'VENDOR' },
  });
  const carlosVendor = await db.vendorProfile.upsert({
    where: { userId: carlosUser.id },
    update: {},
    create: { userId: carlosUser.id, storeName: 'Casa Textiles GT', status: 'ACTIVE' },
  });

  const anaUser = await db.user.upsert({
    where: { email: 'ana.vendor@vivoamigo.com' },
    update: {},
    create: { email: 'ana.vendor@vivoamigo.com', name: 'Ana Ramirez', passwordHash, role: 'VENDOR' },
  });
  const anaVendor = await db.vendorProfile.upsert({
    where: { userId: anaUser.id },
    update: {},
    create: { userId: anaUser.id, storeName: 'Volcan Beauty Co', status: 'ACTIVE' },
  });

  const pendingUser = await db.user.upsert({
    where: { email: 'pending.vendor@vivoamigo.com' },
    update: {},
    create: { email: 'pending.vendor@vivoamigo.com', name: 'Jorge Castillo', passwordHash, role: 'VENDOR' },
  });
  await db.vendorProfile.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: { userId: pendingUser.id, storeName: 'Nuevo Mercado', status: 'PENDING' },
  });

  const suspendedUser = await db.user.upsert({
    where: { email: 'suspended.vendor@vivoamigo.com' },
    update: {},
    create: { email: 'suspended.vendor@vivoamigo.com', name: 'Old Shop Owner', passwordHash, role: 'VENDOR' },
  });
  await db.vendorProfile.upsert({
    where: { userId: suspendedUser.id },
    update: {},
    create: { userId: suspendedUser.id, storeName: 'Old Shop', status: 'SUSPENDED' },
  });

  // --- Categories ----------------------------------------------------------
  const categoryData = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Beauty', slug: 'beauty' },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categories[c.slug] = cat.id;
  }

  // --- Products (spread across the two active vendors) --------------------
  const productData = [
    { title: 'Wireless Earbuds Pro', price: 49.99, stockQuantity: 50, categorySlug: 'electronics', vendorId: carlosVendor.id, image: 'vivo-earbuds' },
    { title: 'Smart Home Speaker', price: 79.99, stockQuantity: 30, categorySlug: 'electronics', vendorId: carlosVendor.id, image: 'vivo-speaker' },
    { title: 'Ceramic Pour-Over Set', price: 34.99, stockQuantity: 40, categorySlug: 'home-living', vendorId: carlosVendor.id, image: 'vivo-coffee' },
    { title: 'Woven Throw Blanket', price: 54.99, stockQuantity: 25, categorySlug: 'home-living', vendorId: carlosVendor.id, image: 'vivo-blanket' },
    { title: 'Embroidered Linen Shirt', price: 42.99, stockQuantity: 60, categorySlug: 'fashion', vendorId: carlosVendor.id, image: 'vivo-shirt' },
    { title: 'Leather Crossbody Bag', price: 89.99, stockQuantity: 20, categorySlug: 'fashion', vendorId: carlosVendor.id, image: 'vivo-bag' },
    { title: 'Botanical Face Serum', price: 27.99, stockQuantity: 80, categorySlug: 'beauty', vendorId: anaVendor.id, image: 'vivo-serum' },
    { title: 'Volcanic Clay Mask', price: 19.99, stockQuantity: 90, categorySlug: 'beauty', vendorId: anaVendor.id, image: 'vivo-mask' },
    { title: 'Rose Quartz Facial Roller', price: 15.99, stockQuantity: 70, categorySlug: 'beauty', vendorId: anaVendor.id, image: 'vivo-roller' },
  ];

  const products: { id: string; price: number }[] = [];
  for (const p of productData) {
    const product = await db.product.upsert({
      where: { id: `${p.image}-seed` },
      update: {},
      create: {
        id: `${p.image}-seed`,
        title: p.title,
        description: `${p.title} — a VIVO AMIGO marketplace favorite.`,
        price: p.price,
        stockQuantity: p.stockQuantity,
        categoryId: categories[p.categorySlug],
        vendorId: p.vendorId,
        images: [`https://picsum.photos/seed/${p.image}/800/600`],
      },
    });
    products.push({ id: product.id, price: p.price });
  }

  // --- A sample review -------------------------------------------------------
  await db.review.upsert({
    where: { userId_productId: { userId: demo.id, productId: products[0].id } },
    update: {},
    create: { userId: demo.id, productId: products[0].id, rating: 5, comment: 'Sound quality is excellent and the battery really lasts all day.' },
  });

  // --- Orders across every status, spread over the last 14 days -----------
  // so the admin dashboard's charts have real variation to show.
  type SeedOrder = { customerId: string; daysBack: number; status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'; items: { productIdx: number; qty: number }[] };
  const seedOrders: SeedOrder[] = [
    { customerId: demo.id, daysBack: 13, status: 'COMPLETED', items: [{ productIdx: 0, qty: 1 }, { productIdx: 2, qty: 1 }] },
    { customerId: maria.id, daysBack: 12, status: 'COMPLETED', items: [{ productIdx: 6, qty: 2 }] },
    { customerId: demo.id, daysBack: 10, status: 'SHIPPED', items: [{ productIdx: 4, qty: 1 }] },
    { customerId: maria.id, daysBack: 9, status: 'COMPLETED', items: [{ productIdx: 1, qty: 1 }] },
    { customerId: demo.id, daysBack: 7, status: 'CANCELLED', items: [{ productIdx: 5, qty: 1 }] },
    { customerId: maria.id, daysBack: 6, status: 'PAID', items: [{ productIdx: 7, qty: 3 }] },
    { customerId: demo.id, daysBack: 5, status: 'COMPLETED', items: [{ productIdx: 3, qty: 1 }, { productIdx: 8, qty: 1 }] },
    { customerId: maria.id, daysBack: 4, status: 'SHIPPED', items: [{ productIdx: 0, qty: 1 }] },
    { customerId: demo.id, daysBack: 3, status: 'PAID', items: [{ productIdx: 6, qty: 1 }] },
    { customerId: maria.id, daysBack: 2, status: 'PENDING', items: [{ productIdx: 2, qty: 2 }] },
    { customerId: demo.id, daysBack: 1, status: 'COMPLETED', items: [{ productIdx: 8, qty: 2 }] },
    { customerId: maria.id, daysBack: 0, status: 'PAID', items: [{ productIdx: 1, qty: 1 }] },
  ];

  for (const so of seedOrders) {
    const createdAt = daysAgo(so.daysBack);
    const totalAmount = so.items.reduce((sum, it) => sum + products[it.productIdx].price * it.qty, 0);

    const order = await db.order.create({
      data: {
        customerId: so.customerId,
        totalAmount,
        status: so.status,
        createdAt,
        orderItems: {
          create: so.items.map((it) => ({
            productId: products[it.productIdx].id,
            quantity: it.qty,
            unitPrice: products[it.productIdx].price,
          })),
        },
      },
    });

    if (so.status !== 'PENDING' && so.status !== 'CANCELLED') {
      await db.payment.create({
        data: {
          orderId: order.id,
          paymentGateway: 'STRIPE_MOCK',
          status: 'SUCCESS',
          amount: totalAmount,
          createdAt,
        },
      });
    }

    if (so.status === 'SHIPPED' || so.status === 'COMPLETED') {
      await db.shipment.create({
        data: {
          orderId: order.id,
          carrier: 'VIVO_LOGISTICS',
          trackingCode: `TRK-SEED${order.id.slice(0, 6).toUpperCase()}`,
          status: so.status === 'COMPLETED' ? 'DELIVERED' : 'DISPATCHED',
        },
      });
    }
  }

  // --- Classifieds: real estate ------------------------------------------
  const realEstateData = [
    { id: 'real-estate-seed-1', ownerId: carlosUser.id, title: 'Modern 3BR House in Zona 14', price: 185000, listingType: 'SALE' as const, propertyType: 'HOUSE' as const, bedrooms: 3, bathrooms: 2, areaSqm: 210, city: 'Guatemala City', image: 'vivo-house-1' },
    { id: 'real-estate-seed-2', ownerId: anaUser.id, title: 'Cozy 2BR Apartment near Antigua', price: 650, listingType: 'RENT' as const, propertyType: 'APARTMENT' as const, bedrooms: 2, bathrooms: 1, areaSqm: 85, city: 'Antigua Guatemala', image: 'vivo-apt-1' },
    { id: 'real-estate-seed-3', ownerId: demo.id, title: 'Commercial Lot on Main Avenue', price: 95000, listingType: 'SALE' as const, propertyType: 'LAND' as const, bedrooms: null, bathrooms: null, areaSqm: 500, city: 'Quetzaltenango', image: 'vivo-land-1' },
  ];
  for (const r of realEstateData) {
    await db.realEstateListing.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        ownerId: r.ownerId,
        title: r.title,
        description: `${r.title} — listed on VIVO AMIGO real estate.`,
        price: r.price,
        listingType: r.listingType,
        propertyType: r.propertyType,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms,
        areaSqm: r.areaSqm,
        city: r.city,
        images: [`https://picsum.photos/seed/${r.image}/800/600`],
      },
    });
  }

  // --- Classifieds: vehicles -----------------------------------------------
  const vehicleData = [
    { id: 'vehicle-seed-1', ownerId: carlosUser.id, title: '2021 Toyota Corolla', price: 16500, make: 'Toyota', model: 'Corolla', year: 2021, mileageKm: 42000, condition: 'USED' as const, transmission: 'Automatic', fuelType: 'Gasoline', city: 'Guatemala City', image: 'vivo-car-1' },
    { id: 'vehicle-seed-2', ownerId: anaUser.id, title: '2024 Honda CB500 Motorcycle', price: 7200, make: 'Honda', model: 'CB500', year: 2024, mileageKm: 500, condition: 'NEW' as const, transmission: 'Manual', fuelType: 'Gasoline', city: 'Antigua Guatemala', image: 'vivo-moto-1' },
    { id: 'vehicle-seed-3', ownerId: maria.id, title: '2019 Ford Ranger Pickup', price: 22000, make: 'Ford', model: 'Ranger', year: 2019, mileageKm: 68000, condition: 'USED' as const, transmission: 'Automatic', fuelType: 'Diesel', city: 'Escuintla', image: 'vivo-truck-1' },
  ];
  for (const v of vehicleData) {
    await db.vehicleListing.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        ownerId: v.ownerId,
        title: v.title,
        description: `${v.title} — listed on VIVO AMIGO vehicles.`,
        price: v.price,
        make: v.make,
        model: v.model,
        year: v.year,
        mileageKm: v.mileageKm,
        condition: v.condition,
        transmission: v.transmission,
        fuelType: v.fuelType,
        city: v.city,
        images: [`https://picsum.photos/seed/${v.image}/800/600`],
      },
    });
  }

  // --- Classifieds: jobs ----------------------------------------------------
  const jobData = [
    { id: 'job-seed-1', posterId: carlosUser.id, title: 'Frontend Developer', company: 'Casa Textiles GT', location: 'Guatemala City', employmentType: 'FULL_TIME' as const, salaryMin: 1800, salaryMax: 2600, remote: false },
    { id: 'job-seed-2', posterId: anaUser.id, title: 'Customer Support Specialist', company: 'Volcan Beauty Co', location: 'Remote', employmentType: 'PART_TIME' as const, salaryMin: 700, salaryMax: 1000, remote: true },
    { id: 'job-seed-3', posterId: admin.id, title: 'Delivery Driver', company: 'VIVO SHIP', location: 'Antigua Guatemala', employmentType: 'CONTRACT' as const, salaryMin: 900, salaryMax: 1400, remote: false },
  ];
  for (const j of jobData) {
    await db.jobListing.upsert({
      where: { id: j.id },
      update: {},
      create: {
        id: j.id,
        posterId: j.posterId,
        title: j.title,
        description: `We're hiring a ${j.title} to join ${j.company}. Apply through VIVO AMIGO jobs.`,
        company: j.company,
        location: j.location,
        employmentType: j.employmentType,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        remote: j.remote,
      },
    });
  }

  // --- Classifieds: second-hand ---------------------------------------------
  const secondHandData = [
    { id: 'secondhand-seed-1', sellerId: demo.id, title: 'IKEA Study Desk', price: 45, category: 'Furniture', condition: 'GOOD' as const, city: 'Guatemala City', image: 'vivo-desk-1' },
    { id: 'secondhand-seed-2', sellerId: maria.id, title: 'iPhone 12, 128GB', price: 320, category: 'Electronics', condition: 'LIKE_NEW' as const, city: 'Quetzaltenango', image: 'vivo-phone-1' },
    { id: 'secondhand-seed-3', sellerId: carlosUser.id, title: 'Mountain Bike, size M', price: 150, category: 'Sports', condition: 'FAIR' as const, city: 'Antigua Guatemala', image: 'vivo-bike-1' },
  ];
  for (const s of secondHandData) {
    await db.secondHandListing.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        sellerId: s.sellerId,
        title: s.title,
        description: `${s.title} — used, in ${s.condition.toLowerCase().replace('_', ' ')} condition.`,
        price: s.price,
        category: s.category,
        condition: s.condition,
        city: s.city,
        images: [`https://picsum.photos/seed/${s.image}/800/600`],
      },
    });
  }

  console.log('Seed complete.');
  console.log('  Admin login:              admin@vivoamigo.com / admin1234');
  console.log('  Customer logins:           demo@vivoamigo.com / demo1234, maria@vivoamigo.com / demo1234');
  console.log('  Active vendor logins:      carlos.vendor@vivoamigo.com / demo1234, ana.vendor@vivoamigo.com / demo1234');
  console.log('  Pending vendor login:      pending.vendor@vivoamigo.com / demo1234');
  console.log('  Suspended vendor login:    suspended.vendor@vivoamigo.com / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
