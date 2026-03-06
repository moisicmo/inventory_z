import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { CloudinaryService } from '@/common/cloudinary/clodinary.service';
import { ProductSelect, ProductType } from './entities/product.entity';
import { PriceService } from '@/modules/price/price.service';
import * as xlsx from 'xlsx';
import { PaginationResult } from '@/common/entities/pagination.entity';
import { TypeUnit } from '@/generated/prisma/enums';
@Injectable()
export class ProductService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly priceService: PriceService,
  ) { }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const fileNameWithExtension = parts.pop()!;
      const folder = parts.slice(parts.indexOf('upload') + 1).join('/');
      const fileName = fileNameWithExtension.split('.')[0];
      return `${folder}/${fileName}`;
    } catch {
      return null;
    }
  }
  async create(userId: string, createProductDto: CreateProductDto, image?: Express.Multer.File) {
    const { categoryId, brandId, code, name, description, barCode, refCost, promoPrice, unitConversion, prices } = createProductDto;

    let imageUrl: string | null = null;
    if (image) {
      const uploadResults = await this.cloudinaryService.uploadFile(image, 'productos');
      imageUrl = uploadResults.secure_url;
    }

    return await this.prisma.product.create({
      data: {
        categoryId,
        brandId,
        code,
        name,
        description,
        barCode,
        refCost,
        promoPrice,
        image: imageUrl,
        createdBy: userId,
        unitConversion: {
          create: {
            fromUnit: unitConversion.fromUnit,
            toUnit: unitConversion.toUnit,
            factor: unitConversion.factor,
            createdBy: userId,
          },
        },
        prices: {
          create: prices.map((p) => ({
            branchId: p.branchId,
            price: Number(p.price),
            typeUnit: p.typeUnit,
            createdBy: userId,
          })),
        },
      },
      select: ProductSelect,
    });
  }


  async findAll(paginationDto: PaginationDto): Promise<PaginationResult<ProductType>> {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPages = await this.prisma.product.count({
      where: { active: true },
    });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { active: true },
        select: ProductSelect,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findCatalog(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, keys, branchId, categoryId, brandId } = paginationDto;

    const where: any = { active: true, visible: true };

    if (keys && keys.trim() !== '') {
      where.name = { contains: keys, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (brandId) {
      where.brandId = brandId;
    }
    if (branchId) {
      where.prices = { some: { branchId } };
    }

    const total = await this.prisma.product.count({ where });
    const lastPage = Math.ceil(total / limit);

    const products = await this.prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        promoPrice: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        prices: {
          where: branchId ? { branchId } : {},
          select: { id: true, price: true, typeUnit: true, branch: { select: { id: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return { data: products, meta: { total, page, lastPage } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: ProductSelect,
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }

    return product;
  }

 async update(
  userId: string,
  id: string,
  updateProductDto: UpdateProductDto,
  image?: Express.Multer.File,
) {
  const {
    categoryId,
    brandId,
    code,
    name,
    description,
    barCode,
    promoPrice,
    refCost,
    unitConversion,
    prices,
  } = updateProductDto;

  const existingProduct = await this.findOne(id);

  let imageUrl: string | undefined;

  if (image) {
    if (existingProduct.image) {
      const publicId = this.extractPublicIdFromUrl(existingProduct.image);
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    }
    const uploadResult = await this.cloudinaryService.uploadFile(image, 'productos');
    imageUrl = uploadResult.secure_url;
  }

  return this.prisma.$transaction(async (tx) => {
    // 1️⃣ Update Product
    const product = await tx.product.update({
      where: { id },
      data: {
        categoryId,
        brandId,
        code,
        name,
        description,
        barCode,
        promoPrice,
        refCost,
        updatedBy: userId,
        ...(imageUrl ? { image: imageUrl } : {}),
        unitConversion: unitConversion
          ? {
              upsert: {
                update: {
                  fromUnit: unitConversion.fromUnit,
                  toUnit: unitConversion.toUnit,
                  factor: unitConversion.factor,
                  updatedBy: userId,
                },
                create: {
                  fromUnit: unitConversion.fromUnit,
                  toUnit: unitConversion.toUnit,
                  factor: unitConversion.factor,
                  createdBy: userId,
                },
              },
            }
          : undefined,
      },
      select: ProductSelect,
    });

    // 2️⃣ Delete previous prices
    await tx.price.deleteMany({
      where: { productId: id },
    });

    // 3️⃣ Create new prices
    if (prices?.length) {
      await tx.price.createMany({
        data: prices.map((p) => ({
          productId: id,
          branchId: p.branchId,
          typeUnit: p.typeUnit,
          price: Number(p.price),
          createdBy: userId,
        })),
      });
    }

    return product;
  });
}


  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.product.update({
      where: { id },
      data: {
        active: false,
      },
      select: ProductSelect,
    });
  }

  async importProducts(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data as any[]) {
      const categoryName = String(row['categoryName']).trim();
      const branchName = String(row['branchName']).trim();
      const brandName = String(row['brandName']).trim();
      const providerName = String(row['providerName']).trim();

      let category = await this.prisma.category.findFirst({
        where: { name: { equals: categoryName, mode: 'insensitive' } },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: categoryName,
            createdBy: userId,
          },
        });
      }

      let branch = await this.prisma.branch.findFirst({
        where: { name: { equals: branchName, mode: 'insensitive' } },
      });

      if (!branch) {
        branch = await this.prisma.branch.create({
          data: {
            type: 'sucursal',
            name: branchName,
            createdBy: userId,
          },
        });
      }

      let brand = await this.prisma.brand.findFirst({
        where: { name: { equals: brandName, mode: 'insensitive' } },
      });

      if (!brand) {
        brand = await this.prisma.brand.create({
          data: {
            name: brandName,
            description: '',
            createdBy: userId,
          },
        });
      }

      let provider = await this.prisma.provider.findFirst({
        where: { name: { equals: providerName, mode: 'insensitive' } },
      });

      if (!provider) {
        provider = await this.prisma.provider.create({
          data: {
            nit: '',
            name: providerName,
            contact: '',
            phone: [],
            createdBy: userId,
          },
        });
      }

      const createProductDto: CreateProductDto = {
        categoryId: category.id,
        brandId: brand.id,
        code: '',
        name: String(row['name']),
        prices: [],
        unitConversion: {
          fromUnit: TypeUnit.UNIDAD,
          toUnit: TypeUnit.UNIDAD,
          factor: 1,
        },
        promoPrice: 0,
      };
      console.log(createProductDto)

      await this.create(userId, createProductDto, undefined);
    }

    return { message: 'Products imported successfully' };
  }
}