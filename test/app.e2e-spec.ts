import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { UseCaseProxy } from '../src/infrastructure/usecases-proxy/usecases-proxy';
import { UsecasesProxyModule } from '../src/infrastructure/usecases-proxy/usecases-proxy.module';
import { LoginUseCases } from '../src/usecases/auth/login.usecases';
import { IsAuthenticatedUseCases } from '../src/usecases/auth/isAuthenticated.usecases';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/infrastructure/common/guards/jwtAuth.guard';
import JwtRefreshGuard from '../src/infrastructure/common/guards/jwtRefresh.guard';
// Em desenvolvimento
describe('infrastructure/controllers/auth', () => {
  let app: INestApplication;
  let loginUseCase: LoginUseCases;
  let isAuthenticatedUseCases: IsAuthenticatedUseCases;

  beforeAll(async () => {
    loginUseCase = {} as LoginUseCases;
    loginUseCase.getTokenWithJwtToken = jest.fn();
    loginUseCase.validateUserForLocalStragtegy = jest.fn();
    loginUseCase.getTokenWithJwtRefreshToken = jest.fn();
    const loginUsecaseProxyService: UseCaseProxy<LoginUseCases> = {
      getInstance: () => loginUseCase,
    } as UseCaseProxy<LoginUseCases>;

    isAuthenticatedUseCases = {} as IsAuthenticatedUseCases;
    isAuthenticatedUseCases.execute = jest.fn();
    const isAuthUsecaseProxyService: UseCaseProxy<IsAuthenticatedUseCases> = {
      getInstance: () => isAuthenticatedUseCases,
    } as UseCaseProxy<IsAuthenticatedUseCases>;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsecasesProxyModule.IS_AUTHENTICATED_USECASES_PROXY)
      .useValue(isAuthUsecaseProxyService)
      .overrideProvider(UsecasesProxyModule.LOGIN_USECASES_PROXY)
      .useValue(loginUsecaseProxyService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          req.user = { username: 'username' };
          return (
            JSON.stringify(req.cookies) ===
            JSON.stringify({
              Authentication: '123456',
              Path: '/',
              'Max-Age': '900',
            })
          );
        },
      })
      .overrideGuard(JwtRefreshGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          req.user = { username: 'username' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  it(`/POST login should return 201`, async (done) => {
    const updatedDate = new Date().toISOString();
    (loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(
      Promise.resolve({
        id: 1,
        username: 'username',
        updatedDate: updatedDate,
        lastLogin: null,
        hashRefreshToken: null,
      }),
    );
    (loginUseCase.getTokenWithJwtToken as jest.Mock).mockReturnValue(
      Promise.resolve(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE2NjYwNDU3MTEsImV4cCI6MTY2NjA0NzUxMX0.yFG0Nc05eLeye7PywLiCx67kAy7-zhs3rvLSycG8EZE',
      ),
    );
    (loginUseCase.getTokenWithJwtRefreshToken as jest.Mock).mockReturnValue(
      Promise.resolve(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE2NjYwNDU3MTEsImV4cCI6MTY2NjEzMjExMX0.SEw8WRp4AV35Ds4EjF3EHA_52qxTZs6SaQPLTPYkILg',
      ),
    );

    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'username', password: 'password' })
      .expect(201);

    expect(result.text).toStrictEqual(
      JSON.stringify({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE2NjYwNDU3MTEsImV4cCI6MTY2NjA0NzUxMX0.yFG0Nc05eLeye7PywLiCx67kAy7-zhs3rvLSycG8EZE',
        refresh:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE2NjYwNDU3MTEsImV4cCI6MTY2NjEzMjExMX0.SEw8WRp4AV35Ds4EjF3EHA_52qxTZs6SaQPLTPYkILg',
      }),
    );

    done();
  });

  it(`/POST login should return 401`, async (done) => {
    (loginUseCase.validateUserForLocalStragtegy as jest.Mock).mockReturnValue(
      Promise.resolve(null),
    );

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'username', password: 'password' })
      .expect(401);

    done();
  });

  it(`/POST Refresh token should return 201`, async (done) => {
    (loginUseCase.getTokenWithJwtToken as jest.Mock).mockReturnValue(
      Promise.resolve(
        `Authentication=123456; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`,
      ),
    );

    const result = await request(app.getHttpServer())
      .get('/auth/refresh')
      .send({ username: 'username', password: 'password' })
      .expect(200);

    expect(result.status).toEqual(200);

    done();
  });

  it(`/GET is_authenticated should return 403`, async (done) => {
    (isAuthenticatedUseCases.execute as jest.Mock).mockReturnValue(
      Promise.resolve({ username: 'username' }),
    );

    await request(app.getHttpServer())
      .get('/auth/is_authenticated')
      .send()
      .expect(403);

    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
