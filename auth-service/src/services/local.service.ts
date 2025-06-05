import { RpcException } from "@nestjs/microservices";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { MailerService } from "./mailer.service";
import { SendOtpDto, VerifyOtpDto } from "src/common/interfaces/auth.interface";


@Injectable()
export class LocalService {
  private readonly logger = new Logger(LocalService.name);
  constructor(private readonly otpService: OtpService, private readonly emailService: MailerService) {}

  async sendOtp({ email }: SendOtpDto) {
    try {
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

      // Save OTP to Redis
      await this.otpService.saveOtp(email, otp);
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

      this.logger.log(`OTP sent successfully to email: ${email}`);
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
  async verifyOtp({
    email,
    otp,
  }: VerifyOtpDto): Promise<{ success: boolean; message: string }> {
    try {
    
      

      const verification = await this.otpService.verifyOtp(email, otp);

      return {
        success: verification.valid,
        message: verification.message,
      };
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