import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  const passwordHash = await bcrypt.hash('demo123', 10)

  await prisma.user.upsert({
    where: { email: 'demo@loop.com' },
    update: { passwordHash, role: 'VIEWER', workspaceId: admin.workspaceId },
    create: {
      name: 'Demo Viewer',
      email: 'demo@loop.com',
      passwordHash,
      role: 'VIEWER',
      workspaceId: admin.workspaceId,
    },
  })

  console.log('Demo Viewer ready: demo@loop.com / demo123 (VIEWER)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())