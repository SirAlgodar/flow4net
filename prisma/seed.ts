import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Validate environment before starting
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is missing.')
  console.error('   Please create a .env file based on .env.example')
  process.exit(1)
}

if (!process.env.DATABASE_URL.startsWith('mysql://')) {
  console.error('❌ Error: DATABASE_URL must start with mysql://')
  console.error('   Current value starts with:', process.env.DATABASE_URL.split('://')[0] + '://')
  console.error('   Note: Even for MariaDB, you must use the mysql:// protocol for Prisma.')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  console.log('   Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')) // Mask password

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // 1. Create Default Admin
    console.log('   Creating/Updating admin user...')
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
    console.log('   Creating/Updating default test link...')
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

    console.log('✅ Seed completed successfully!')
    console.log('   Admin user: admin / admin123')
  } catch (error) {
    console.error('❌ Seed failed with error:')
    throw error
  }
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
