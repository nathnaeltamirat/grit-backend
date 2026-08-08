import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../types/error.js';
import { createFrictionSchema } from './friction.schema.js';
import prisma from '../config/prisma.js';
import { errorUitl } from '../utils/error.util.js';

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
