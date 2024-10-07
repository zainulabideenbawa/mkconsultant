import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy';

export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    let getData = await prisma.user.findFirst({
        where: {
            email: params.slug
        }
    })
    if (getData) {
        return NextResponse.json({ status: true, getData })
    } else {
        return NextResponse.json({ status: false })
    }
}
export const POST = async (request: NextRequest) => {
    try {
        const { token, secret } = await request.json()
        const isValid = speakeasy.totp.verify({
            secret, // User's secret
            encoding: 'base32',
            token,  // The TOTP code entered by the user
        });
        console.log(isValid,"valid")
        if (isValid) {
            return NextResponse.json({ status: true})
        }else{
            return NextResponse.json({ status: false})
        }
    } catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
}