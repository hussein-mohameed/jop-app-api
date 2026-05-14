import { prisma } from './src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      firstName: true,
      lastName: true
    }
  });
  console.log("Users:", users);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
