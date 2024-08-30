import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';
const schema = z.object({
    name: z.string().min(3),
    address: z.string().min(3),
    phone: z.string().max(11),
    email: z.string().email(),
    dateOfBirth: z.string(),
    applicantType: z.string().min(1),
    approxTeamSize: z.string(),
    dailyRate: z.string(),
    areasOfWork: z.string(),
    taxStatus: z.string().min(1),
    tools: z.array(z.string()).optional(),
    transport: z.array(z.string()).optional(),
    licence: z.array(z.string()).optional(),
    experienceType: z.array(z.string()).optional(),
    experiencePartitions: z.array(z.string()).optional(),
    notes: z.string().optional()
});



export const POST = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const data = await prisma.subContractor.create({
            data: {
                ...body,
                dateOfBirth: new Date(body.dateOfBirth).toISOString()
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


export const GET = async (request: NextRequest) => {
    try {
        const data = await prisma.subContractor.findMany({
            where: {
                status: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                address: true,
                phone: true,
                applicantType: true,
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

export const PUT = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        const data = await prisma.subContractor.update({
            where: {
                id: _d.id
            },
            data: {
                status: false
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