import { NextFunction, Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schema.js';
import { success, ZodError } from 'zod';
import AppError from '../types/error.js';
import prisma from '../config/prisma.js';
import { errorUitl } from '../utils/error.util.js';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '../config/config.js';

interface TokenPayload extends JwtPayload {
  userId: string;
}
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
    const accessToken = await jwt.sign(
      { user_id: user.id },
      envConfig.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    );
    const refreshToken = await jwt.sign(
      { user_id: user.id },
      envConfig.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '30d',
      },
    );
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

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = loginSchema.parse(req.body);
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw errorUitl('Invalid credential', 401);
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw errorUitl('Invalid credential', 401);
    const accessToken = await jwt.sign(
      { user_id: user.id },
      envConfig.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    );
    const refreshToken = await jwt.sign(
      { user_id: user.id },
      envConfig.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '30d',
      },
    );
    res.cookie('refreshToken', refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: envConfig.NODE_ENV == 'production' ? true : false,
      sameSite: 'lax',
    });
    res.status(200).json({
      success: true,
      message: 'User Logged In Successfully',
      data: {
        accessToken,
        full_name: user.full_name,
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

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: envConfig.NODE_ENV == 'production',
      sameSite: 'lax',
    });
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const refershHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existingToken = req.cookies['refreshToken'];
    if (!existingToken) throw errorUitl('Invalid Grant', 401);
    const decoded = (await jwt.verify(
      existingToken,
      envConfig.JWT_SECRET,
    )) as TokenPayload;
    const userId = decoded.userId;
    const accessToken = await jwt.sign({ userId }, envConfig.JWT_SECRET, {
      expiresIn: '15m',
      algorithm: 'HS256',
    });
    res.status(201).json({
      success: true,
      message: 'Access token created successfully',
      data: {
        accessToken,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.id },
      omit: {
        password_hash: true,
      },
    });
    res.status(200).json({
      message: 'User retrived successfully',
      success: true,
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
};
