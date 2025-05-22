import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';
import { InputEntity } from './entities/input.entity';
@Injectable()
export class InputService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(createInputDto: CreateInputDto) {
    const { branchId, detail, presentations } = createInputDto;
    const inputs = await this.prisma.input.createManyAndReturn({
      select: InputEntity,
      data: presentations.map((e) => ({
        presentationId: e.presentationId,
        quantity: e.quantity,
        price: e.price,
        dueDate: e.dueDate,
        detail,
        branchId,
      })),
    });
    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );
    return kardexLists;
  }


}