import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';

@Injectable()
export class CustomerService {

  constructor(private prisma: PrismaService) { }

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
    const user = await this.prisma.user.create({
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
      },
    });
    await this.prisma.customer.create({
      data: {
        userId: user.id,
      },
    });
    return {
      message: 'Cliente creado correctamente',
      user,
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.customer.count({ where: { active: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.customer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(userId: number) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId, active: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id #${userId} not found`);
    }

    return customer;
  }

  async update(userId: number, updateCustomerDto: UpdateCustomerDto) {
    const { numberDocument, typeDocument, name, lastName } = updateCustomerDto;

    await this.findOne(userId);

    return this.prisma.customer.update({
      where: { userId },
      data: {
        user: {
          update: {
            numberDocument,
            typeDocument,
            name,
            lastName,
          },
        }
      },
    });
  }

  async remove(id: number) {
    const customer = await this.prisma.customer.update({
      where: { userId: id },
      data: {
        active: false,
      },
    });

    return customer;
  }
}
