import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common';
import { CloudinaryService } from '@/common/cloudinary/clodinary.service';
import { productDefaultSelect } from '@/prisma/interfaces';

@Injectable()
export class ProductService {

  constructor(
    @Inject('ExtendedPrisma') private readonly prisma: PrismaService['extendedPrisma'],
    private readonly cloudinaryService: CloudinaryService,
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
    const { categoryId, name, branchId, typeUnit, price } = createProductDto;
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
        prices: {
          create: {
            branchId,
            typeUnit,
            price,
          },
        },
      },
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
        select: productDefaultSelect,
      }),
      meta: { total: totalPages, page, lastPage },
    };
  }



  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productDefaultSelect,
    });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, image?: Express.Multer.File) {
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

    const resolvedBranchId = branchId ?? existingProduct.prices[0].branch.id;

    // Validar si ya existe un precio activo con esos valores
    const existingPrice = await this.prisma.price.findFirst({
      where: {
        productId: id,
        branchId: resolvedBranchId,
        typeUnit,
        price,
        active: true,
      },
    });

    const updateData: any = {
      categoryId,
      name,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    if (!existingPrice) {
      updateData.prices = {
        create: {
          branchId: resolvedBranchId,
          typeUnit,
          price,
          changedReason,
        },
      };
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }




  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.product.update({
      where: { id },
      data: {
        active: false,
      },
    });
  }
}
