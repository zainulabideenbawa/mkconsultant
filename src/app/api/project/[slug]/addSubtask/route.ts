import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';


const subTaskSchema = z.object({
    subTaskId: z.string(),
    subTaskName: z.string(),
    description: z.string(),
    assignTo: z.string(),
    startDate: z.string().transform(x => new Date(x).toISOString()), // Assuming these are coming in as ISO strings
    endDate: z.string().transform(x => new Date(x).toISOString()),
    addCost: z.number(),
    vat: z.number(),
});


export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        console.log(params, "params")
        const _d = await request.json()
        console.log(_d, "body")
        const body = await subTaskSchema.parse(_d)
        const data = await prisma.subTask.create({
            data: {
                name: body.subTaskName,
                description: body.description,
                assingTo: body.assignTo,
                startDate: body.startDate,
                endDate: body.endDate,
                cost: body.addCost,
                vat: body.vat,
                projectId: params.slug as unknown as string
            },
            include: {
                subContactor: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        email: true,
                        phone: true,
                    }
                },
            }
        })
        await prisma.project.update({
            where:{
                id:params.slug
            },
            data:{
                totalAmount:{
                    increment:body.addCost + (body.addCost*(body.vat/100)),
                },
                remainingAmount:{
                    increment:body.addCost + (body.addCost*(body.vat/100)),
                }
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

export const PUT = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        const data = await prisma.subTask.update({
            where:{
                id:_d.id
            },
            data:{
                payment:_d.payment,
                transactionType:_d.transactionType
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