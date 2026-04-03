import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as path from 'path';
import * as fs from 'fs';

describe('Resume (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        phone: '13800138001',
        password: 'Test123456',
      });
    accessToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/resume/upload (POST)', () => {
    it('should upload and parse a resume file', async () => {
      // Create a sample resume file
      const resumePath = path.join(__dirname, 'fixtures', 'sample-resume.pdf');
      
      if (fs.existsSync(resumePath)) {
        const response = await request(app.getHttpServer())
          .post('/api/resume/upload')
          .set('Authorization', `Bearer ${accessToken}`)
          .attach('file', resumePath)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('parsedData');
      }
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/resume/upload')
        .expect(401);
    });
  });

  describe('/api/resume (GET)', () => {
    it('should return user resume list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/resume')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/resume')
        .expect(401);
    });
  });
});
