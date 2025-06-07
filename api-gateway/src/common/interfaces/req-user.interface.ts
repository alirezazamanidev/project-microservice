export interface IUser {
  id: string;
  email: string;
  fullname?: string;
  verifyEmail: boolean;
  created_at: Date;
}
