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
import { Prisma } from '../generated/prisma/client.js';

interface TokenPayload extends JwtPayload {
  ai_api_key: string;
}
type TimeFilter = '30d' | '90d' | '7d' | '24h';
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
    const tagsId = new Set<string>();
    for (const id of friction_id) {
      const friction = await prisma.friction_Log.findUnique({
        where: {
          id,
        },
        include: {
          tags: true,
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
      for (const tag of friction.tags) {
        tagsId.add(tag.id);
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
        tags: {
          connect: [...tagsId].map((id) => ({ id })),
        },
      },
      include: {
        tags: true,
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
      include: {
        tags: true,
      },
    });
    const tagIds = new Set<string>();

    const api_key = jwt.verify(
      user.ai_api_key,
      envConfig.JWT_SECRET,
    ) as TokenPayload;
    const severitys: SEVERITY[] = [];
    for (const friction of frictions) {
      severitys.push(friction.severity);
      for (const tag of friction.tags) {
        tagIds.add(tag.id);
      }
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
        tags: {
          connect: [...tagIds].map((id) => ({
            id,
          })),
        },
      },
      include: {
        tags: true,
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
export const updateInsightHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      throw errorUitl('Insight id is required', 400);
    }
    if (!req.id) {
      throw errorUitl('Unauthorized', 401);
    }
    const userId = req.id;
    const existingInsight = await prisma.insight.findFirst({
      where: {
        user_id: userId,
        id,
      },
    });
    if (!existingInsight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found whith this id',
      });
    }
    const validatedData = updateInsightSchema.parse(req.body);
    const { tags, ...restData } = validatedData;
    const updatedInsight = await prisma.insight.update({
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
      message: 'Insight updated successfully',
      data: updatedInsight,
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

export const deleteInsightHandler = async (
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
      throw errorUitl('Inisght id is required', 400);
    }
    const insight = await prisma.insight.deleteMany({
      where: { user_id: userId, id },
    });
    if (insight.count == 0) {
      throw errorUitl('Insight not found', 404);
    }
    return res.status(200).json({
      success: true,
      message: 'Insight deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getInsightHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, tags, page = '1', pageSize = 6, time = 'all' } = req.query;
  const size = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * size;
  const userId = req.id;
  const date = {
    '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    '24h': new Date(Date.now() - 24 * 60 * 60 * 1000),
  };
  const where: Prisma.InsightWhereInput = {
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
  if (time != 'all' && typeof time === 'string' && time in date) {
    where.created_at = {
      gte: date[time as TimeFilter],
    };
  }
  const [insight, totalCount] = await Promise.all([
    prisma.insight.findMany({
      where,
      skip,
      orderBy: {
        created_at: 'desc',
      },
      take: size,
      include: {
        tags: true,
      },
    }),
    prisma.insight.count({ where }),
  ]);
  return res.status(200).json({
    success: true,
    message: 'Insight log retrived successfully',
    data: insight,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    },
  });
};
