
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

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
    const role = await prisma.role.create({
      data: {
        name: 'admin',
      }
    });
    await prisma.staff.create({
      data: {
        userId: user.id,
        roleId: role.id,
        password: hashedPassword,
      }
    });
    console.log('✅ Datos de semilla insertados correctamente.');
  } catch (error) {
    console.error('❌ Error al insertar datos de semilla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
