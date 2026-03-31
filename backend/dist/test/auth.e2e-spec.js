"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Authentication (e2e)', () => {
    let app;
    let accessToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe());
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
//# sourceMappingURL=auth.e2e-spec.js.map