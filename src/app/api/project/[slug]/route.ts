import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';





export const GET = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const data = await prisma.project.findUnique({
            where: {
                id: params.slug
            },
            include: {
                documents: true,
                SubTask: {
                    include: {
                        subContactor: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                },
                client: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                Material: {
                    include: {
                        supplier: true
                    }
                },

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