import { IS_PUBLIC_KEY } from '@/decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const canActivate = super.canActivate(context);

    return (async () => {
      if (await canActivate) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.id) {
          const staff = await this.prisma.staff.findUnique({
            where: { userId: user.id },
            select: { requiresPasswordChange: true },
          });

          if (staff && staff.requiresPasswordChange) {
            throw new ForbiddenException('Se requiere cambio de contraseña');
          }
        }
        return true;
      }
      return false;
    })();
  }
}
