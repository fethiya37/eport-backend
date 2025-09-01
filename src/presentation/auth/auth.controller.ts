import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with phone_number + password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (revoke current token)' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(@Request() req: any): Promise<LogoutResponseDto> {
    // req.user is set by JwtStrategy.validate()
    await this.auth.logout({
      user_id: req.user.userId,
      jti: req.user.jti,
      exp: req.user.exp,
    });
    return { status: 'ok' };
  }
}
