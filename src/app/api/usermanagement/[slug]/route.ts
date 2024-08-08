import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
const schema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email("Invalid email address"),
    designation: z.string().min(1, "Designation is required"),
    role: z.string().min(1, "User Type is required"),
})


export const PUT = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const data = await prisma.user.update({
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
        const data = await prisma.user.findUnique({
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