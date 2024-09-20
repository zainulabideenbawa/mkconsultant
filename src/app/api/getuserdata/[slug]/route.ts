import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    let getData = await prisma.user.findFirst({where:{
        email:params.slug
    }})
    if(getData){
        return NextResponse.json({ status: true, getData })
    }else{
        return NextResponse.json({ status: false })
    }
}
export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    let getData = await prisma.user.findFirst({where:{
        email:params.slug
    }})
    if(getData){
        return NextResponse.json({ status: true, getData })
    }else{
        return NextResponse.json({ status: false })
    }
}