import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  branchDefaultSelect,
  categoryDefaultSelect,
  permissionDefaultSelect,
  productDefaultSelect,
  roleDefaultSelect,
  userDefaultSelect,
} from './interfaces';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  readonly extendedPrisma = this.$extends({
    query: {
      user: {
        async create({ args, query }) {
          args.select = args.select || userDefaultSelect;
          return query(args);
        },
        async findMany({ args, query }) {
          args.select = args.select || userDefaultSelect;
          return query(args);
        },
        async findUnique({ args, query }) {
          args.select = args.select || userDefaultSelect;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.select = args.select || userDefaultSelect;
          return query(args);
        },
        async update({ args, query }) {
          args.select = args.select || userDefaultSelect;
          return query(args);
        },
      },
      role: {
        async create({ args, query }) {
          args.select = args.select || roleDefaultSelect;
          return query(args);
        },
        async findMany({ args, query }) {
          args.select = args.select || roleDefaultSelect;
          return query(args);
        },
        async findUnique({ args, query }) {
          args.select = args.select || roleDefaultSelect;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.select = args.select || roleDefaultSelect;
          return query(args);
        },
        async update({ args, query }) {
          args.select = args.select || roleDefaultSelect;
          return query(args);
        },
      },
      permission: {
        async findMany({ args, query }) {
          args.select = args.select || permissionDefaultSelect;
          return query(args);
        },
      },
      branch: {
        async create({ args, query }) {
          args.select = args.select || branchDefaultSelect;
          return query(args);
        },
        async findMany({ args, query }) {
          args.select = args.select || branchDefaultSelect;
          return query(args);
        },
        async findUnique({ args, query }) {
          args.select = args.select || branchDefaultSelect;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.select = args.select || branchDefaultSelect;
          return query(args);
        },
        async update({ args, query }) {
          args.select = args.select || branchDefaultSelect;
          return query(args);
        },
      },
      category: {
        async create({ args, query }) {
          args.select = args.select || categoryDefaultSelect;
          return query(args);
        },
        async findMany({ args, query }) {
          args.select = args.select || categoryDefaultSelect;
          return query(args);
        },
        async findUnique({ args, query }) {
          args.select = args.select || categoryDefaultSelect;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.select = args.select || categoryDefaultSelect;
          return query(args);
        },
        async update({ args, query }) {
          args.select = args.select || categoryDefaultSelect;
          return query(args);
        },
      },
      product: {
        async create({ args, query }) {
          args.select = args.select || productDefaultSelect;
          return query(args);
        },
        async findMany({ args, query }) {
          args.select = args.select || productDefaultSelect;
          return query(args);
        },
        async findUnique({ args, query }) {
          args.select = args.select || productDefaultSelect;
          return query(args);
        },
        async findFirst({ args, query }) {
          args.select = args.select || productDefaultSelect;
          return query(args);
        },
        async update({ args, query }) {
          args.select = args.select || productDefaultSelect;
          return query(args);
        },
      },
    },
  });
}