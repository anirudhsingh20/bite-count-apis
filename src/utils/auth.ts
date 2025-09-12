import jwt from 'jsonwebtoken';
import { IUser } from '../models/UserSchema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthUtils {
  // Generate JWT token
  public static generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    } as jwt.SignOptions);
  }

  // Verify JWT token
  public static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Generate refresh token
  public static generateRefreshToken(user: IUser): string {
    const payload = {
      userId: (user._id as any).toString(),
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d'
    } as jwt.SignOptions);
  }

  // Verify refresh token
  public static verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate password reset token
  public static generatePasswordResetToken(user: IUser): string {
    const payload = {
      userId: (user._id as any).toString(),
      email: user.email,
      type: 'password-reset'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h' // Short expiry for security
    } as jwt.SignOptions);
  }

  // Verify password reset token
  public static verifyPasswordResetToken(token: string): { userId: string; email: string; type: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired password reset token');
    }
  }
}
