import prisma from '@/prisma';
import { compare, hash } from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';
const userDetailsSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    designation: z.string().min(1, "Designation is required")
});
const passwordChangeSchema = z.object({
    email: z.string().email(),
    currentPassword: z.string().min(6, "Current Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New Password must be at least 6 characters long")
})

export const POST = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await userDetailsSchema.parse(_d)
        const data = await prisma.user.update({
            where: {
                email: body.email
            },
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                designation: body.designation
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

export const PUT = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await passwordChangeSchema.parse(_d)
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!user) {
            throw new Error("No User Found")
        }
        if (!user.password) {
            throw new Error("No User Found")
        }

        const isPasswordValid = await compare(
            body.currentPassword,
            user.password
        )

        if (!isPasswordValid) {
            throw new Error("Password Not Matched")
        }
        const hasedPasswrod = await hash(body.newPassword, 12)
        const data = await prisma.user.update({
            where: {
                email: body.email
            },
            data: {
                password: hasedPasswrod
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

export const GET = async (request: NextRequest, { params }: { params: { slug: string } })  => {
    try {
        const data = await prisma.user.findFirst({
            where:{
                email:params.slug
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