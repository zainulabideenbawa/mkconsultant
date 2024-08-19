import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';

const materialSchema = z.object({
    material: z.string(),
    requireFor: z.string(),
    supplierId: z.string(),
    quantity: z.string().transform(v => parseFloat(v)),
    unit: z.string(),
    price: z.string().transform(v => parseFloat(v)),
    vat: z.string().transform(v => parseFloat(v)),
    totalCost: z.number(),
});





export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        console.log(params, "params")
        const _d = await request.json()
        console.log(_d, "body")
        const body = await materialSchema.parse(_d)
        const data = await prisma.material.create({
            data: {
                ...body,
                projectId: params.slug as unknown as string
            },
            include: {
                supplier: true,
            }
        })
        return NextResponse.json({ status: true, data })
        // } else {
        //     throw new Error("Failed to get suppliers")
        // }

    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};