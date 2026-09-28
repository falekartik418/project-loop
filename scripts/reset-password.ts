import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 12)
  const result = await db.user.updateMany({
    where: { email: { in: ['admin@loop.com', 'analyst@loop.com', 'viewer@loop.com'] } },
    data: { passwordHash: hash },
  })
  console.log(`Updated ${result.count} users`)
}

main().finally(() => db.$disconnect())