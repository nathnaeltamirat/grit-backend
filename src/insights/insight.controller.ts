import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../types/error.js';
import {
  specificFrictionInsightSchema,
  timeRangeFrictionInsightSchema,
  updateInsightSchema,
} from './insight.schema.js';
import prisma from '../config/prisma.js';
import { AIInput } from '../services/ai.api.js';
import AIResponse from '../services/ai.api.js';
import { errorUitl } from '../utils/error.util.js';
import envConfig from '../config/config.js';
import { SEVERITY } from '../generated/prisma/enums.js';
interface TokenPayload extends JwtPayload {
  ai_api_key: string;
}

const severityCalculator = (severitys: SEVERITY[]) => {
  const severityCounts = {
    LOW: 0,
    MEDIUM: 1,
    CRITICAL: 2,
  };
  let mostCommon: SEVERITY = SEVERITY.LOW;

  for (const severity of severitys) {
    severityCounts[severity] += 1;
  }
  for (const severity of Object.keys(severityCounts) as SEVERITY[]) {
    if (severityCounts[severity] > severityCounts[mostCommon]) {
      mostCommon = severity;
    }
  }

  return mostCommon;
};
export const specificFrictionInsightHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = specificFrictionInsightSchema.parse(req.body);
    if (!req.id) {
      throw errorUitl('Unauthorized', 401);
    }
    const { friction_id, customInstraction, modelName } = data;

    const customPrompt = customInstraction
      ? `${customInstraction} \n Follow the system interaction mainly`
      : 'Follow the system interaction mainly';
    const body: AIInput = {
      data: [],
      modelName,
      customPrompt: customPrompt,
    };
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });
    if (!user?.ai_api_key) {
      throw errorUitl('Unauthorized make sure your api key is configured', 401);
    }
    const api_key = jwt.verify(
      user.ai_api_key,
      envConfig.JWT_SECRET,
    ) as TokenPayload;

    const severitys: SEVERITY[] = [];

    let start: Date | undefined;
    let end: Date | undefined;
    for (const id of friction_id) {
      const friction = await prisma.friction_Log.findUnique({
        where: {
          id,
        },
      });
      if (!friction) {
        throw errorUitl('Friction not found', 404);
      }
      if (!start || start < friction.created_at) {
        start = friction.created_at;
      }
      if (!end || end > friction.created_at) {
        end = friction.created_at;
      }
      severitys.push(friction.severity);
      body.data.push({
        title: friction?.title ?? '',
        description: friction?.description ?? '',
      });
    }
    if (!start || !end) {
      throw errorUitl('Friction not found', 404);
    }
    const commonSeverity = severityCalculator(severitys);
    const insight = await AIResponse(body, api_key.ai_api_key);
    const newInsight = await prisma.insight.create({
      data: {
        title: insight.title,
        project_score: insight.score,
        description: insight.summary,
        severity: commonSeverity,
        solution_landscape: insight.toolingAssessment,
        start_time: start,
        end_time: end,
        user_id: req.id,
        focus_areas: insight.suggestedFocusArea,
        pain_points: insight.painPoints,
        resolution_plans: insight.resoultionPlan,
      },
    });
    return res.status(201).json({
      success: true,
      message: 'insight created successfully',
      data: newInsight,
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
export const timeRangeFrictionInsightHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = timeRangeFrictionInsightSchema.parse(req.body);
    if (!req.id) {
      throw errorUitl('Unauthorized', 401);
    }
    const { start, end, customInstraction, modelName } = data;
    const customPrompt = customInstraction
      ? `${customInstraction} \n Follow the system interaction mainly`
      : 'Follow the system interaction mainly';
    const body: AIInput = {
      data: [],
      modelName,
      customPrompt: customPrompt,
    };
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });
    if (!user?.ai_api_key) {
      throw errorUitl('Unauthorized make sure your api key is configured', 401);
    }
    const frictions = await prisma.friction_Log.findMany({
      where: {
        user_id: req.id,
        created_at: {
          gte: start,
          lt: end,
        },
      },
    });
    const api_key = jwt.verify(
      user.ai_api_key,
      envConfig.JWT_SECRET,
    ) as TokenPayload;
    const severitys: SEVERITY[] = [];
    for (const friction of frictions) {
      severitys.push(friction.severity);
      body.data.push({
        title: friction?.title ?? '',
        description: friction?.description ?? '',
      });
    }
    const commonSeverity = severityCalculator(severitys);

    const insight = await AIResponse(body, api_key.ai_api_key);
    const newInsight = await prisma.insight.create({
      data: {
        title: insight.title,
        project_score: insight.score,
        description: insight.summary,
        severity: commonSeverity,
        solution_landscape: insight.toolingAssessment,
        start_time: start,
        end_time: end,
        user_id: req.id,
        focus_areas: insight.suggestedFocusArea,
        pain_points: insight.painPoints,
        resolution_plans: insight.resoultionPlan,
      },
    });
    return res.status(201).json({
      success: true,
      message: 'insight created successfully',
      data: newInsight,
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

