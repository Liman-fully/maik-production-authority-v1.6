import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { MembershipService } from '../membership/membership.service';
import { PointsService } from '../points/points.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private userService: UserService,
    private membershipService: MembershipService,
    private pointsService: PointsService,
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
      tier: user.tier,
      avatar: user.avatar,
      company: user.company,
      membership: membership ? {
        level: membership.level,
        expiresAt: membership.expiresAt,
      } : null,
      points,
    };
  }
}
