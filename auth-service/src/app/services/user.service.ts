import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import {
  UserDto,
  
  UserInfo,
} from 'src/common/interfaces/auth.interface';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { randomUUID } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { AuthErrorCodes } from 'src/common/enums/error-codes.enum';
import { createStandardError } from 'src/common/utils/error.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createOrUpdate(userDto: UserDto,sessionId:string) {
    
    // find user
    let user = await this.userRepository.findOne({
      where: {
        email: userDto.email,
      },
    });
    
    if (!user) {
      user = this.userRepository.create({...userDto,sessionId,verifyEmail:true});
    } else {
      user.sessionId = sessionId;
      if(!user.verifyEmail) user.verifyEmail=true
    }
    await this.userRepository.save(user);
    return user;
  }

  async createUser(userDto:UserDto,sessionId:string){
    let  user=await this.getByEmail(userDto.email);
    if(user) throw new RpcException(
      createStandardError(
        HttpStatus.CONFLICT,
        AuthErrorCodes.USER_ALREADY_EXISTS,
        undefined,
        { email: userDto.email },
      )
    )
    user=this.userRepository.create({...userDto,verifyEmail:true,sessionId});
    await this.userRepository.save(user);
    return user;
  }

  
  async getByEmail(email:string){
     return this.userRepository.findOne({where:{email}});
  }

  async updateUserSession(email:string,sessionId:string):Promise<UserEntity>{
    const user=await this.getByEmail(email);
    if(!user) throw new RpcException(
      createStandardError(
        HttpStatus.NOT_FOUND,
        AuthErrorCodes.ACCOUNT_NOT_FOUND,
        undefined,
        { email },
      )
    )
    user.sessionId=sessionId;
    await this.userRepository.save(user);
    return user;
  }
 


}
