import { NextFunction, Request, Response } from 'express';
import { errorUitl } from '../utils/error.util.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '../config/config.js';
import prisma from '../config/prisma.js';
interface TokenPayload extends JwtPayload {
  user_id: string;
}
export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeaders = req.headers['authorization'];
    if (!authHeaders || !authHeaders?.startsWith('Bearer ')) {
      throw errorUitl('Unauthorized', 401);
    }
    const authToken = authHeaders.split(' ')[1];
    const decoded = (await jwt.verify(
      authToken,
      envConfig.JWT_SECRET,
    )) as TokenPayload;
    const userId = decoded.user_id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw errorUitl('Unauthorized', 401);
    }
    req.id = userId;
    next();
  } catch (err) {
    return next(err);
  }
};
