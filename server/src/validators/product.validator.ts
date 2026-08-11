import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative').default(0),
  warehouse: z.string().min(1, 'Warehouse location is required')
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantity: z.number().positive('Quantity must be a positive number'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required')
});
