import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
