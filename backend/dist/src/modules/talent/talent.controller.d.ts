import { TalentService } from './talent.service';
import { TalentFilterDto } from './dto/talent-filter.dto';
export declare class TalentController {
    private readonly talentService;
    constructor(talentService: TalentService);
    getTalents(filter: TalentFilterDto): Promise<any>;
}
