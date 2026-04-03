import { Test, TestingModule } from '@nestjs/testing';
import { ResumeService } from './resume.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Resume } from './resume.entity';
import { ResumeFolder } from './resume-folder.entity';

describe('ResumeService', () => {
  let service: ResumeService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepository,
        },
        {
          provide: getRepositoryToken(ResumeFolder),
          useValue: mockFolderRepository,
        },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
