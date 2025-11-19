import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { ProviderSelect, ProviderType } from './entities/provider.entity';
import { PaginationResult } from '@/common/entities/pagination.entity';

@Injectable()
export class ProviderService {

  constructor(private readonly prisma: PrismaService) { }

  async create(email: string, createProviderDto: CreateProviderDto) {
    const { city, zone, detail, ...providerDto } = createProviderDto;
    const address = await this.prisma.address.create({
      data: {
        city,
        zone,
        detail,
        createdBy: email,
      }
    });
    return await this.prisma.provider.create({
      data: {
        ...providerDto,
        addressId: address.id,
        createdBy: email,
      },
      select: ProviderSelect
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ProviderType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.provider.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.prisma.provider.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: true },
      select: ProviderSelect,
    });

    return {
      data,
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: ProviderSelect,
    });

    if (!provider) {
      throw new NotFoundException(`Provider with id #${id} not found`);
    }

    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto) {
    // 1️⃣ Verifica que el proveedor exista
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: { addressId: true },
    });

    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // 2️⃣ Divide los campos de dirección
    const { city, zone, detail, ...providerData } = updateProviderDto;

    // 3️⃣ Actualiza dirección si hay campos de address
    if (city || zone || detail) {
      await this.prisma.address.update({
        where: { id: provider.addressId! },
        data: { city, zone, detail },
      });
    }

    // 4️⃣ Actualiza el proveedor
    const updatedProvider = await this.prisma.provider.update({
      where: { id },
      data: providerData,
      select: ProviderSelect,
    });

    return updatedProvider;
  }


  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.provider.update({
      where: { id },
      data: { active: false },
      select: ProviderSelect,
    });
  }
}
