import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const palette = [
  '#645df1', '#fb7117', '#0fb987', '#ff535b', '#3d7fec',
  '#e6a700', '#8b5cf6', '#14b8a6', '#f43f5e', '#06b6d4',
]

async function main() {
  const themes = await db.theme.findMany()
  for (let i = 0; i < themes.length; i++) {
    await db.theme.update({
      where: { id: themes[i].id },
      data: { color: palette[i % palette.length] },
    })
  }
  console.log(`Colored ${themes.length} themes`)
}

main().finally(() => db.$disconnect())