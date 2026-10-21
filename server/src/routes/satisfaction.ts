import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import logger from '../utils/logger.js';

const router = Router();
const prisma = new PrismaClient();

// 만족도 평가 스키마
const satisfactionRatingSchema = z.object({
  chartId: z.string(),
  chartType: z.string(),
  isCustomized: z.boolean().optional(),
  recommendation: z.enum(['recommend', 'not_recommend']),
  starRating: z.number().min(0).max(5),
  timestamp: z.string(),
  category: z.enum(['visualization', 'customization', 'gallery']).optional().default('visualization')
});

// 만족도 평가 저장
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = satisfactionRatingSchema.parse(req.body);
    
    // 세션 ID 추출 (IP 기반)
    const clientIP = (req as any).clientIP || req.ip;
    const session = await prisma.session.findFirst({
      where: {
        ipHash: clientIP
      },
      orderBy: {
        lastSeenAt: 'desc'
      }
    });
    const sessionId = session?.id;
    
    const satisfactionRating = await prisma.satisfactionRating.create({
      data: {
        sessionId: sessionId || null,
        chartId: validatedData.chartId,
        chartType: validatedData.chartType,
        isCustomized: validatedData.isCustomized || null,
        category: validatedData.category,
        recommendation: validatedData.recommendation,
        starRating: validatedData.starRating,
        createdAt: new Date(validatedData.timestamp)
      }
    });

    logger.info({
      satisfactionRatingId: satisfactionRating.id,
      chartId: validatedData.chartId,
      chartType: validatedData.chartType,
      isCustomized: validatedData.isCustomized,
      recommendation: validatedData.recommendation,
      starRating: validatedData.starRating,
      ip: (req as any).clientIP || req.ip
    }, '만족도 평가 저장 성공');

    res.json({
      success: true,
      id: satisfactionRating.id
    });
  } catch (error) {
    logger.error({
      error,
      body: req.body,
      ip: (req as any).clientIP || req.ip
    }, '만족도 평가 저장 실패');

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: '유효하지 않은 데이터',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: '만족도 평가 저장 실패'
      });
    }
  }
});

export default router;
