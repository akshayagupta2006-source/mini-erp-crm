import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.number().positive(),
  items: z.array(
    z.object({
      productId: z.number().positive(),
      quantity: z.number().positive('Quantity must be positive')
    })
  ).min(1, 'At least one item is required')
});
