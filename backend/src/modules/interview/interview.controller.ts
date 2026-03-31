import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto, UpdateFeedbackDto } from './dto/interview.dto';

@Controller('api/interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('candidateId') candidateId?: string,
    @Query('jobId') jobId?: string,
    @Query('status') status?: string,
  ) {
    return this.interviewService.findAll({ page: Number(page), limit: Number(limit), candidateId, jobId, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.interviewService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewService.create(createInterviewDto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.interviewService.updateStatus(id, status);
  }

  @Patch(':id/feedback')
  async updateFeedback(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.interviewService.updateFeedback(id, updateFeedbackDto);
  }
}
