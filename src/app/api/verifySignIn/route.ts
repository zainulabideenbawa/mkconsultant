import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import speakeasy from 'speakeasy';
import { z } from 'zod'
import { compare } from 'bcrypt'
const useSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json()
        const credentials = await useSchema.parse(body)
        const user = await prisma.user.findUnique({
            where: {
                email: credentials.email
            }
        })

        if (!user) {
            return new Error("Email or Password Not Matched")
        }
        console.log(user)
        if (!user.password) {
            return  new Error("Email or Password Not Matched")
        }

        const isPasswordValid = await compare(
            credentials.password,
            user.password
        )

        if (!isPasswordValid) {
            return new Error("Email or Password Not Matched")
        }
        // After validating the user and password
        if (user.twoFactorEnabled) {

            return NextResponse.json({
                id: user.id,
                email: user.email,
                name: user.firstName + " " + user.lastName,
                role: user.role,
                twoFactorRequired: true,
                twoFactorSecret: user.twoFactorSecret // Include the secret for verification
            })
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.firstName + " " + user.lastName,
            role: user.role,
            twoFactorRequired: false,
            twoFactorSecret: "" // Include the secret for verification
        })

    } catch (e: any) {
        console.log(e, "error")
        // return NextResponse.json({ error:"Please Read the Document Carefully there is some parametor is missing"}, { status: 400 })
        return NextResponse.json({ error: e.message, status: false }, { status: 400 })
    }
}