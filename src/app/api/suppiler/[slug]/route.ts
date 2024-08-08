import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
const schema = z.object({
    name: z.string().min(3),
    address: z.string().min(3),
    phone: z.string().max(11),
    supplierType: z.string(),
    email: z.string().email(),
    markup: z.number().max(100).min(0),
    notes: z.string().optional()
});


export const PUT = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const data = await prisma.supplier.update({
            where: {
                id: params.slug
            },
            data: {
                ...body,
                markup: body.markup.toString()
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
        const data = await prisma.supplier.findUnique({
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