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
    const { branchId, detail, products } = createInputDto;

    const inputs = await this.prisma.input.createManyAndReturn({
      data: products.map((e) => ({
        branchId,
        detail,
        productId: e.productId,
        quantity: e.quantity,
        price: e.price,
        dueDate: e.dueDate,
      })),
    });

    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );

    return kardexLists;
  }


}