"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const path = require("path");
const fs = require("fs");
describe('Resume (e2e)', () => {
    let app;
    let accessToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe());
        await app.init();
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
//# sourceMappingURL=resume.e2e-spec.js.map