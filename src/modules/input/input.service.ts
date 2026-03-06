import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { InputSelect } from './entities/input.entity';
import { KardexService } from '@/modules/kardex/kardex.service';
import { TypeReference } from '@/generated/prisma/enums';
@Injectable()
export class InputService {

  constructor(
    private prisma: PrismaService,
    private kardexService: KardexService,
  ) { }

  async create(userId: string,createInputDto: CreateInputDto) {
    const { branchId, detail, products } = createInputDto; 
    const inputs = await this.prisma.input.createManyAndReturn({
      select: InputSelect,
      data: products.map((e) => ({
        branchId,
        productId: e.productId,
        quantity: e.quantity,
        price: e.price,
        typeUnit: e.typeUnit,
        dueDate: e.dueDate,
        detail,
        createdBy: userId,
      })),
    });
    const kardexLists = await Promise.all(
      inputs.map((input) => this.kardexService.findByReference(input.id, TypeReference.inputs)),
    );
    return kardexLists;
  }


}