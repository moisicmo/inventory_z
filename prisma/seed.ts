import * as bcrypt from 'bcrypt';
import { TypeAction, TypeDocument } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { TypeSubject } from '@/common/subjects';
import { createKardexInputTrigger } from './triggers/input.trigger';
import { createKardexOutputTrigger } from './triggers/output.trigger';

const SUPER_ADMIN_EMAIL = 'moisic.mo@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Muyseguro123*';

async function main() {
  console.log("🚀 Iniciando proceso de seeding...");

  try {
    // ============================================
    // 1. CREAR TODOS LOS PERMISOS DEL SISTEMA
    // ============================================
    console.log("📋 Creando permisos del sistema...");

    const actions: TypeAction[] = [
      TypeAction.manage,
      TypeAction.create,
      TypeAction.read,
      TypeAction.update,
      TypeAction.delete,
    ];

    // Obtener todos los subjects del enum
    // Si TypeSubject es un enum normal de TypeScript
    const subjects = Object.values(TypeSubject).filter(
      value => typeof value === 'string'
    ) as string[];

    console.log(`📊 Encontrados ${subjects.length} módulos del sistema`);

    // Crear todos los permisos (acción × módulo) en paralelo
    const upsertPromises: any[] = [];

    for (const subject of subjects) {
      for (const action of actions) {
        upsertPromises.push(
          prisma.permission.upsert({
            where: {
              action_subject: { action, subject },
            },
            update: {
              active: true,
              updatedAt: new Date(),
              updatedBy: SUPER_ADMIN_EMAIL
            },
            create: {
              action,
              subject,
              active: true,
              createdBy: SUPER_ADMIN_EMAIL,
            },
          })
        );
      }
    }

    const permissions = await Promise.all(upsertPromises);
    console.log(`✅ ${permissions.length} permisos creados/actualizados`);
    console.log(`📊 ${subjects.length} módulos × ${actions.length} acciones`);

    // ============================================
    // 2. CREAR USUARIO SUPER ADMIN
    // ============================================
    console.log("\n👑 Creando usuario Super Admin...");

    const salt = bcrypt.genSaltSync(10);
    const user = await prisma.user.upsert({
      where: { numberDocument: '123456789' },
      update: {
        email: SUPER_ADMIN_EMAIL,
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        numberDocument: '123456789',
        typeDocument: TypeDocument.dni,
        name: 'Moises',
        password: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, salt),
        lastName: 'Ochoa',
        email: SUPER_ADMIN_EMAIL,
        createdBy: SUPER_ADMIN_EMAIL,
      },
    });

    console.log(`✅ Usuario Super Admin creado: ${user.email}`);

    // ============================================
    // 3. CREAR SUCURSAL
    // ============================================
    console.log("\n🏢 Creando sucursal principal...");

    const branch = await prisma.branch.upsert({
      where: { name: 'Casa Matríz' },
      update: {
        type: 'sucursal',
        active: true,
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
        address: {
          update: {
            city: 'La Paz',
            zone: 'Uyustus',
            detail: 'Av siempreviva',
            updatedAt: new Date(),
            updatedBy: SUPER_ADMIN_EMAIL,
          }
        }
      },
      create: {
        type: 'sucursal',
        name: 'Casa Matríz',
        active: true,
        createdBy: SUPER_ADMIN_EMAIL,
        address: {
          create: {
            city: 'La Paz',
            zone: 'Uyustus',
            detail: 'Av siempreviva',
            createdBy: SUPER_ADMIN_EMAIL,
          }
        },
      }
    });

    console.log(`✅ Sucursal creada: "${branch.name}"`);

    // ============================================
    // 4. CREAR ROL "ADMINISTRADOR"
    // ============================================
    console.log("\n🎭 Creando rol Administrador...");

    const adminRole = await prisma.role.upsert({
      where: {
        branchId_name: {
          branchId: branch.id,
          name: 'Administrador'
        }
      },
      update: {
        active: true,
        permissions: {
          set: [], // Limpiar permisos existentes
          connect: permissions.map(p => ({ id: p.id })),
        },
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        branchId: branch.id,
        name: 'Administrador',
        active: true,
        createdBy: SUPER_ADMIN_EMAIL,
        permissions: {
          connect: permissions.map(p => ({ id: p.id })),
        },
      },
    });

    console.log(`✅ Rol creado: "${adminRole.name}"`);

    // ============================================
    // 5. ASIGNAR STAFF (SUPER ADMIN)
    // ============================================
    console.log("\n👔 Asignando Super Admin como staff...");

    await prisma.staff.upsert({
      where: { userId: user.id },
      update: {
        roleId: adminRole.id,
        active: true,
        superStaff: true,
        branches: {
          set: [], // Limpiar sucursales existentes
          connect: [{ id: branch.id }]
        },
        updatedAt: new Date(),
        updatedBy: SUPER_ADMIN_EMAIL,
      },
      create: {
        userId: user.id,
        roleId: adminRole.id,
        active: true,
        superStaff: true,
        createdBy: SUPER_ADMIN_EMAIL,
        branches: {
          connect: [{ id: branch.id }]
        },
      }
    });

    console.log(`✅ Super Admin asignado como staff de "${branch.name}"`);

    // ============================================
    // 6. DATOS DEMO (OPCIONAL - PARA DESARROLLO)
    // ============================================
    console.log("\n🎭 Creando datos de demostración...");

    // Solo crear datos demo si estamos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await createDemoData(branch.id, SUPER_ADMIN_EMAIL);
    }

    // ============================================
    // 7. CREAR TRIGGERS DE LA BASE DE DATOS
    // ============================================
    console.log("\n⚡ Creando triggers de base de datos...");

    await createKardexInputTrigger();
    await createKardexOutputTrigger();

    console.log("✅ Todos los triggers creados correctamente");

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(50));
    console.log(`👑 Super Admin: ${SUPER_ADMIN_EMAIL}`);
    console.log(`🔑 Contraseña: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`🏢 Sucursal: ${branch.name}`);
    console.log(`🔐 Permisos: ${permissions.length} creados`);
    console.log(`👥 Roles: 1 creado (Administrador)`);
    console.log("=".repeat(50));
    console.log("\n⚠️  ¡IMPORTANTE!");
    console.log("1. Cambia la contraseña del Super Admin después del primer login");
    console.log("2. Revisa los triggers creados en la base de datos");
    console.log("3. Configura roles adicionales según sea necesario");
    console.log("=".repeat(50));

  } catch (error) {
    console.error('\n❌ ERROR durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// FUNCIÓN PARA DATOS DEMO (DESARROLLO)
// ============================================
async function createDemoData(branchId: string, createdBy: string) {
  try {
    console.log("📦 Creando datos demo...");

    // Aquí puedes crear datos demo específicos para tu sistema de kardex
    // Por ejemplo: categorías, proveedores, clientes, productos, etc.

    // Ejemplo: Crear categoría de productos
    const category = await prisma.category.upsert({
      where: { name: 'Electrónica' },
      update: {
        active: true,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        name: 'Electrónica',
        active: true,
        createdBy: createdBy,
      }
    });


    // Ejemplo: Crear marca de productos
    const brand = await prisma.brand.upsert({
      where: { name: 'TechBrand' },
      update: {
        active: true,
        description: 'Marca de tecnología de alta calidad',
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        name: 'TechBrand',
        description: 'Marca de tecnología de alta calidad',
        active: true,
        createdBy: createdBy,
      }
    });

    console.log(`✅ Categoría demo creada: "${category.name}"`);

    // Crear proveedor demo
    const provider = await prisma.provider.upsert({
      where: { name: 'Tech Supplies S.A.' },
      update: {
        active: true,
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        nit: '1020304050',
        name: 'Tech Supplies S.A.',
        contact: 'Juan Pérez',
        phone: ['+591 77788899'],
        active: true,
        createdBy: createdBy,
      }
    });

    console.log(`✅ Proveedor demo creado: "${provider.name}"`);

    // Crear producto demo
    const product = await prisma.product.upsert({
      where: { code: 'PROD001' },
      update: {
        categoryId: category.id,
        brandId: brand.id,
        name: 'Teclado Mecánico RGB',
        description: 'Teclado gaming mecánico con iluminación RGB',
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        categoryId: category.id,
        brandId: brand.id,
        name: 'Teclado Mecánico RGB',
        description: 'Teclado gaming mecánico con iluminación RGB',
        updatedAt: new Date(),
        createdBy: createdBy,
      }
    });

    console.log(`✅ Producto demo creado: "${product.name}" (${product.code})`);

    // Crear rol "Vendedor" con permisos limitados
    const sellerPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { subject: TypeSubject.product },
          { subject: TypeSubject.category },
          { subject: TypeSubject.customer },
          { subject: TypeSubject.sale },
        ]
      }
    });

    const sellerRole = await prisma.role.upsert({
      where: {
        branchId_name: {
          branchId: branchId,
          name: 'Vendedor'
        }
      },
      update: {
        active: true,
        permissions: {
          set: [],
          connect: sellerPermissions.map(p => ({ id: p.id })),
        },
        updatedAt: new Date(),
        updatedBy: createdBy,
      },
      create: {
        branchId: branchId,
        name: 'Vendedor',
        active: true,
        createdBy: createdBy,
        permissions: {
          connect: sellerPermissions.map(p => ({ id: p.id })),
        },
      }
    });

    console.log(`✅ Rol demo creado: "${sellerRole.name}"`);

    console.log("✅ Datos demo creados correctamente");
  } catch (error) {
    console.warn("⚠️  Algunos datos demo no pudieron crearse:", error instanceof Error ? error.message : 'Error desconocido');
    // Continuamos aunque falle la creación de datos demo
  }
}

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================
main()
  .then(() => {
    console.log("\n✨ Proceso de seeding finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 ERROR CRÍTICO:', error);
    process.exit(1);
  });