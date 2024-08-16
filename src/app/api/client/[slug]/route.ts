import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
const schema = z.object({
    // clientId: z.string().min(1, "Client ID is required"),
    name: z.string().min(1, "Name is Required"),
    email: z.string().email(),
    location: z.string().min(1, "Address is Required"),
    phone: z.string().min(1, "Phone is Required").max(11),
});

export const PUT = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const data = await prisma.client.update({
            where: {
                id: params.slug
            },
            data: {
                ...body,
            }
        })
        if (data) {
            return NextResponse.json({ status: true, data })
        } else {
            throw new Error("Failed to add new supplier")
        }

    }
    catch (e: any) {
        // console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};


export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const data = await prisma.client.findUnique({
            where: {
                id: params.slug
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