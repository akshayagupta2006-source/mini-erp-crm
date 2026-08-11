import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    { name: 'Admin User', email: 'admin@example.com', password, role: 'ADMIN' },
    { name: 'Sales User', email: 'sales@example.com', password, role: 'SALES' },
    { name: 'Warehouse User', email: 'warehouse@example.com', password, role: 'WAREHOUSE' },
    { name: 'Accounts User', email: 'accounts@example.com', password, role: 'ACCOUNTS' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role as any
      }
    });
  }

  // Find Admin
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });

  // Sample Customer
  if (admin) {
    const customer = await prisma.customer.create({
      data: {
        customerName: 'ABC Traders',
        mobile: '9876543210',
        businessName: 'ABC Wholesale',
        customerType: 'WHOLESALE',
        createdBy: admin.id
      }
    });

    // Sample Products
    const salt = await prisma.product.create({
      data: {
        name: 'Tata Salt',
        sku: 'TS001',
        category: 'Groceries',
        unitPrice: 30,
        currentStock: 100,
        minimumStock: 20,
        warehouse: 'Main Warehouse'
      }
    });

    const surf = await prisma.product.create({
      data: {
        name: 'Surf Excel',
        sku: 'SE002',
        category: 'Groceries',
        unitPrice: 50,
        currentStock: 50,
        minimumStock: 10,
        warehouse: 'Main Warehouse'
      }
    });
    
    // Sample Stock Movements
    await prisma.stockMovement.createMany({
      data: [
        { productId: salt.id, quantity: 100, movementType: 'IN', reason: 'Initial Stock', createdBy: admin.id },
        { productId: surf.id, quantity: 50, movementType: 'IN', reason: 'Initial Stock', createdBy: admin.id }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
