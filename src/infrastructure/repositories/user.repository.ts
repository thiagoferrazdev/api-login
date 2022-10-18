import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserM } from '../../domain/model/user';
import { UserRepository } from '../../domain/repositories/userRepository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class DatabaseUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
  ) {}
  async updateRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userEntityRepository.update(
      {
        username: username,
      },
      { hach_refresh_token: refreshToken },
    );
  }
  async getUserByUsername(username: string): Promise<UserM> {
    const adminUserEntity = await this.userEntityRepository.findOne({
      where: {
        username: username,
      },
    });

    if (!adminUserEntity) {
      return null;
    }
    return this.toUser(adminUserEntity);
  }
  async updateLastLogin(username: string): Promise<void> {
    await this.userEntityRepository.update(
      {
        username: username,
      },
      {},
    );
  }

  private toUser(adminUserEntity: User): UserM {
    const adminUser: UserM = new UserM();

    adminUser.id = adminUserEntity.id;
    adminUser.username = adminUserEntity.username;
    adminUser.password = adminUserEntity.password;
    adminUser.updatedDate = adminUserEntity.updateddate;
    adminUser.hashRefreshToken = adminUserEntity.hach_refresh_token;

    return adminUser;
  }
}
