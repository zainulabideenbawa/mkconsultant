import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const schema = z.object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    client: z.string().min(1, "Client is required"),
    project: z.string().min(1, "Project is required"),
    dueDate: z.string().transform(x => new Date(x).toISOString()),
    amount: z.string(),
    notes: z.string(),
});

export const GET = async (request: NextRequest) => {
    try {

        const clients = await prisma.invoice.findMany({
            include: {
                client:true,
                Project:true
            }
        })

        return NextResponse.json({ status: true, clients, })
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};
export const POST = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const clients = await prisma.invoice.create({
            data: {
                clientId: body.client,
                projectId: body.project,
                dueDate: body.dueDate,
                Amount: Number(body.amount),
                remarks: body.notes,
                createdDate: new Date().toISOString()
            }
        })

        return NextResponse.json({ status: true, clients, })
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};