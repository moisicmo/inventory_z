import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InputService } from './input.service';
import { CreateInputDto } from './dto/create-input.dto';

import { checkAbilities } from '@/decorator';
import { AbilitiesGuard } from '@/guard/abilities.guard';
import { TypeAction, TypeSubject } from "@prisma/client";

@UseGuards(AbilitiesGuard)
@Controller('input')
export class InputController {
  constructor(private readonly inputService: InputService) { }

  @Post()
  @checkAbilities({ action: TypeAction.create, subject: TypeSubject.input })
  create(@Body() createInputDto: CreateInputDto) {
    return this.inputService.create(createInputDto);
  }
}
