export interface IUser {
  userId: string;
  email: string;
  fullName?: string;
  picture?: string;
  isVerified: boolean;
  sessionId?: string;
}
