import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KardexService } from '../kardex/kardex.service';
import { TypeReference } from '@prisma/client';

@Injectable()
export class InputService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(createInputDto: CreateInputDto) {
    const { branchId, detail, presentations } = createInputDto;
    console.log('branchId',branchId);
    console.log('detail',detail);
    console.log('presentations',presentations);
    const inputs = await this.prisma.input.createManyAndReturn({
      data: presentations.map((e) => ({
        branchId:'7890d39a-c008-49f6-80a6-1409d5f8b31d',
        presentationId: e.presentationId,
        quantity: e.quantity,
        price: e.price,
        dueDate: e.dueDate,
        detail,
      })),
    });

    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );

    return kardexLists;
  }


}