import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/utils/api-error';
import { AuthRepository } from '../auth/repository/auth.repository';

export class OAuthService {
  private googleClient: OAuth2Client;
  private authRepo: AuthRepository;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.authRepo = new AuthRepository();
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new ApiError(401, 'Invalid Google token');
      }

      return {
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        picture: payload.picture,
        emailVerified: payload.email_verified || false,
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new ApiError(401, 'Invalid Google token');
    }
  }

  async googleLogin(googleToken: string, role?: 'user' | 'tenant') {
    const googleUser = await this.verifyGoogleToken(googleToken);

    let user = await this.authRepo.findByEmail(googleUser.email);

    if (!user) {
      user = await this.authRepo.createWithoutPassword({
        email: googleUser.email,
        name: googleUser.name,
        role: role || 'user',
      });

      if (googleUser.picture) {
        await this.authRepo.updateUser(user.id, {
          name: googleUser.name,
        });
      }

      await this.authRepo.updateUser(user.id, {
        email: googleUser.email,
      });

      const updatedUser = await this.authRepo.findById(user.id);
      if (updatedUser) {
        user = updatedUser;
      }
    }

    if (googleUser.emailVerified && !user.isEmailVerified) {
      await this.authRepo.updateUser(user.id, {
        email: user.email,
      });

      const verifiedUser = await this.authRepo.findById(user.id);
      if (verifiedUser) {
        user = verifiedUser;
      }
    }

    const token = this.generateToken(user);

    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      token,
      message: 'Google login successful',
    };
  }

  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified ?? true,
    };

    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secretKey, {
      expiresIn: expiresIn as any,
    });
  }
}

