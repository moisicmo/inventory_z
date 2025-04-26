import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InputService {

  constructor(private prisma: PrismaService) { }

  async create(createInputDto: CreateInputDto) {
    return await this.prisma.input.create({
      data: {
        ...createInputDto
      }
    });
  }
}
