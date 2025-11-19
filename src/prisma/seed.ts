import { PrismaClient, TypeAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createKardexInputTrigger } from './triggers/input.trigger';
import { createKardexOutputTrigger } from './triggers/output.trigger';
import { TypeSubject } from '../common/subjects';

async function main() {
  const prisma = new PrismaClient();
  const email = 'moisic.mo@gmail.com';
  try {
    // creamos la sucursal
    const branch = await prisma.branch.create({
      data: {
        name: 'Casa Matríz',
        createdBy: email,
        address: {
          create: {
            city: 'La Paz',
            zone: 'Uyustus',
            detail: 'Av siempreviva',
            createdBy: email,
          }
        },
      }
    });
    // creamos algunos permisos
    const permissions = await prisma.permission.createManyAndReturn({
      data: [
        { action: TypeAction.read, subject: TypeSubject[TypeSubject.all], createdBy: email },
        { action: TypeAction.create, subject: TypeSubject[TypeSubject.all], createdBy: email },
        { action: TypeAction.update, subject: TypeSubject[TypeSubject.all], createdBy: email },
        { action: TypeAction.delete, subject: TypeSubject[TypeSubject.all], createdBy: email },
        { action: TypeAction.manage, subject: TypeSubject[TypeSubject.all], createdBy: email },
      ]
    });
    // creamos el rol
    const role = await prisma.role.create({
      data: {
        branchId: branch.id,
        name: 'admin',
        createdBy: email,
        permissions: {
          connect: permissions.map((p) => ({ id: p.id }))
        }
      }
    });
    // creamos al usuario y staff
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('Muyseguro123*', salt);
    const user = await prisma.user.create({
      data: {
        numberDocument: '123456789',
        typeDocument: 'dni',
        name: 'moises',
        lastName: 'ochoa',
        email: email,
        createdBy: email,
      },
    });
    await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: role.id,
        password: hashedPassword,
        createdBy: email,
        branches: {
          connect: [
            { id: branch.id }
          ]
        }
      }
    });
    console.log('✅ Datos de semilla insertados correctamente.');
    await createKardexInputTrigger(prisma);
    await createKardexOutputTrigger(prisma);

  } catch (error) {
    console.error('❌ Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
