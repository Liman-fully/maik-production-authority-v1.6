"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const email_fetch_service_1 = require("./modules/resume/email-fetch.service");
const resume_entity_1 = require("./modules/resume/resume.entity");
const typeorm_1 = require("@nestjs/typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const emailFetchService = app.get(email_fetch_service_1.EmailFetchService);
    const resumeRepository = app.get((0, typeorm_1.getRepositoryToken)(resume_entity_1.Resume));
    console.log('--- Starting Email Fetch Test ---');
    const testUserId = 'system-test-user-id';
    await resumeRepository.delete({ userId: testUserId });
    console.log(`Cleared existing resumes for user: ${testUserId}`);
    await emailFetchService.fetchResumesFromEmail();
    console.log('fetchResumesFromEmail execution completed.');
    const count = await resumeRepository.count({ where: { userId: testUserId } });
    const resumes = await resumeRepository.find({ where: { userId: testUserId } });
    console.log(`--- Test Result ---`);
    console.log(`Resumes found in DB: ${count}`);
    resumes.forEach((r, i) => {
        console.log(`[${i + 1}] ID: ${r.id}, Name: ${r.fileName}, Status: ${r.parseStatus}, BasicInfo: ${JSON.stringify(r.basicInfo)}`);
    });
    if (count === 12) {
        console.log('SUCCESS: All 12 accounts processed and entries created.');
    }
    else {
        console.log(`FAILURE: Expected 12 entries, found ${count}.`);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=test-email-fetch.js.map