import { NextFunction, Request, Response } from 'express';
import { registerSchema } from './auth.schema.js';
import { ZodError } from 'zod';
import AppError from '../types/error.js';
import prisma from '../config/prisma.js';
import { errorUitl } from '../utils/error.util.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import envConfig from '../config/config.js';

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = registerSchema.parse(req.body);
    const { full_name, email, password } = data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw errorUitl('Email already in use', 409);
    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
      },
    });
    const accessToken = await jwt.sign({ user_id: user.id }, envConfig.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '15m',
    });
    const refreshToken = await jwt.sign({ user_id: user.id }, envConfig.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '30d',
    });
    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: envConfig.NODE_ENV == 'production' ? true : false,
      sameSite: 'lax',
    });
    res.status(201).json({
      success: true,
      message: 'User Registered Successfully',
      data: {
        accessToken,
        full_name,
        email,
      },
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
