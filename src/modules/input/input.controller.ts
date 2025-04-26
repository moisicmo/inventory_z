import { Controller, Post, Body } from '@nestjs/common';
import { InputService } from './input.service';
import { CreateInputDto } from './dto/create-input.dto';

@Controller('input')
export class InputController {
  constructor(private readonly inputService: InputService) {}

  @Post()
  create(@Body() createInputDto: CreateInputDto) {
    return this.inputService.create(createInputDto);
  }
}
