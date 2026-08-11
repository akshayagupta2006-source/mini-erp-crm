import { z } from 'zod';

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']).optional(),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const followUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  followUpDate: z.string().datetime().optional()
});
