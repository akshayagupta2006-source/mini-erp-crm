# Mini ERP + CRM Operations Portal

A full-stack, production-ready internal business application for wholesale/distribution companies, built with React, Node.js, Express, and PostgreSQL (via Prisma).

## Features

- **Role-Based Access Control:** ADMIN, SALES, WAREHOUSE, ACCOUNTS roles with specific access levels.
- **CRM / Customer Management:** Track leads, active customers, and follow-up notes.
- **Inventory Management:** Track products, set minimum stock alerts, and manage stock IN/OUT movements with an immutable history.
- **Sales Challans:** Multi-step workflow to create draft challans and confirm them. Confirming a challan automatically and atomically reduces stock using PostgreSQL transactions to prevent negative stock.
- **Dashboard:** At-a-glance view of total customers, low stock alerts, and confirmed challans.

## Tech Stack

### Frontend
- **React (Vite)** + TypeScript
- **Styling:** Vanilla CSS (custom design system, no Tailwind)
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend
- **Node.js** + **Express.js** + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT (JSON Web Tokens) + bcrypt

---

## Database Design

- **User**: Stores employee credentials and roles.
- **Customer**: Stores customer information (Retail, Wholesale, Distributor) and CRM status (Lead, Active, Inactive).
- **CustomerFollowUp**: One-to-many relationship tracking CRM notes per customer.
- **Product**: Inventory items with SKU, unit price, current stock, and minimum stock threshold.
- **StockMovement**: Immutable log of stock IN/OUT changes with reasons.
- **Challan**: Sales orders holding status (DRAFT, CONFIRMED, CANCELLED).
- **ChallanItem**: Line items for Challans, storing product ID and **snapshots** of product name, SKU, and price to preserve historical accuracy even if the product changes later.

## Role Permissions

- **ADMIN**: Full access to everything.
- **SALES**: Can manage customers, create challans, and view inventory (cannot modify stock directly).
- **WAREHOUSE**: Can manage products and stock, view challans (cannot manage users or create challans).
- **ACCOUNTS**: Read-only access across customers, products, and challans.

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g. local instance or Neon)

### 1. Database Setup
Ensure you have a PostgreSQL database running. Get your connection string (e.g., `postgresql://user:password@localhost:5432/erp?schema=public`).

### 2. Backend Setup
```bash
cd server
npm install

# Configure Environment Variables
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET

# Run Migrations & Seed Data
npx prisma generate
npx prisma db push
npm run prisma:seed # (Assuming added to package.json, or: npx ts-node prisma/seed.ts)

# Start Backend Server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Frontend Development Server
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## Test Credentials

The database is seeded with test accounts for all four roles. The password for all accounts is: `password123`

- **Admin:** `admin@example.com`
- **Sales:** `sales@example.com`
- **Warehouse:** `warehouse@example.com`
- **Accounts:** `accounts@example.com`

---

## Deployment Instructions

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `client`.
4. Add Environment Variable: `VITE_API_URL` pointing to your backend URL (e.g. `https://my-erp-backend.onrender.com/api`).
5. Deploy.

### Backend (Render)
1. Create a new Web Service on Render.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install && npx prisma generate && npm run build`
4. Set Start Command: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL` (Your Neon Postgres string)
   - `JWT_SECRET` (A secure random string)
   - `CLIENT_URL` (Your Vercel frontend URL, for CORS)

### Database (Neon PostgreSQL)
1. Create a project in Neon.
2. Copy the connection string into your Render backend Environment Variables.
3. You can push the schema from your local machine using: `npx prisma db push` with your Neon `DATABASE_URL`.

---

## Business Logic Highlights

- **Stock Validation & Transactions:** When a Sales user confirms a draft challan, the backend initiates a Prisma `$transaction`. It iterates through all requested items, checking `currentStock`. If *any* product has insufficient stock, an error is thrown, the transaction is rolled back, and no stock is changed. If successful, stock is decremented and `OUT` StockMovements are created automatically.
- **Product Snapshots:** `ChallanItem` saves `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot`. If a product's price or name is changed months later, old challans will still reflect the information as it was at the time of sale.

## Known Limitations

- Due to environment constraints during agent development, the database provider was strictly written for PostgreSQL but local development testing might require manual Postgres setup on the host machine.
- Pagination is implemented in the API (using `skip`/`take`) and returns total pages, but the frontend currently fetches `limit=1000` to simplify the table views. A full frontend pagination component could be added in the future.
