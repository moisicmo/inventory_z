import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPriceActiveTrigger } from './triggers/price.trigger';
import { createKardexInputTrigger } from './triggers/input.trigger';
import { createKardexOutputTrigger } from './triggers/output.trigger';

async function main() {
  const prisma = new PrismaClient();

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('Muyseguro123*', salt);
    const user = await prisma.user.create({
      data: {
        numberDocument: '123456789',
        typeDocument: 'DNI',
        name: 'moises',
        lastName: 'ochoa',
        email: 'moisic.mo@gmail.com',
      },
    });
    const permissions = await prisma.permission.createManyAndReturn({
      data: [
        { name: 'Crear Usuarios' },
        { name: 'Crear Clientes' },
        { name: 'Crear Productos' },
        { name: 'Crear Sucursales' },
        { name: 'Crear Categorias' },
        { name: 'Crear Roles' }
      ]
    });

    const role = await prisma.role.create({
      data: {
        name: 'admin',
        permissions: {
          connect: permissions.map(permission => ({ id: permission.id }))
        }
      }
    });
    await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: role.id,
        password: hashedPassword,
        branches: {
          create: {
            name: 'Casa Matríz',
            address: 'Avenida X',
          }
        }
      }
    });
    console.log('✅ Datos de semilla insertados correctamente.');
    await createPriceActiveTrigger(prisma);
    await createKardexInputTrigger(prisma);
    await createKardexOutputTrigger(prisma);

  } catch (error) {
    console.error('❌ Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
