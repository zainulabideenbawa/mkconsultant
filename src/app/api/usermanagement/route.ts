import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
import { hash } from "bcrypt";
export const dynamic = 'force-dynamic';
const schema = z.object({
    firstName:z.string().min(2),
    lastName:z.string().min(2),
    email: z.string().email("Invalid email address"),
    designation: z.string().min(1, "Designation is required"),
    role: z.string().min(1, "User Type is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters long")
}).refine(data => data.password === data.confirmPassword, {
    message: "password and confirm password must be same",
    path: ["password", "confirmPassword"]
})


export const POST = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await schema.parse(_d)
        const hasedPasswrod = await hash(body.password, 12)
        const data = await prisma.user.create({
            data: {
                ...body,
                password:hasedPasswrod
            },
            select:{
                id:true,
                firstName:true,
                email:true,
                lastName:true,
                designation:true,
                role:true
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
        const data = await prisma.user.findMany({
            select:{
                id:true,
                firstName:true,
                email:true,
                lastName:true,
                designation:true,
                role:true
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