import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await hash("Abcd@123",12)
  const user = await prisma.user.upsert({
    where: { email: 'admin@mkconsultant.com' },
    update: {},
    create: {
      email: 'admin@mkconsultant.com',
      firstName:"admin",
      lastName:"admin",
      role:"ADMIN",
      designation:"admin",
	    password
    },
  })
  console.log({ user })
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })