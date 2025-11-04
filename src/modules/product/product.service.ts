import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { CloudinaryService } from '@/common/cloudinary/clodinary.service';
import { ProductEntity } from './entities/product.entity';
import { ProductPresentationService } from '@/modules/productPresentation/productPresentation.service';
import { PriceService } from '@/modules/price/price.service';
import * as xlsx from 'xlsx';
import { TypeUnit } from '@prisma/client';
@Injectable()
export class ProductService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productPresentationService: ProductPresentationService,
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

  async create(email: string, createProductDto: CreateProductDto, image?: Express.Multer.File) {
    const { categoryId, brandId, providerId, name, namePresentation, code, branchId, typeUnit, price } = createProductDto;
    let imageUrl: string | null = null;
    if (image) {
      const uploadResults = await this.cloudinaryService.uploadFile(image, 'productos');
      imageUrl = uploadResults.secure_url;
    }

    return await this.prisma.product.create({
      data: {
        code: `P${Date.now()}`,
        categoryId,
        brandId,
        providerId,
        name,
        image: imageUrl,
        createdBy: email,
        productPresentations: {
          create: {
            code,
            branchId,
            name: namePresentation,
            typeUnit,
            createdBy: email,
            prices: {
              create: {
                price,
                createdBy: email,
              }
            },
          },
        },
      },
      select: ProductEntity,
    });
  }

  async findAll(paginationDto: PaginationDto) {
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
        select: ProductEntity,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: ProductEntity,
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }

    return product;
  }

  async update(email: string, id: string, updateProductDto: UpdateProductDto, image?: Express.Multer.File) {
    const { categoryId, name, branchId, typeUnit, price, changedReason } = updateProductDto;

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

    const resolvedBranchId = branchId ?? existingProduct.productPresentations[0].branch.id;
    const resolvedTypeUnit = typeUnit ?? existingProduct.productPresentations[0].typeUnit;
    let resolvedPrice = price ?? existingProduct.productPresentations[0].prices[0].price;

    // Buscar presentación existente
    const existingProductPresentation = await this.productPresentationService.findFirst(resolvedBranchId, resolvedTypeUnit, id);

    const updateData: any = {
      categoryId,
      name,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    if (!existingProductPresentation) {
      // Si no existe presentación, se crea junto con el precio
      updateData.presentations = {
        create: {
          branchId: resolvedBranchId,
          typeUnit,
          prices: {
            create: {
              price,
              changedReason,
            },
          },
        },
      };
    } else {
      // Si ya existe la presentación, verificamos si ya tiene ese precio activo
      const existingPrice = await this.priceService.findFirst(id, resolvedPrice);

      resolvedPrice = price ?? existingPrice?.price[0].price;

      if (!existingPrice) {
        // Creamos nuevo precio si no existe uno igual activo
        await this.priceService.create(
          email, {
          productPresentationId: existingProductPresentation.id,
          price: resolvedPrice,
          changedReason,
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      select: ProductEntity
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.product.update({
      where: { id },
      data: {
        active: false,
      },
      select: ProductEntity
    });
  }

  async importProducts(email: string, file: Express.Multer.File) {
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
            createdBy: email,
          },
        });
      }

      let branch = await this.prisma.branch.findFirst({
        where: { name: { equals: branchName, mode: 'insensitive' } },
      });

      if (!branch) {
        branch = await this.prisma.branch.create({
          data: {
            name: branchName,
            createdBy: email,
          },
        });
      }

      let brand = await this.prisma.brand.findFirst({
        where: { name: { equals: brandName, mode: 'insensitive' } },
      });

      if (!brand) {
        brand = await this.prisma.brand.create({
          data: {
            name: branchName,
            description: '',
            createdBy: email,
          },
        });
      }

      let provider = await this.prisma.provider.findFirst({
        where: { name: { equals: brandName, mode: 'insensitive' } },
      });

      if (!provider) {
        provider = await this.prisma.provider.create({
          data: {
            nit: '',
            name: branchName,
            phone: [],
            createdBy: email,
          },
        });
      }

      const createProductDto: CreateProductDto = {
        name: String(row['name']),
        categoryId: category.id,
        brandId: brand.id,
        providerId: provider.id,
        branchId: branch.id,
        code: '',
        namePresentation: String(row['namePresentation']),
        typeUnit: row['typeUnit'],
        price: Number(row['price']),
      };
      console.log(createProductDto)

      await this.create(email, createProductDto, undefined);
    }

    return { message: 'Products imported successfully' };
  }
}