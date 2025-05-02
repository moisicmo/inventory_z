import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class CustomerService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma']
  ) { }

  async create(createCustomerDto: CreateCustomerDto) {
    const { numberDocument, typeDocument, name, lastName } = createCustomerDto;
    const userExists = await this.prisma.user.findUnique({
      where: {
        numberDocument,
      },
    });
    if (userExists) {
      throw new Error('El cliente ya existe');
    }
    return await this.prisma.user.create({
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
        customers: {
          create: {},
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: { active: true, customers: { some: {} } },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true, customers: { some: {} } },
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, customers: { some: {} } },
    });

    if (!user) {
      throw new NotFoundException(`Customer with id #${id} not found`);
    }

    return user;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        customers: {
          update: {
            where: { userId: id },
            data: updateCustomerDto,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: { id },
      data: {
        customers: {
          update: {
            where: { userId: id },
            data: {
              active: false,
            },
          },
        },
      },
    });
  }
}
