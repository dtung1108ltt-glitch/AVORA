import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new AppError('Supabase not configured', 500);
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { email, password, name } = req.body;
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      });

      if (error) {
        if (error.message.includes('already been registered')) {
          throw new AppError('Email already registered', 400);
        }
        throw new AppError(error.message, 400);
      }

      const user = data.user;

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid credentials', 400);
      }

      const { email, password } = req.body;
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.warn(`[auth.login] Supabase signInWithPassword failed for ${email}: ${error.message}`);
        throw new AppError('Invalid credentials', 401);
      }

      const user = data.user;

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logout successful' });
});

router.get('/oauth/:provider', async (req, res, next) => {
  try {
    const { provider } = req.params;
    console.log('[DEBUG] OAuth start - provider:', provider, 'path:', req.path);
    console.log('[DEBUG] Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);

    if (!['google', 'microsoft'].includes(provider)) {
      throw new AppError('Invalid OAuth provider', 400);
    }

    const redirectUrl = `${req.protocol}://${req.get('host')}/api/auth/oauth/${provider}/callback`;
    const supabase = getSupabaseAdmin();

    // Supabase's OAuth provider id for Microsoft is 'azure', not 'microsoft'.
    const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider as 'google' | 'azure',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        scopes: provider === 'microsoft' ? 'openid profile email' : undefined,
      },
    });

    if (error) throw error;

    res.json({ url: data.url });
  } catch (error) {
    next(error);
  }
});

router.get('/oauth/:provider/callback', async (req, res, next) => {
  try {
    const { code } = req.query;
    const provider = req.params.provider;
    console.log('[DEBUG] OAuth callback - provider:', provider, 'code exists:', !!code);

    if (!['google', 'microsoft'].includes(provider as string)) {
      throw new AppError('Invalid OAuth provider', 400);
    }

    // Redirect to frontend with code for PKCE exchange
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const callbackUrl = new URL(`${frontendUrl}/auth/callback`);
    callbackUrl.searchParams.set('code', code as string);
    callbackUrl.searchParams.set('provider', provider);

    console.log('[DEBUG] Redirecting to:', callbackUrl.toString());
    res.redirect(callbackUrl.toString());
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    const newToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
});

export const authRouter = router;