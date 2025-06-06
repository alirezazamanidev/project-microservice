import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user')
export class UserEntity  {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  sessionId: string;

  @Index()
  @Column({ unique: true })
  email: string;
  @Column({})
  fullname: string;
  @Column({ default: false })
  verifyEmail: boolean;
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}