import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';


export const GET = async (request: NextRequest) => {
    try {
        const projectId = await prisma.project.count()
        const clients = await prisma.client.findMany()
        const subcontractors = await prisma.subContractor.findMany({where:{status:true}})
        const user = await prisma.user.findMany()
        const supplier = await prisma.supplier.findMany({where:{status:true}})

        return NextResponse.json({ status: true, projectId,clients,subcontractors,user,supplier})
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};

export const POST = async (request: NextRequest) => {
    try {
        const projectId = await prisma.project.count()
        const clients = await prisma.client.findMany()
        const subcontractors = await prisma.subContractor.findMany()
        const user = await prisma.user.findMany()
        const supplier = await prisma.supplier.findMany()

        return NextResponse.json({ status: true, projectId,clients,subcontractors,user,supplier})
    }
    catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
};