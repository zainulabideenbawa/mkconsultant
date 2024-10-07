import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { z } from 'zod';
import { compare } from 'bcrypt';

// Validation schema for the request body
const useSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const POST = async (request: NextRequest) => {
    try {
        // Parse the request body
        const body = await request.json();
        const credentials = useSchema.parse(body);  // Validate the request body

        // Fetch the user by email
        const user = await prisma.user.findUnique({
            where: { email: credentials.email }
        });

        // If user is not found or the password is not set, return an error
        if (!user || !user.password) {
            return NextResponse.json({ error: "Email or Password Not Matched", status: false }, { status: 401 });
        }

        // Check if the provided password is valid
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Email or Password Not Matched", status: false }, { status: 401 });
        }

        // If 2FA is enabled, return a response indicating 2FA is required
        if (user.twoFactorEnabled) {
            return NextResponse.json({
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
                twoFactorRequired: true,
                twoFactorSecret: user.twoFactorSecret // Include the secret for 2FA verification
            }, { status: 200 });
        }

        // If 2FA is not enabled, return the user details without 2FA requirement
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            twoFactorRequired: false,
            twoFactorSecret: "" // No secret needed if 2FA is not enabled
        }, { status: 200 });

    } catch (e: any) {
        // Log the error for debugging
        console.error("Error:", e);

        // Return a generic error response with status 400
        return NextResponse.json({ error: e.message || "An error occurred", status: false }, { status: 400 });
    }
};