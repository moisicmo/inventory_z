import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TypeReference } from '@prisma/client';
import { InputEntity } from './entities/input.entity';
import { KardexService } from '@/modules/kardex/kardex.service';
@Injectable()
export class InputService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(email: string,createInputDto: CreateInputDto) {
    const { branchId, detail, presentations } = createInputDto;
    const inputs = await this.prisma.input.createManyAndReturn({
      select: InputEntity,
      data: presentations.map((e) => ({
        branchId,
        productPresentationId: e.productPresentationId,
        quantity: e.quantity,
        price: e.price,
        dueDate: e.dueDate,
        detail,
        createdBy: email,
      })),
    });
    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );
    return kardexLists;
  }


}