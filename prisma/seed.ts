import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'


const prisma = new PrismaClient()

async function main() {
  const password = await hash("Abcd@123",12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@mkconsultant.com' },
    update: {},
    create: {
      email: 'demo@mkconsultant.com',
      firstName:"demo",
      lastName:"demo",
      role:"demo",
      designation:"demo",
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