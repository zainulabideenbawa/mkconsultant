import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
    try {
        const client = await prisma.client.findMany({
            take: 10,
            include:{
                project:true
            },
            orderBy: {
                id: "desc"
            }
        })
        const invoice = await prisma.invoice.findMany({
            include: {
                client: true
            },
            take: 10,
            orderBy: {
                InvoiceId: 'desc'
            }
        })
        const project = await prisma.project.findMany({
            include:{
                client:true
            }
        })
        let total = project.reduce((total, subTask) => total + (subTask.totalAmount), 0)
        let earning = project.reduce((total, subTask) => total + (subTask.totalAmount * (Number(subTask.materialMarkUp) / 100)), 0)
        return NextResponse.json({ status: true, total, earning, invoice, project, client })

    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};
export const POST = async (request: NextRequest) => {
    try {
        const data = await prisma.client.findMany({})
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