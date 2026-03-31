import { Repository } from 'typeorm';
import { ScoreRecord } from './score.entity';
import { Talent } from '../talent/talent.entity';
import { Resume } from '../resume/resume.entity';
import { CalculatePersonalScoreDto, CalculateMatchScoreDto } from './score.dto';
export declare class ScoreService {
    private scoreRepo;
    private talentRepo;
    private resumeRepo;
    constructor(scoreRepo: Repository<ScoreRecord>, talentRepo: Repository<Talent>, resumeRepo: Repository<Resume>);
    calculatePersonalScore(dto: CalculatePersonalScoreDto): Promise<ScoreRecord>;
    calculateMatchScore(dto: CalculateMatchScoreDto): Promise<ScoreRecord>;
    getScores(talentId: string): Promise<{
        personal: ScoreRecord;
        match: ScoreRecord[];
    }>;
    getLeaderboard(type: 'personal' | 'match', limit?: number): Promise<ScoreRecord[]>;
    private calcEducationScore;
    private calcExperienceScore;
    private calcSkillsScore;
    private calcCertificationsScore;
    private calcProjectsScore;
    private calcStabilityScore;
    private calcPositionMatch;
    private calcSalaryMatch;
    private calcLocationMatch;
    private calcExperienceMatch;
    private calcSkillMatch;
    private getEducationDetail;
    private getExperienceDetail;
    private getSkillsDetail;
    private getCertificationsDetail;
    private getProjectsDetail;
    private getStabilityDetail;
}
