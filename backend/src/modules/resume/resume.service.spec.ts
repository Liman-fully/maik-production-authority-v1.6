import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Resume } from './resume.entity';
import { ResumeFolder } from './resume-folder.entity';
import { Talent } from '../talent/talent.entity';
import { ResumeService } from './resume.service';
import { CosService } from '../../common/storage/cos.service';
import { AiService } from './ai.service';
import { LocalParseService } from './local-parse.service';
import { DeduplicationService } from './deduplication.service';
import { ScoreService } from '../score/score.service';
import { RecommendationService } from '../recommendation/recommendation.service';

describe('ResumeService', () => {
  let service: ResumeService;

  const mockResumeRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), delete: jest.fn() };
  const mockFolderRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const mockTalentRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
  const mockCosService = { upload: jest.fn(), getSignedUrl: jest.fn(), uploadBuffer: jest.fn() };
  const mockResumeQueue = { add: jest.fn(), process: jest.fn() };
  const mockEmailQueue = { add: jest.fn(), process: jest.fn() };
  const mockAiService = { parseResumeText: jest.fn() };
  const mockLocalParseService = { extractTextFromFile: jest.fn() };
  const mockDeduplicationService = { findExistingTalent: jest.fn(), shouldUpdate: jest.fn() };
  const mockScoreService = { calculateScoreAndTier: jest.fn() };
  const mockRecommendationService = { recommend: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: getRepositoryToken(Resume), useValue: mockResumeRepo },
        { provide: getRepositoryToken(ResumeFolder), useValue: mockFolderRepo },
        { provide: getRepositoryToken(Talent), useValue: mockTalentRepo },
        { provide: CosService, useValue: mockCosService },
        { provide: 'BullQueue_resume-parsing', useValue: mockResumeQueue },
        { provide: 'BullQueue_email-fetching', useValue: mockEmailQueue },
        { provide: AiService, useValue: mockAiService },
        { provide: LocalParseService, useValue: mockLocalParseService },
        { provide: DeduplicationService, useValue: mockDeduplicationService },
        { provide: ScoreService, useValue: mockScoreService },
        { provide: RecommendationService, useValue: mockRecommendationService },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
