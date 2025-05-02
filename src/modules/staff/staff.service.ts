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
        staffs: {
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
      where: { active: true, staffs: { some: {} } },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true, staffs: { some: {} } },
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, staffs: { some: {} }  },
    });

    if (!user) {
      throw new NotFoundException(`Staff with id #${id} not found`);
    }

    return user;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        staffs: {
          update: {
            where: { userId: id },
            data: updateStaffDto,
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
        staffs: {
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