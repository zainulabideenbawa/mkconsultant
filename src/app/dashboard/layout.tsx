import { authOptions } from '@/components/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from "next/navigation";
import LayoutComponent from './LayoutComponent'

const Layout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login")
    }
    return (
        <LayoutComponent>
            {children}
        </LayoutComponent>
    )
}

export default Layout