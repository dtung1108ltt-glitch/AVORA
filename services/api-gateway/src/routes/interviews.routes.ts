import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { InterviewService } from '../services/interview.service.js';

const router = Router();
const interviewService = new InterviewService();

router.use(authMiddleware);

router.get('/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interviews = await interviewService.getUserInterviews(userId);
      res.json({ interviews });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  body('targetJobId').optional().isString(),
  body('config').optional().isObject(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid input', 400);
      }

      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interview = await interviewService.createInterview(userId, req.body);
      res.status(201).json({ interview });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interview = await interviewService.getInterviewById(id, userId);
      
      if (!interview) {
        throw new AppError('Interview not found', 404);
      }
      
      res.json({ interview });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/question',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const question = await interviewService.getNextQuestion(id, userId);
      res.json({ question });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/respond',
  body('questionId').notEmpty(),
  body('response').notEmpty(),
  body('audioUrl').optional().isString(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid input', 400);
      }

      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const result = await interviewService.submitResponse(id, userId, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/pause',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interview = await interviewService.pauseInterview(id, userId);
      res.json({ interview });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/resume',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interview = await interviewService.resumeInterview(id, userId);
      res.json({ interview });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/complete',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const interview = await interviewService.completeInterview(id, userId);
      res.json({ interview });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/feedback',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const feedback = await interviewService.getFeedback(id, userId);
      res.json({ feedback });
    } catch (error) {
      next(error);
    }
  }
);

export const interviewsRouter = router;
