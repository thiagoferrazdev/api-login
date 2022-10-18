import { IBcryptService } from '../../domain/adapters/bcrypt.interface';
import {
  IJwtService,
  IJwtServicePayload,
} from '../../domain/adapters/jwt.interface';
import { ILogger } from '../../domain/logger/logger.interface';
import { UserRepository } from '../../domain/repositories/userRepository.interface';

export class LoginUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly jwtTokenService: IJwtService,
    private readonly userRepository: UserRepository,
    private readonly bcryptService: IBcryptService,
  ) {}

  async getTokenWithJwtToken(username: string) {
    this.logger.log(
      'LoginUseCases execute',
      `The user ${username} have been logged.`,
    );
    const payload: IJwtServicePayload = { username: username };
    const secret = '74YLbq4%c!wU';
    const expiresIn = '900s';
    const token = this.jwtTokenService.createToken(payload, secret, expiresIn);
    return token;
  }

  async getTokenWithJwtRefreshToken(username: string) {
    this.logger.log(
      'LoginUseCases execute',
      `The user ${username} have been logged.`,
    );
    const payload: IJwtServicePayload = { username: username };
    const secret = '74YLbq4%c!wU';
    const expiresIn = '86400s';
    const token = this.jwtTokenService.createToken(payload, secret, expiresIn);
    await this.setCurrentRefreshToken(token, username);
    return token;
  }

  async validateUserForLocalStragtegy(username: string, pass: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }
    const match = pass === user.password ? true : false;
    if (user && match) {
      await this.updateLoginTime(user.username);
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserForJWTStragtegy(username: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }
    return user;
  }

  async updateLoginTime(username: string) {
    await this.userRepository.updateLastLogin(username);
  }

  async setCurrentRefreshToken(refreshToken: string, username: string) {
    const currentHashedRefreshToken = await this.bcryptService.hash(
      refreshToken,
    );
    await this.userRepository.updateRefreshToken(
      username,
      currentHashedRefreshToken,
    );
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, username: string) {
    const user = await this.userRepository.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isRefreshTokenMatching = await this.bcryptService.compare(
      refreshToken,
      user.hashRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return user;
    }

    return null;
  }
}
