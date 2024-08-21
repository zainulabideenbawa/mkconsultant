import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';


export const GET = async (request: NextRequest) => {
    try {
        const invoiceID = await prisma.invoice.count()
        const clients = await prisma.client.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectId: true,
                        totalAmount: true,
                        remainingAmount: true
                    }
                }
            }
        })

        return NextResponse.json({ status: true, invoiceID, clients, })
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};
export const POST = async (request: NextRequest) => {
    try {
        const invoiceID = await prisma.invoice.count()
        const clients = await prisma.client.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectId: true,
                        totalAmount: true,
                        remainingAmount: true
                    }
                }
            }
        })

        return NextResponse.json({ status: true, invoiceID, clients, })
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};