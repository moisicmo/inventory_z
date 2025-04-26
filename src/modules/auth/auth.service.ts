import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RequestInfo } from '@/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  signJWT(payload: any, expiresIn?: string | number) {
    if (expiresIn) return this.jwtService.sign(payload, { expiresIn });
    return this.jwtService.sign(payload);
  }

  async login(createAuthDto: CreateAuthDto,requestInfo: RequestInfo) {
    const { email, password } = createAuthDto;
    const { userAgent, ipAddress } = requestInfo;
    try {
      const staff = await this.prisma.staff.findFirst({
        where: {
          user: {
            email,
          }
        },
        include: {
          user: true,
          role: true,
        }
      });

      if (!staff) {
        throw new NotFoundException('User does not exist');
      }
      const isPasswordValid = bcrypt.compareSync(password, staff.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('User or password is invalid');

      }

      const {  
        createdAt:_,
        updatedAt:__,
        codeActivation:___,
        active:____,
        numberDocument:_____,
        typeDocument:______ ,
        ...rest
      } = staff.user;
      const token = this.signJWT(rest);
      const refreshToken = this.signJWT(rest, '1d');
      //registrar sesion
      await this.prisma.session.create({
        data: {
          userId: rest.id,
          token,
          userAgent,
          ipAddress,
        }
      });
      return {
        ...rest,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('ERROR COMPLETO:', error);
      throw new InternalServerErrorException('Internal error');
    }
  }
}
