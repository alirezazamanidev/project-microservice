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
  
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createOrUpdate(userDto: UserDto) {

    let user = await this.userRepository.findOne({
      where: {
        email: userDto.email,
      },
    });
    
    if (!user) {
      user = this.userRepository.create({...userDto,verifyEmail:true});
    } else {
      if(!user.verifyEmail) user.verifyEmail=true
    }
    await this.userRepository.save(user);
    return user;
  }

  async createUser(userDto:UserDto){
    let  user=await this.getByEmail(userDto.email);
    if(user) throw new RpcException(
      createStandardError(
        HttpStatus.CONFLICT,
        AuthErrorCodes.USER_ALREADY_EXISTS,
        undefined,
        { email: userDto.email },
      )
    )
    user=this.userRepository.create({...userDto,verifyEmail:true});
    await this.userRepository.save(user);
    return user;
  }

  
  async getByEmail(email:string){
     return this.userRepository.findOne({where:{email}});
  }

 
 


}
