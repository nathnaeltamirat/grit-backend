import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../../types/error.js';
import { updateProfileSchema } from './profile.schema.js';
import prisma from '../../config/prisma.js';
import { errorUitl } from '../../utils/error.util.js';

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.id;
    if (!id) {
      throw errorUitl('Unauthorized', 401);
    }
    const { full_name, email } = updateProfileSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        full_name: full_name ?? user?.full_name,
        email: email ?? user?.email,
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const error: AppError = new Error(
        err.issues.map((issue) => issue.message).join(', '),
      );
      error.status = 400;
      return next(err);
    }
    return next(err);
  }
};
