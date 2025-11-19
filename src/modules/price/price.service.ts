import { Injectable } from '@nestjs/common';
import { CreatePriceDto } from './dto/create-price.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PriceSelect } from './entities/price.entity';

@Injectable()
export class PriceService {

  constructor(private readonly prisma: PrismaService) { }


  async create(email: string, createPriceDto: CreatePriceDto) {
    return await this.prisma.price.create({
      data: {
        ...createPriceDto,
        createdBy: email,
      },
      select: PriceSelect
    });
  }

  findAll() {
    return `This action returns all price`;
  }

  findFirst(productId: string, price: number) {
    return this.prisma.price.findFirst({
      where: {
        productId,
        price,
        active: true,
      },
      select: PriceSelect,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} price`;
  }
}
