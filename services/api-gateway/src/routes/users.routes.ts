import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('[users.routes] SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

router.use(authMiddleware);

router.get('/profile',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }
      const supabase = supabaseAdmin;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (!authUser?.user) {
          throw new AppError('User not found', 404);
        }
        res.json({
          user: {
            id: authUser.user.id,
            email: authUser.user.email,
            name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name,
            avatar: authUser.user.user_metadata?.avatar_url || authUser.user.user_metadata?.picture,
          }
        });
        return;
      }

      res.json({ user: data });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/profile',
  body('name').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid input', 400);
      }

      const userId = req.user?.userId;
      const { name, bio } = req.body;
      const supabase = supabaseAdmin;

      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (bio !== undefined) updates.bio = bio;

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();

      if (error) throw error;

      res.json({ user: data });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/accessibility',
  body('fontSize').optional().isInt({ min: 100, max: 200 }),
  body('highContrast').optional().isBoolean(),
  body('reducedMotion').optional().isBoolean(),
  body('voiceNavigation').optional().isBoolean(),
  body('keyboardOnly').optional().isBoolean(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid accessibility settings', 400);
      }

      const userId = req.user?.userId;
      const accessibilitySettings = req.body;
      const supabase = supabaseAdmin;

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          accessibility_settings: accessibilitySettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ user: data });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/privacy',
  body('shareProfile').optional().isBoolean(),
  body('shareProgress').optional().isBoolean(),
  body('anonymousAnalytics').optional().isBoolean(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid privacy settings', 400);
      }

      const userId = req.user?.userId;
      const privacySettings = req.body;
      const supabase = supabaseAdmin;

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          privacy_settings: privacySettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ user: data });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/account',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const supabase = supabaseAdmin;

      const { error } = await supabase.auth.admin.deleteUser(userId!);

      if (error) throw error;

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export const usersRouter = router;
