import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';







export const POST = async (request: NextRequest, { params }: { params: { slug: string } }) => {
    try {
        const _d = await request.json()
        const projectData = await prisma.project.findUnique({
            where: {
                id: params.slug
            },
            include: {
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
                Material: {
                    include: {
                        supplier: true
                    }
                }
            }
        });
        if (!projectData) {
            throw new Error("Project not found");
        }
        let subTaskAmount = Number(projectData.SubTask.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0));
        let materialAmount = Number(projectData.Material.reduce((total, material) => total + material.totalCost, 0));
        let markupAmount = _d.markup !== "" && Number(_d.markup) > 0 
            ? (subTaskAmount + materialAmount) * (Number(_d.markup) / 100)
            : projectData.materialMarkUp !== "" && Number(projectData.materialMarkUp) > 0 
            ? (subTaskAmount + materialAmount) * (Number(projectData.materialMarkUp) / 100)
            : 0;
        let vat = (subTaskAmount + materialAmount + markupAmount) * 0.2;
        let totalAmount = subTaskAmount + materialAmount + markupAmount + vat;
        const data = await prisma.project.update({
            where: {
                id: params.slug
            },
            data: {
                materialMarkUp: _d.markup,
                qutationGenerated: true,
                totalAmount: totalAmount,
                remainingAmount: totalAmount
            },
            include: {
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