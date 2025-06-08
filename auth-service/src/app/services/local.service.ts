import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OtpService } from './otp.service';
import { MailerService } from './mailer.service';
import {
  LocalLoginDto,
  LocalRegisterDto,
  UserDto,
  VerifyOtpDto,
} from 'src/common/interfaces/auth.interface';
import { UserService } from './user.service';
import { AuthErrorCodes } from 'src/common/enums/error-codes.enum';
import { createStandardError } from 'src/common/utils/error.util';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LocalService {
  private readonly logger = new Logger(LocalService.name);
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: MailerService,
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async localLogin({ email }: LocalLoginDto) {
    const user = await this.userService.getByEmail(email);

    if (!user)
      throw new RpcException(
        createStandardError(
          HttpStatus.NOT_FOUND,
          AuthErrorCodes.ACCOUNT_NOT_FOUND,
          undefined,
          { email },
        ),
      );
    // Check if there's already a valid OTP for this email
    const hasValidOtp = await this.otpService.hasValidOtp(email);

    if (hasValidOtp) {
      throw new RpcException(
        createStandardError(
          HttpStatus.TOO_MANY_REQUESTS,
          AuthErrorCodes.OTP_ALREADY_SENT,
          undefined,
          { email },
        ),
      );
    }

    // Generate new OTP
    const otp = this.otpService.generateOtp();

    // Save OTP to Redis with 'login' type
    await this.otpService.saveOtp(email, otp, 'login');
    // Send OTP via email
    const emailSent = await this.emailService.sendOtpEmail(email, otp);

    if (!emailSent) {
      await this.otpService.deleteOtp(email);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.EMAIL_SEND_ERROR,
          undefined,
          { email },
        ),
      );
    }

    this.logger.log(`Login OTP sent successfully to email: ${email}`);
    return {
      success: true,
      message: 'OTP sent to your email successfully',
    };
  }

  async localRegister({ email, fullname }: LocalRegisterDto) {
    const user = await this.userService.getByEmail(email);
    if (user) {
      throw new RpcException(
        createStandardError(
          HttpStatus.CONFLICT,
          AuthErrorCodes.USER_ALREADY_EXISTS,
          undefined,
          { email },
        ),
      );
    }

    // Check if there's already a valid OTP for this email
    const hasValidOtp = await this.otpService.hasValidOtp(email);

    if (hasValidOtp) {
      throw new RpcException(
        createStandardError(
          HttpStatus.TOO_MANY_REQUESTS,
          AuthErrorCodes.OTP_ALREADY_SENT,
          undefined,
          { email },
        ),
      );
    }

    // Store user data temporarily in Redis (will be moved to permanent storage after OTP verification)
    const tempUserKey = `temp_user:${email}`;
    const tempUserData: Partial<UserDto> = {
      email,
      fullname,
    };
    await this.cacheManager.set(tempUserKey, tempUserData, 5 * 60 * 1000); // 5 minutes TTL

    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(email, otp, 'register');
    const emailSent = await this.emailService.sendOtpEmail(email, otp);

    if (!emailSent) {
      // Clean up temp data if email fails
      await this.cacheManager.del(tempUserKey);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.EMAIL_SEND_ERROR,
          undefined,
          { email },
        ),
      );
    }

    this.logger.log(`Registration OTP sent successfully to email: ${email}`);
    return {
      success: true,
      message:
        'OTP sent to your email. Please verify to complete registration.',
    };
  }

  async verifyOtp({ email, otp }: VerifyOtpDto) {
    const verification = await this.otpService.verifyOtp(email, otp);

    if (!verification.valid) {
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.OTP_INVALID,
          undefined,
          { email },
        ),
      );
    }

    switch (verification.type) {
      case 'register':
        return await this.handleRegistrationVerification(email);
      case 'login':
        return await this.handleLoginVerification(email);
      default:
        throw new RpcException(
          createStandardError(
            HttpStatus.BAD_REQUEST,
            AuthErrorCodes.OTP_INVALID,
            undefined,
            { email },
          ),
        );
    }
  }

  private async handleRegistrationVerification(email: string) {
    const tempUserKey = `temp_user:${email}`;
    const tempUserData = await this.cacheManager.get(tempUserKey);

    if (!tempUserData) {
      throw new RpcException(
        createStandardError(
          HttpStatus.BAD_REQUEST,
          AuthErrorCodes.REGISTRATION_EXPIRED,
          undefined,
          { email },
        ),
      );
    }

    // Create user from temporary data
    const verifiedUserData = { ...tempUserData } as UserDto;
    const user = await this.userService.createUser(verifiedUserData);

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

  private async handleLoginVerification(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'verifyEmail', 'role', 'created_at'],
    });

    if (!user) {
      throw new RpcException(
        createStandardError(
          HttpStatus.NOT_FOUND,
          AuthErrorCodes.ACCOUNT_NOT_FOUND,
          undefined,
          { email },
        ),
      );
    }

    // Verify email if not already verified
    if (!user.verifyEmail) {
      user.verifyEmail = true;
      await this.userRepository.save(user);
    }
    return {
      user,
      success: true,
      message: 'Login successful',
    };
  }

  
}
