import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../types/error.js';
import { specificFrictionInsightSchema } from './insights.schema.js';
import prisma from '../config/prisma.js';
import SpecificGemeniAIResponse, { AIInput } from '../services/gemeni.api.js';
import AIResponse from '../services/gemeni.api.js';
import { errorUitl } from '../utils/error.util.js';

export const specificFrictionInsightHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = specificFrictionInsightSchema.parse(req.body);
    const { friction_id, customInstraction } = data;
    const customPrompt = customInstraction
      ? `${customInstraction} \n Follow the system interaction mainly`
      : 'Follow the system interaction mainly';
    const body: AIInput = {
      data: [],
      customPrompt: customPrompt,
    };
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });
    // if (!user?.model_key) {
    //   throw errorUitl('API not found', 400);
    // }
    for (const id of friction_id) {
      const friction = await prisma.friction_Log.findUnique({
        where: {
          id,
        },
      });
      body.data.push({
        title: friction?.title ?? '',
        description: friction?.description ?? '',
      });
    }
    const insight = await AIResponse(body);
    return res.status(201).json({
      success: true,
      message: 'insight created successfully',
      data: insight,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      const error: AppError = new Error(
        err.issues.map((issue) => issue.message).join(', '),
      );
      error.status = 400;
      return next(error);
    }
    return next(err);
  }
};
