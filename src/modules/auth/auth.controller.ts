import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public, RequestInfo, ReqUser } from '@/decorator';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { JwtAuthGuard } from '@/guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  login(@Body() createAuthDto: CreateAuthDto, @RequestInfo() requestInfo: RequestInfo) {
    return this.authService.login(createAuthDto, requestInfo);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() createRefreshDto: CreateRefreshDto) {
    return this.authService.refreshToken(createRefreshDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@ReqUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
