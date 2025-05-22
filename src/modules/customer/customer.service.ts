import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, UserEntity } from '@/common';

@Injectable()
export class CustomerService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto) {
    const { numberDocument, typeDocument, name, lastName } = createCustomerDto;
    const userExists = await this.prisma.user.findUnique({
      where: {
        numberDocument,
      },
      select: UserEntity,
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
        customer: {
          create: {},
        },
      },
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: {
        active: true,
        customer: {
          isNot: null,
        },
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
          customer: {
            isNot: null,
          },
        },
        select: UserEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        customer: {
          isNot: null,
        },
      },
      select: UserEntity,
    });

    if (!user) {
      throw new NotFoundException(`Customer with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);
    const { numberDocument, typeDocument, name, lastName } = updateCustomerDto;

    return this.prisma.user.update({
      where: {
        id,
        customer: {
          isNot: null,
        },
      },
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
        customer: {
          update: {
            where: { userId: id },
            data: {},
          },
        },
      },
      select: UserEntity,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: {
        id,
        customer: {
          isNot: null,
        },
      },
      data: {
        customer: {
          update: {
            where: { userId: id },
            data: {
              active: false,
            },
          },
        },
      },
      select: UserEntity,
    });
  }
}
