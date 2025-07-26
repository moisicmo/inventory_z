import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaginationDto, UserEntity } from '@/common'; import { StaffEntity } from './entities/staff.entity';
@Injectable()
export class StaffService {

  constructor(private readonly prisma: PrismaService) { }

  async create(createStaffDto: CreateStaffDto) {
    const { numberDocument, typeDocument, roleId, name, lastName, email } =
      createStaffDto;

    const userExists = await this.prisma.user.findUnique({
      where: { numberDocument },
      select: UserEntity,
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
      select: UserEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.staff.count({
      where: {
        active: true,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.staff.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          active: true,
        },
        select: StaffEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: {
        userId: id,
      },
      select: StaffEntity,
    });

    if (!staff) {
      throw new NotFoundException(`Staff with id #${id} not found`);
    }

    return staff;
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
      select: UserEntity,
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
      select: UserEntity,
    });
  }
}