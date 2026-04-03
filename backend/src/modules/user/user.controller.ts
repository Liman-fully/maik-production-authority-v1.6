import { Controller, Get, Post, UseGuards, Req, Logger, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { MembershipService } from '../membership/membership.service';
import { PointsService } from '../points/points.service';
import { CosService } from '../../common/storage/cos.service';
import { avatarMulterOptions } from './dto/avatar.dto';

@ApiTags('用户')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private userService: UserService,
    private membershipService: MembershipService,
    private pointsService: PointsService,
    private cosService: CosService,
  ) {}

  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);
    const membership = await this.membershipService.getActiveMembership(userId);
    const points = await this.pointsService.getUserPoints(userId);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      company: user.company,
      membership: membership ? {
        level: membership.level,
        expiresAt: membership.expiresAt,
      } : null,
      points,
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', avatarMulterOptions))
  @ApiOperation({ summary: '上传用户头像' })
  async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的头像图片');
    }

    const userId = req.user.id;

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('图片大小不能超过 2MB');
    }

    try {
      // Upload to COS
      const result = await this.cosService.uploadAvatar(userId, file.buffer, file.originalname);

      // Update user avatar in database
      const user = await this.userService.findById(userId);
      user.avatar = result.url;
      await this.userService.save(user);

      return {
        success: true,
        avatarUrl: result.url,
      };
    } catch (error) {
      this.logger.error(`头像上传失败: ${error.message}`);
      throw new BadRequestException(`头像上传失败: ${error.message}`);
    }
  }
}
