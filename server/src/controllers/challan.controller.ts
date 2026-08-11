import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { ChallanService } from '../services/challan.service';
import { createChallanSchema } from '../validators/challan.validator';
import { ErrorResponse } from '../utils/errorResponse';

export const getChallans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as any;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, businessName: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.challan.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: challans,
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

export const getChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        customer: true,
        items: true,
        user: { select: { name: true } }
      }
    });

    if (!challan) {
      return next(new ErrorResponse('Challan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: challan
    });
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createChallanSchema.parse(req.body);

    const challan = await ChallanService.createDraftChallan(
      parsed.customerId,
      parsed.items,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      data: challan
    });
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await ChallanService.confirmChallan(parseInt(req.params.id as string), req.user!.id);

    res.status(200).json({
      success: true,
      data: challan
    });
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const challan = await ChallanService.cancelChallan(parseInt(req.params.id as string), req.user!.id);

    res.status(200).json({
      success: true,
      data: challan
    });
  } catch (error) {
    next(error);
  }
};
