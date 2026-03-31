"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const resume_service_1 = require("./resume.service");
const app_module_1 = require("../../app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const resumeService = app.get(resume_service_1.ResumeService);
    const userId = 'test-user-001';
    console.log('Starting full integration test...');
    console.log('Step 1: Triggering email fetch for 12 agents...');
    await resumeService.triggerEmailFetch(userId);
    console.log('Email fetch triggered. BullMQ should handle the rest.');
    const mockFile = {
        originalname: 'test_resume.pdf',
        buffer: Buffer.from('mock resume content'),
        size: 1024
    };
    console.log('Step 2: Testing manual upload and AI parse flow...');
    const resume = await resumeService.uploadResume(userId, mockFile);
    console.log(`Resume uploaded: ${resume.id}. Status: ${resume.parseStatus}`);
    console.log('Step 3: Simulating AI parsing...');
    await resumeService.parseResumeAsync(resume.id);
    const updatedResume = await resumeService.getResumeById(resume.id, userId);
    console.log(`Parse complete. Status: ${updatedResume.parseStatus}, Score: ${updatedResume.score}`);
    console.log(`Basic Info: ${JSON.stringify(updatedResume.basicInfo)}`);
    await app.close();
    process.exit(0);
}
bootstrap();
//# sourceMappingURL=integration-test.js.map