import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { PaginationDto } from '@/common';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) { }

  async create(createStaffDto: CreateStaffDto) {
    const { numberDocument, typeDocument, roleId, name, lastName, email } = createStaffDto;
    const userExists = await this.prisma.user.findUnique({
      where: {
        numberDocument,
      },
    });
    if (userExists) {
      throw new Error('El usuario ya existe');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('Muyseguro123*', salt);
    const user = await this.prisma.user.create({
      data: {
        numberDocument,
        typeDocument,
        name,
        lastName,
        email,
      },
    });
    await this.prisma.staff.create({
      data: {
        userId: user.id,
        password: hashedPassword,
        roleId: roleId,
      },
    });
    return {
      message: 'Usuario creado correctamente',
      user,
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.staff.count({ where: { active: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.staff.findMany({
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
    const staff = await this.prisma.staff.findFirst({
      where: { userId, active: true },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with id #${userId} not found`);
    }

    return staff;
  }

  async update(userId: number, updateStaffDto: UpdateStaffDto) {

    await this.findOne(userId);

    return this.prisma.staff.update({
      where: { userId },
      data: updateStaffDto,
    });
  }

  async remove(id: number) {
    const staff = await this.prisma.staff.update({
      where: { userId:id },
      data: {
        active: false,
      },
    });

    return staff;
  }
}
