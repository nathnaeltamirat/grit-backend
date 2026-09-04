import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../../types/error.js';
import { updatePasswordSchema, updateProfileSchema } from './profile.schema.js';
import prisma from '../../config/prisma.js';
import { errorUitl } from '../../utils/error.util.js';
import bcrypt from 'bcryptjs';
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

export const updatePasswordhandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.id;
    if (!id) {
      throw errorUitl('Unauthorized', 401);
    }
    const { old_password, new_password, confirm_password } =
      updatePasswordSchema.parse(req.body);
    if (new_password != confirm_password) {
      throw errorUitl("Password doesn't match", 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw errorUitl('Unauthorized', 401);
    const isValidPassword = await bcrypt.compare(
      old_password,
      user.password_hash,
    );
    if (!isValidPassword) throw errorUitl('Invalid credential', 401);
    const password_hash = await bcrypt.hash(new_password, 12);
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password_hash,
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
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
