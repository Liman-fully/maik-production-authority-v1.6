import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          phone: '13800138001',
          password: 'Test123456',
          name: '测试用户',
        })
        .expect(201);
    });

    it('should fail with invalid phone', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          phone: 'invalid',
          password: 'Test123456',
          name: '测试用户',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login and return access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          phone: '13800138001',
          password: 'Test123456',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          phone: '13800138001',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
