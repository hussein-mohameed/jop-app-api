/**
 * @file Database seed script.
 * Seeds default departments, leave types, and admin user.
 *
 * Run: npx prisma db seed
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // --- Departments ---
  const departments = [
    { name: 'Human Resources', code: 'HR', description: 'Human Resources department' },
    { name: 'Engineering', code: 'ENG', description: 'Software Engineering department' },
    { name: 'Finance', code: 'FIN', description: 'Finance and Accounting department' },
    { name: 'Marketing', code: 'MKT', description: 'Marketing and Communications department' },
    { name: 'Operations', code: 'OPS', description: 'Operations and Infrastructure department' },
    { name: 'Sales', code: 'SLS', description: 'Sales department' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log(`  ✅ ${departments.length} departments seeded`);

  // --- Leave Types ---
  const leaveTypes = [
    { name: 'Annual Leave', code: 'ANNUAL', defaultDays: 21, isPaid: true, color: '#3b82f6' },
    { name: 'Sick Leave', code: 'SICK', defaultDays: 14, isPaid: true, color: '#ef4444' },
    { name: 'Personal Leave', code: 'PERSONAL', defaultDays: 5, isPaid: true, color: '#8b5cf6' },
    { name: 'Maternity Leave', code: 'MATERNITY', defaultDays: 90, isPaid: true, color: '#ec4899' },
    { name: 'Paternity Leave', code: 'PATERNITY', defaultDays: 14, isPaid: true, color: '#06b6d4' },
    { name: 'Unpaid Leave', code: 'UNPAID', defaultDays: 30, isPaid: false, color: '#71717a' },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
  }
  console.log(`  ✅ ${leaveTypes.length} leave types seeded`);

  // --- Admin User ---
  const adminEmail = 'admin@company.com';
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'COMPANY_ADMIN',
    },
  });
  console.log(`  ✅ Admin user seeded: ${adminEmail}`);

  // --- HR Manager ---
  const hrEmail = 'hr@company.com';
  const hrPassword = await bcrypt.hash('HRManager@123', 12);

  const hrDept = await prisma.department.findUnique({ where: { code: 'HR' } });

  const hrUser = await prisma.user.upsert({
    where: { email: hrEmail },
    update: {},
    create: {
      email: hrEmail,
      passwordHash: hrPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR_MANAGER',
    },
  });

  // Create employee record for HR Manager
  if (hrDept) {
    await prisma.employee.upsert({
      where: { userId: hrUser.id },
      update: {},
      create: {
        userId: hrUser.id,
        employeeId: 'EMP-00001',
        departmentId: hrDept.id,
        position: 'HR Manager',
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        hireDate: new Date('2024-01-01'),
      },
    });
  }
  console.log(`  ✅ HR Manager seeded: ${hrEmail}`);

  console.log('\\n🎉 Database seeding completed!');
  console.log('\\n📋 Default credentials:');
  console.log('   Admin: admin@company.com / Admin@123');
  console.log('   HR:    hr@company.com / HRManager@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
