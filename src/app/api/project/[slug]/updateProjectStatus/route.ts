import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';


export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()

        const data = await prisma.project.update({
            where: {
                id: params.slug
            },
            data: {
                status: _d.status
            }
        })
        if (data) {
            return NextResponse.json({ status: true, data })
        } else {
            throw new Error("Failed to get suppliers")
        }
    }


    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};