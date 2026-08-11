import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { ErrorResponse } from '../utils/errorResponse';
import { createCustomerSchema, updateCustomerSchema, followUpSchema } from '../validators/customer.validator';

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as any;
    const customerType = req.query.customerType as any;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      prisma.customer.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        user: { select: { name: true } },
        followUps: {
          orderBy: { followUpDate: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createCustomerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        ...parsed,
        createdBy: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateCustomerSchema.parse(req.body);

    let customer = await prisma.customer.findUnique({ where: { id: parseInt(req.params.id as string) } });

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id as string) },
      data: parsed
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: parseInt(req.params.id as string) } });

    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    await prisma.customer.delete({ where: { id: parseInt(req.params.id as string) } });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const addFollowUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = parseInt(req.params.id as string);
    const parsed = followUpSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return next(new ErrorResponse('Customer not found', 404));
    }

    const followUpDate = parsed.followUpDate ? new Date(parsed.followUpDate) : new Date();

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId,
        note: parsed.note,
        followUpDate,
        createdBy: req.user!.id
      }
    });

    // Optionally update customer's last follow up date
    await prisma.customer.update({
      where: { id: customerId },
      data: { followUpDate }
    });

    res.status(201).json({
      success: true,
      data: followUp
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = parseInt(req.params.id as string);

    const followUps = await prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { followUpDate: 'desc' },
      include: { user: { select: { name: true } } }
    });

    res.status(200).json({
      success: true,
      data: followUps
    });
  } catch (error) {
    next(error);
  }
};
