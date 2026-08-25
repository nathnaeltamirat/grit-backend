import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../types/error.js';
import {
  createFrictionSchema,
  updateFrictionSchema,
} from './friction.schema.js';
import prisma from '../config/prisma.js';
import { errorUitl } from '../utils/error.util.js';
import { Prisma } from '../generated/prisma/client.js';

export const createFrictionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.id;
    if (!userId) {
      throw errorUitl('Unauthorized', 401);
    }
    const data = createFrictionSchema.parse(req.body);
    const { title, description, tags, severity } = data;
    await prisma.friction_Log.create({
      data: {
        title,
        description,
        severity,
        user_id: userId,
        ...(tags &&
          tags?.length > 0 && {
            tags: {
              connectOrCreate: tags.map((tagName) => {
                const cleanedTag = tagName.toLowerCase().trim();
                return {
                  where: { tag_name: cleanedTag },
                  create: { tag_name: cleanedTag },
                };
              }),
            },
          }),
      },
    });
    return res.status(201).json({
      success: true,
      message: 'Friction log created successfully',
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const error: AppError = new Error(
        err.issues.map((e) => e.message).join(', '),
      );
      error.status = 400;
      return next(error);
    }
    return next(err);
  }
};
export const updateFrictionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw errorUitl('Friction id is required', 400);
    }
    if (!req.id) {
      throw errorUitl('Unauthorized', 401);
    }
    const userId = req.id;
    const existingFriction = await prisma.friction_Log.findFirst({
      where: {
        user_id: userId,
        id,
      },
    });
    if (!existingFriction) {
      return res.status(404).json({
        success: false,
        message: 'Friction feed not found fo rthis id',
      });
    }
    const validatedData = updateFrictionSchema.parse(req.body);
    const { tags, ...restData } = validatedData;
    const updatedFriction = await prisma.friction_Log.update({
      where: { id },
      data: {
        ...restData,
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tagName) => {
              const cleanedTag = tagName.toLowerCase().trim();
              return {
                where: { tag_name: cleanedTag },
                create: { tag_name: cleanedTag },
              };
            }),
          },
        }),
      },
      include: {
        tags: true,
      },
    });
    res.status(200).json({
      success: true,
      message: 'Friction log updated successfully',
      data: updatedFriction,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const error: AppError = new Error(
        err.issues.map((issue) => issue.message).join(', '),
      );
      error.status = 400;
      return error;
    }
    return err;
  }
};
export const getFrictionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, tags, page = '1' } = req.query;
  const pageSize = 6;
  const skip = (parseInt(page as string) - 1) * pageSize;
  const userId = req.id;
  const where: Prisma.Friction_LogWhereInput = {
    user_id: userId,
  };
  if (title) {
    where.title = { contains: title as string, mode: 'insensitive' };
  }
  if (tags) {
    const tagList = (tags as string)
      .split(',')
      .map((t) => t.trim().toLowerCase());
    where.tags = {
      some: {
        tag_name: {
          in: tagList,
        },
      },
    };
  }
  const [friction, totalCount] = await Promise.all([
    prisma.friction_Log.findMany({
      where,
      skip,
      orderBy: {
        created_at: 'desc',
      },
      take: pageSize,
      include: {
        tags: true,
      },
    }),
    prisma.friction_Log.count({ where }),
  ]);
  return res.status(200).json({
    success: true,
    message: 'Friction log retrived successfully',
    data: friction,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
    },
  });
};
export const deleteFrictionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.id;
    if (!userId) {
      throw errorUitl('Unauthorized', 401);
    }
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw errorUitl('Friction id is required', 400);
    }
    const frictionLog = await prisma.friction_Log.deleteMany({
      where: { user_id: userId, id },
    });
    if (frictionLog.count == 0) {
      throw errorUitl('Friction not found', 404);
    }
    return res.status(200).json({
      success: true,
      message: 'Friction deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};
