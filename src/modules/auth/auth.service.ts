import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RequestInfo } from '@/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoleEntity } from '@/modules/role/entities/role.entity';
import { BranchEntity } from '@/modules/branch/entities/branch.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './entities/jwt-payload.interface';
import { CreateRefreshDto } from './dto/create-refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  signJWT(payload: JwtPayload, expiresIn?: string | number) {
    if (expiresIn) return this.jwtService.sign(payload, { expiresIn });
    return this.jwtService.sign(payload);
  }

  async login(createAuthDto: CreateAuthDto, requestInfo: RequestInfo) {
    const { email, password } = createAuthDto;
    const { userAgent, ipAddress } = requestInfo;

    try {
      const staff = await this.prisma.staff.findFirst({
        where: {
          user: { email },
        },
        select: {
          password: true,
          requiresPasswordChange: true,
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              email: true,
              active: true,
            },
          },
          role: {
            select: RoleEntity,
          },
          branches: {
            select: BranchEntity,
          },
        },
      });

      if (!staff || !staff.user.active) {
        throw new NotFoundException('User does not exist or is inactive');
      }

      const isPasswordValid = bcrypt.compareSync(password, staff.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, user, role, branches, requiresPasswordChange } = staff;

      const tokenPayload = {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
      };

      const token = this.signJWT(tokenPayload);
      const refreshToken = this.signJWT(tokenPayload, '1d');

      await this.prisma.session.create({
        data: {
          userId: user.id,
          token,
          userAgent,
          ipAddress,
        },
      });

      return {
        ...tokenPayload,
        token,
        refreshToken,
        role,
        branches,
        requiresPasswordChange,
      };

    } catch (error) {
      console.error('Login error:', error);
      throw new InternalServerErrorException('Internal error');
    }
  }

  refreshToken(createRefreshDto: CreateRefreshDto) {
    try {
      const payload = this.jwtService.verify(createRefreshDto.refreshToken);

      const { exp: _, iat: __, nbf: ___, ...cleanPayload } = payload;

      const newAccessToken = this.signJWT(cleanPayload);

      return { token: newAccessToken };

    } catch (error) {
      console.error('refreshToken error:', error);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { newPassword } = changePasswordDto;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.staff.update({
      where: { userId },
      data: {
        password: hashedPassword,
        requiresPasswordChange: false,
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }


}
