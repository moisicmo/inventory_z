import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { CloudinaryService } from '@/common/cloudinary/clodinary.service';
import { ProductEntity } from './entities/product.entity';
import { ProductPresentationService } from '@/modules/productPresentation/productPresentation.service';
import { PriceService } from '@/modules/price/price.service';
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

  async create(createProductDto: CreateProductDto, image: Express.Multer.File) {
    const { categoryId, name, namePresentation, branchId, typeUnit, price } = createProductDto;
    let imageUrl: string | null = null;
    if (image) {
      const uploadResults = await this.cloudinaryService.uploadFile(image, 'productos');
      imageUrl = uploadResults.secure_url;
    }

    return await this.prisma.product.create({
      data: {
        code: `P${Date.now()}`,
        categoryId,
        name,
        image: imageUrl,
        productPresentations: {
          create: {
            branchId,
            name: namePresentation,
            typeUnit,
            prices: {
              create: {
                price,
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

  async update(id: string, updateProductDto: UpdateProductDto, image?: Express.Multer.File) {
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
        await this.priceService.create({
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
}
