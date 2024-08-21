import { Button } from "@mui/material";
import { authOptions } from '@/components/authOptions'
import { getServerSession } from 'next-auth'
import { redirect  } from "next/navigation";
export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    redirect("/dashboard")
  }else{
    redirect('/auth/login')
  }
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <Button variant="contained" color="primary">
        Hello, World!
      </Button>
    </main>
  );
}
