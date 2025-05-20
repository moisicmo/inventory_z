import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '@/common'; @Injectable()
export class StaffService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma']
  ) { }

  async create(createStaffDto: CreateStaffDto) {
    const { numberDocument, typeDocument, roleId, name, lastName, email } =
      createStaffDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument },
    });

    if (userExists) {
      throw new Error('El usuario ya existe');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(email, salt);

    return await this.prisma.user.create({
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
        email,
        staff: {
          create: {
            password: hashedPassword,
            roleId: roleId,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.user.count({
      where: {
        active: true,
        staff: {
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
          staff: {
            isNot: null,
          },
        },
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Staff with id #${id} not found`);
    }

    return user;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id);
    const { numberDocument, typeDocument, roleId, name, lastName, email } = updateStaffDto;

    return this.prisma.user.update({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
        email,
        staff: {
          update: {
            where: { userId: id },
            data: {
              roleId
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.user.update({
      where: {
        id,
        staff: {
          isNot: null,
        },
      },
      data: {
        staff: {
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