import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OtpService } from './otp.service';
import { MailerService } from './mailer.service';
import {
  LocalLoginDto,
  LocalRegisterDto,
  UserPayload,
  VerifyOtpDto,
} from 'src/common/interfaces/auth.interface';
import { UserService } from './user.service';

@Injectable()
export class LocalService {
  private readonly logger = new Logger(LocalService.name);
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: MailerService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async localLogin({ email }: LocalLoginDto) {
    try {
      const userPayload = await this.userService.getUserPayload(email);
      if (!userPayload)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND',
        });

      // Check if user is verified
      if (!userPayload.isVerified) {
        throw new RpcException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Account not verified. Please complete registration first.',
          code: 'ACCOUNT_NOT_VERIFIED',
        });
      }

      // Check if there's already a valid OTP for this email
      const hasValidOtp = await this.otpService.hasValidOtp(email);

      if (hasValidOtp) {
        throw new RpcException({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'OTP already sent, please wait before requesting a new one',
          code: 'OTP_ALREADY_SENT',
        });
      }

      // Generate new OTP
      const otp = this.otpService.generateOtp();

      // Save OTP to Redis with 'login' type
      await this.otpService.saveOtp(email, otp, 'login');
      // Send OTP via email
      const emailSent = await this.emailService.sendOtpEmail(email, otp);

      if (!emailSent) {
        await this.otpService.deleteOtp(email);
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
          code: 'EMAIL_SEND_ERROR',
        });
      }

      this.logger.log(`Login OTP sent successfully to email: ${email}`);
      return {
        success: true,
        message: 'OTP sent to your email successfully',
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error sending OTP to ${email}:`, error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to send OTP',
        code: 'OTP_SEND_ERROR',
      });
    }
  }
  async localRegister({ email, fullname }: LocalRegisterDto) {
    try {
      const userPayload = await this.userService.getUserPayload(email);
      if (userPayload) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'User already exists',
          code: 'USER_ALREADY_EXISTS',
        });
      }

      // Check if there's already a valid OTP for this email
      const hasValidOtp = await this.otpService.hasValidOtp(email);

      if (hasValidOtp) {
        throw new RpcException({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'OTP already sent, please wait before requesting a new one',
          code: 'OTP_ALREADY_SENT',
        });
      }

      // Store user data temporarily in Redis (will be moved to permanent storage after OTP verification)
      const tempUserKey = `temp_user:${email}`;
      const tempUserData = {
        email,
        name: fullname,
        isVerified: false,
        registeredAt: new Date(),
      };
      await this.cacheManager.set(tempUserKey, tempUserData, 5 * 60 * 1000); // 5 minutes TTL

      const otp = this.otpService.generateOtp();
      await this.otpService.saveOtp(email, otp, 'register');
      const emailSent = await this.emailService.sendOtpEmail(email, otp);

      if (!emailSent) {
        // Clean up temp data if email fails
        await this.cacheManager.del(tempUserKey);
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send email',
          code: 'EMAIL_SEND_ERROR',
        });
      }

      this.logger.log(`Registration OTP sent successfully to email: ${email}`);
      return {
        success: true,
        message:
          'OTP sent to your email. Please verify to complete registration.',
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error in registration for ${email}:`, error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to process registration',
        code: 'REGISTRATION_PROCESS_ERROR',
      });
    }
  }
  async verifyOtp({
    email,
    otp,
  }: VerifyOtpDto) {
    try {
      const verification = await this.otpService.verifyOtp(email, otp);

      if (verification.valid && verification.type === 'register') {
        // Complete registration process
        const tempUserKey = `temp_user:${email}`;
        const tempUserData = (await this.cacheManager.get(tempUserKey)) as UserPayload;

        if (!tempUserData) {
          throw new RpcException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Registration data expired. Please register again.',
            code: 'REGISTRATION_EXPIRED',
          });
        }

        // Mark user as verified and save to permanent storage
        const verifiedUserData = {
          ...tempUserData,
          isVerified: true,
        };

        // Move user data from temporary storage to permanent storage
        const user = await this.userService.saveUserPayload(verifiedUserData);

        // Clean up temporary data
        await this.cacheManager.del(tempUserKey);

        this.logger.log(
          `User registration completed successfully for email: ${email}`,
        );

        return {
          user,
          success: true,
          message: 'Registration completed successfully. Welcome!',
        };
      }

      // Handle login verification
      if (verification.valid && verification.type === 'login') {
        this.logger.log(`User login verified successfully for email: ${email}`);
        const user = await this.userService.getUserPayload(email);
        return {
          user,
          success: true,
          message: 'Login successful',
        };
      }

      
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error verifying OTP for ${email}:`, error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to verify OTP',
        code: 'OTP_VERIFY_ERROR',
      });
    }
  }
}
