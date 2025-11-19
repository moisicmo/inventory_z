import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchSelect, BranchType } from './entities/branch.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class BranchService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createBranchDto: CreateBranchDto) {
    const { city, zone, detail, ...branchDto } = createBranchDto;
    const address = await this.prisma.address.create({
      data: {
        city,
        zone,
        detail,
        createdBy: email,
      }
    });
    return await this.prisma.branch.create({
      data: {
        ...branchDto,
        addressId: address.id,
        createdBy: email,
      },
      select: BranchSelect,

    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<BranchType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.branch.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.branch.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: BranchSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: BranchSelect,
    });

    if (!branch) {
      throw new NotFoundException(`Branch with id #${id} not found`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto
  ) {
    // 1️⃣ Verifica que exista la sucursal
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: { addressId: true },
    });

    if (!branch) throw new NotFoundException('Sucursal no encontrada');

    // 2️⃣ Separa los campos de dirección del resto
    const { city, zone, detail, ...branchData } = updateBranchDto;

    // 3️⃣ Si hay cambios de dirección, actualiza la tabla address
    if (city || zone || detail) {
      await this.prisma.address.update({
        where: { id: branch.addressId! },
        data: { city, zone, detail },
      });
    }

    // 4️⃣ Actualiza la sucursal
    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: {
        ...branchData,
      },
      select: BranchSelect,
    });

    return updatedBranch;
  }


  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: { active: false },
      select: BranchSelect,
    });
  }
}
