import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { AssessmentService } from '../services/assessment.service.js';

const router = Router();
const assessmentService = new AssessmentService();

router.use(authMiddleware);

router.post('/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const assessment = await assessmentService.createAssessment(userId);
      res.status(201).json({ assessment });
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
      const assessment = await assessmentService.getAssessment(id, userId);
      
      if (!assessment) {
        throw new AppError('Assessment not found', 404);
      }
      
      res.json({ assessment });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/message',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { message, extractedData } = req.body;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const result = await assessmentService.addMessage(id, userId, {
        message,
        extractedData,
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id/complete',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      
      const assessment = await assessmentService.completeAssessment(id, userId);
      res.json({ assessment });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/history',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);
      const assessments = await assessmentService.getAssessmentHistory(userId);
      res.json({ assessments });
    } catch (error) {
      next(error);
    }
  }
);

export const assessmentsRouter = router;
