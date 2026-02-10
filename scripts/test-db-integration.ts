import { PrismaClient, LinkType, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Starting Integration Tests ---')

  // 1. Create User (Supervisor)
  console.log('1. Creating Supervisor User...')
  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@test.com',
      password: 'password123',
      name: 'Test Supervisor',
      role: Role.SUPERVISOR
    }
  })
  console.log('✅ Supervisor created:', supervisor.id)

  // 2. Create TestLink
  console.log('2. Creating Identified Test Link...')
  const link = await prisma.testLink.create({
    data: {
      code: 'test-link-' + Date.now(),
      type: LinkType.IDENTIFIED,
      creatorId: supervisor.id,
      cpfCnpj: '12345678900',
      config: { allowSpeedTest: true, allowStreaming: false }
    }
  })
  console.log('✅ TestLink created:', link.code)

  // 3. Create TestResult
  console.log('3. Creating Test Result...')
  const result = await prisma.testResult.create({
    data: {
      testLinkId: link.id,
      cpfCnpj: '12345678900',
      downloadSpeed: 100.5,
      uploadSpeed: 50.2,
      ping: 10,
      externalStatus: { google: 'up', netflix: 'down' }
    }
  })
  console.log('✅ TestResult created:', result.id)

  // 4. Read Data
  console.log('4. Reading Data back...')
  const fetchedLink = await prisma.testLink.findUnique({
    where: { id: link.id },
    include: { results: true, creator: true }
  })
  
  if (!fetchedLink) throw new Error('Link not found')
  if (fetchedLink.results.length !== 1) throw new Error('Result count mismatch')
  if (fetchedLink.creator?.email !== 'supervisor@test.com') throw new Error('Creator mismatch')
  
  console.log('✅ Data verification passed')

  // 5. Update Link
  console.log('5. Updating Link...')
  const updatedLink = await prisma.testLink.update({
    where: { id: link.id },
    data: { isActive: false }
  })
  if (updatedLink.isActive !== false) throw new Error('Update failed')
  console.log('✅ Link updated (deactivated)')

  // 6. Cleanup
  console.log('6. Cleaning up...')
  await prisma.testResult.delete({ where: { id: result.id } })
  await prisma.testLink.delete({ where: { id: link.id } })
  await prisma.user.delete({ where: { id: supervisor.id } })
  console.log('✅ Cleanup complete')

  console.log('--- All Tests Passed Successfully ---')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Test Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
