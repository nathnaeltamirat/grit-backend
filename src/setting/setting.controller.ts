import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../types/error.js';
import { updateAPIKeySchema } from './setting.schema.js';
import { errorUitl } from '../utils/error.util.js';
import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import envConfig from '../config/config.js';

export const updateAIAPIKeyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.id;
    if (!id) {
      throw errorUitl('Unauthorized', 401);
    }
    const { ai_api_key } = updateAPIKeySchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw errorUitl('Unauthorized', 401);
    const encryptedAIAPIKey = jwt.sign({ ai_api_key }, envConfig.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '30d',
    });
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        ai_api_key: encryptedAIAPIKey,
      },
    });
    return res.status(200).json({
      success: true,
      message: 'API key configured successfully',
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
