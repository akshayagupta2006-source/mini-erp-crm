export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
  token: string;
}

export interface Customer {
  id: number;
  customerName: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  gstNumber: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  address: string | null;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  user?: { name: string };
  followUps?: CustomerFollowUp[];
}

export interface CustomerFollowUp {
  id: number;
  note: string;
  followUpDate: string;
  createdAt: string;
  user?: { name: string };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  createdAt: string;
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  totalQuantity: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  customer?: { customerName: string; businessName: string };
  user?: { name: string };
  items?: ChallanItem[];
}

export interface ChallanItem {
  id: number;
  productId: number;
  quantity: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
}
