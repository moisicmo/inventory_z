import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    const totalProducts = await this.prisma.product.count({
      where: { active: true },
    });
    const totalCustomers = await this.prisma.customer.count({
      where: { active: true },
    });
    const totalBranches = await this.prisma.branch.count({
      where: { active: true },
    });
    const totalOrders = await this.prisma.order.count({
      where: {
      },
    });

    const orders = await this.prisma.order.findMany({
      select: { createdAt: true },
    });

    // Procesar inscripciones por mes
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const countByMonth: Record<number, number> = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      countByMonth[month] = (countByMonth[month] || 0) + 1;
    });

    const ordersData = months.map((m, i) => ({
      month: m,
      count: countByMonth[i] || 0,
    }));

    return {
      metrics: {
        totalProducts,
        totalCustomers,
        totalBranches,
        totalOrders,
      },
      ordersData,
    };
  }

}
