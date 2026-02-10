import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 1. Create Default Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      password: hashedPassword,
      mustChangePassword: true,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Administrator',
      role: 'ADMIN',
      password: hashedPassword,
      mustChangePassword: true,
    },
  })
  
  // Create a default Quick Link
  await prisma.testLink.upsert({
    where: { code: 'quick' },
    update: {},
    create: {
        code: 'quick',
        type: 'QUICK',
        creatorId: admin.id,
        isActive: true
    }
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
