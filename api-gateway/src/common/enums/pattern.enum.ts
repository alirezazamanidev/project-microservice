export enum PatternNameEnum {
  // Auth Service
  GOOGLE_LOGIN = 'auth/google-login',
  SAVE_USER_PAYLOAD = 'auth/save-user-payload',
  VALIDATE_USER = 'auth/validate-user',
  GET_USER_INFO = 'auth/get-user-info',
  REFRESH_TOKEN = 'auth/refresh-token',
  VERIFY_ACCESS_TOKEN = 'auth/verify-access-token',

  // Email OTP Authentication
  LOCAL_LOGIN = 'auth/local-login',
  LOCAL_REGISTER = 'auth/local-register',
  VERIFY_OTP = 'auth/verify-otp',

  // File Service
  UPLOAD_FILE = 'file/upload',
  GET_FILE_URL = 'file/get-url',
  DELETE_FILE = 'file/delete',
  LIST_FILES = 'file/list',

  // General
  HEALTH_CHECK = 'service/health-check',
}
