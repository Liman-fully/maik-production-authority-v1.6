"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const resume_service_1 = require("./resume.service");
const typeorm_1 = require("@nestjs/typeorm");
const resume_entity_1 = require("./resume.entity");
const resume_folder_entity_1 = require("./resume-folder.entity");
describe('ResumeService', () => {
    let service;
    const mockResumeRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
    };
    const mockFolderRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                resume_service_1.ResumeService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(resume_entity_1.Resume),
                    useValue: mockResumeRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(resume_folder_entity_1.ResumeFolder),
                    useValue: mockFolderRepository,
                },
            ],
        }).compile();
        service = module.get(resume_service_1.ResumeService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=resume.service.spec.js.map