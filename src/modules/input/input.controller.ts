import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InputService } from './input.service';
import { CreateInputDto } from './dto/create-input.dto';

import { checkAbilities, CurrentUser } from '@/decorator';
import { TypeAction } from "@prisma/client";
import { JwtPayload } from '../auth/entities/jwt-payload.interface';
import { TypeSubject } from '@/common/subjects';

@Controller('input')
export class InputController {
  constructor(private readonly inputService: InputService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.input })
  create(@CurrentUser() user: JwtPayload,@Body() createInputDto: CreateInputDto) {
    return this.inputService.create(user.email,createInputDto);
  }
}
