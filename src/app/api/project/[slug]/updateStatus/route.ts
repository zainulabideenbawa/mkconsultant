import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';

const schema = z.object({
    status: z.enum(["PAID", "UNPID"]),
    transactionType: z.string(),
    type: z.enum(["Material", "Invoice", "SubTask"]),
    id: z.string()
})

export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        const body = await schema.parse(_d)
        switch (body.type) {
            case "Material":
                const material = await prisma.material.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        payment: "PAID",
                        transactionType: body.transactionType
                    }
                })
                if (material) {
                    return NextResponse.json({ status: true, material })
                } else {
                    throw new Error("Failed to get suppliers")
                }
            case "SubTask":
                const subtask = await prisma.subTask.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        payment: "PAID",
                        transactionType: body.transactionType
                    }
                })
                if (subtask) {
                    return NextResponse.json({ status: true, subtask })
                } else {
                    throw new Error("Failed to get suppliers")
                }
            case "Invoice":
                const invoice = await prisma.invoice.update({
                    where: {
                        id: body.id
                    },
                    data: {
                        status: "PAID",
                        transactionType: body.transactionType
                    }
                })
                await prisma.project.update({
                    where:{
                        id:params.slug
                    },
                    data:{
                        remainingAmount:{
                            decrement:invoice.Amount
                        }
                    }
                })
                if (invoice) {
                    return NextResponse.json({ status: true, invoice })
                } else {
                    throw new Error("Failed to get suppliers")
                }
        }

    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};