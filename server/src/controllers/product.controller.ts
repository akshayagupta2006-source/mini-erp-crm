import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { ErrorResponse } from '../utils/errorResponse';
import { createProductSchema, updateProductSchema, stockMovementSchema } from '../validators/product.validator';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id as string) }
    });

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createProductSchema.parse(req.body);

    const exists = await prisma.product.findUnique({ where: { sku: parsed.sku } });
    if (exists) {
      return next(new ErrorResponse('Product with this SKU already exists', 409));
    }

    const product = await prisma.product.create({
      data: {
        ...parsed,
        currentStock: 0 // New products start at 0
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateProductSchema.parse(req.body);

    let product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id as string) } });

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    if (parsed.sku && parsed.sku !== product.sku) {
      const exists = await prisma.product.findUnique({ where: { sku: parsed.sku } });
      if (exists) {
        return next(new ErrorResponse('Product with this SKU already exists', 409));
      }
    }

    product = await prisma.product.update({
      where: { id: parseInt(req.params.id as string) },
      data: parsed
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id as string) } });

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    await prisma.product.delete({ where: { id: parseInt(req.params.id as string) } });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const addStockMovement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.id as string);
    const parsed = stockMovementSchema.parse(req.body);
    const { quantity, movementType, reason } = parsed;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Using transaction for atomic update
    const result = await prisma.$transaction(async (tx) => {
      if (movementType === 'OUT' && product.currentStock < quantity) {
        throw new ErrorResponse(`Insufficient stock for ${product.name}`, 400);
      }

      const newStock = movementType === 'IN' 
        ? product.currentStock + quantity 
        : product.currentStock - quantity;

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason,
          createdBy: req.user!.id
        }
      });

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      return { movement, product: updatedProduct };
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getStockHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(req.params.id as string);

    const history = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, sku: true } }
      }
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
