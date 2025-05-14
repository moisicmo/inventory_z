import { Injectable } from '@nestjs/common';
import { CreateInputDto } from './dto/create-input.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InputService {

  constructor(private prisma: PrismaService) { }

  async create(createInputDto: CreateInputDto) {
    const { branchId, detail, products } = createInputDto;
  
    for (const element of products) {
      await this.prisma.input.create({
        data: {
          branchId,
          detail,
          productId: element.productId,
          quantity: element.quantity,
          price: element.price,
          dueDate: element.dueDate,
        },
      });
    }
  }
}
