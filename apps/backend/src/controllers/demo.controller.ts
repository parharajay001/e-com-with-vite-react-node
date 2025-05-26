import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Valid refresh token is required',
        });
      }

      // Validate token format
      if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(refreshToken)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid refresh token format',
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      if (!result) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid or blacklisted refresh token',
        });
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      // Handle specific token errors
      if (error instanceof Error) {
        if (error.message === 'Token expired' || error.message === 'Token blacklisted') {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        }
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Token refresh failed',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'User not authenticated',
        });
      }

      await AuthService.logout(userId);
      return res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'User not authenticated',
        });
      }

      const user = await AuthService.getCurrentUser(userId);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: 'User not found',
        });
      }

      return res.status(StatusCodes.OK).json(user);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : 'Failed to get user details',
      });
    }
  }
}
