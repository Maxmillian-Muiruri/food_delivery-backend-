/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  SocialLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { UserRegisteredEvent, UserLoginEvent, EventTypes } from '../../events';

@Injectable()
export class AuthService {
  // In-memory storage for OTPs (in production, use Redis or database)
  private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  // In-memory token blacklist (in production, use Redis or database)
  private tokenBlacklist = new Set<string>();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      password_hash: hashedPassword,
      full_name: registerDto.full_name,
      phone_number: registerDto.phone_number,
      role: registerDto.role,
    });

    await this.usersRepository.save(user);

    // Emit user registered event for personalization
    this.eventEmitter.emit(
      EventTypes.USER_REGISTERED,
      new UserRegisteredEvent(user.id, user.email, user.full_name, user),
    );

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    console.log('Login attempt for email:', loginDto.email);

    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    console.log('User found:', user ? { id: user.id, email: user.email } : 'No user found');

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    // Verify social token and get user info
    const socialUser = await this.verifySocialToken(
      socialLoginDto.provider,
      socialLoginDto.access_token,
    );

    // Find or create user
    let user = await this.usersRepository.findOne({
      where: {
        social_provider: socialLoginDto.provider,
        social_provider_id: socialUser.id,
      },
    });

    if (!user) {
      user = this.usersRepository.create({
        email: socialUser.email,
        full_name: socialUser.name,
        profile_picture_url: socialUser.picture,
        social_provider: socialLoginDto.provider,
        social_provider_id: socialUser.id,
        role: 'customer',
      });
      await this.usersRepository.save(user);
    }

    const tokens = await this.generateTokens(user);

    // Emit user login event for personalization
    this.eventEmitter.emit(
      EventTypes.USER_LOGIN,
      new UserLoginEvent(user.id, user.email, {
        latitude: 0, // Default location, can be enhanced with actual user location
        longitude: 0,
        city: 'Unknown',
      }),
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refresh_token,
      );
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        throw new ForbiddenException('Invalid refresh token');
      }

      return await this.generateTokens(user);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '15m' },
    );

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    const emailHtml = this.emailService.getPasswordResetTemplate({
      user: { name: user.full_name, email: user.email },
      resetToken,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset - Food Delivery',
      html: emailHtml,
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(resetPasswordDto.token);

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.new_password,
        10,
      );
      user.password_hash = hashedPassword;
      await this.usersRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const storedOtp = this.otpStore.get(verifyOtpDto.email);

    if (!storedOtp) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (storedOtp.otp !== verifyOtpDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(verifyOtpDto.email);
      throw new BadRequestException('OTP has expired');
    }

    // Clean up the OTP after successful verification
    this.otpStore.delete(verifyOtpDto.email);

    return { message: 'OTP verified successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async logout(userId: number) {
    // In a production system, you would invalidate the JWT token
    // For now, we'll just return success as the client should discard the token
    return { message: 'Logged out successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return this.sanitizeUser(user);
    }

    return null;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ...result } = user;
    return result;
  }

  private async verifySocialToken(provider: string, token: string) {
    // Mock implementation for social token verification
    // In production, this would call the respective social provider APIs
    // For Google: https://oauth2.googleapis.com/tokeninfo?access_token=${token}
    // For Facebook: https://graph.facebook.com/me?access_token=${token}

    if (!token || token.length < 10) {
      throw new BadRequestException('Invalid social token');
    }

    // Mock response - in production, validate with actual provider APIs
    return {
      id: `social_${Date.now()}`,
      email: `user_${Date.now()}@example.com`,
      name: 'Social User',
      picture: '',
    };
  }
}
