"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const resume_processor_1 = require("./resume.processor");
const resume_service_1 = require("./resume.service");
describe('ResumeProcessor Concurrency Test', () => {
    let processor;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                resume_processor_1.ResumeProcessor,
                {
                    provide: resume_service_1.ResumeService,
                    useValue: {
                        parseResumeAsync: jest.fn().mockImplementation(async () => {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }),
                    },
                },
            ],
        }).compile();
        processor = module.get(resume_processor_1.ResumeProcessor);
        service = module.get(resume_service_1.ResumeService);
    });
    it('New user (high-speed) group should run with high concurrency (10)', async () => {
        const jobsCount = 20;
        const group = 'high-speed';
        const startTime = Date.now();
        const jobs = Array.from({ length: jobsCount }).map((_, i) => ({
            data: { resumeId: `job-${i}`, group },
        }));
        await Promise.all(jobs.map(job => processor.handleParsing(job)));
        const duration = Date.now() - startTime;
        console.log(`[Verify] New User Performance: ${jobsCount} jobs took ${duration}ms`);
        expect(duration).toBeLessThan(500);
    });
    it('Regular user (default) group should run with low concurrency (2)', async () => {
        const jobsCount = 10;
        const group = 'default';
        const startTime = Date.now();
        const jobs = Array.from({ length: jobsCount }).map((_, i) => ({
            data: { resumeId: `job-low-${i}`, group },
        }));
        await Promise.all(jobs.map(job => processor.handleParsing(job)));
        const duration = Date.now() - startTime;
        console.log(`[Verify] Regular User Performance: ${jobsCount} jobs took ${duration}ms`);
        expect(duration).toBeGreaterThanOrEqual(450);
    });
});
//# sourceMappingURL=resume.concurrency.spec.js.map