import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const subTaskSchema = z.object({
    subTaskId: z.string(),
    subTaskName: z.string(),
    description: z.string(),
    assignTo: z.string(),
    startDate: z.string().transform(x => new Date(x).toISOString()), // Assuming these are coming in as ISO strings
    endDate: z.string().transform(x => new Date(x).toISOString()),
    addCost: z.number(),
    vat: z.number(),
});

const materialSchema = z.object({
    material: z.string(),
    requiredFor: z.string(),
    supplier: z.string(),
    quantity: z.number(),
    unit: z.string(),
    price: z.string().transform(v => parseFloat(v)),
    vat: z.number(),
    totalCost: z.string().transform(v => parseFloat(v)),
});

const createProjectSchema = z.object({
    projectId: z.string(),
    projectName: z.string(),
    projectLocation: z.string(),
    startDate: z.string().transform(x => new Date(x).toISOString()),
    endDate: z.string().transform(x => new Date(x).toISOString()),
    projectManager: z.string(),
    contactPerson: z.string(),
    phone: z.string().regex(/^\d+$/), // Ensuring only numbers
    clientId: z.string(),
    clientName: z.string(),
    phoneNumber: z.string().regex(/^\d+$/), // Ensuring only numbers
    clientAddress: z.string(),
    notes: z.string().optional(),
    email: z.string().email(),
    subTasks: z.array(subTaskSchema),
    materials: z.array(materialSchema),
    clientMainID: z.string()
});



export const POST = async (request: NextRequest) => {
    try {
        const _d = await request.json()
        console.log(_d, "body")
        const body = await createProjectSchema.parse(_d)
        let client = body.clientId
        const clients = await prisma.client.findFirst({
            where: {
                email: body.email
            }
        })
        if (!clients) {
            const getClient = await prisma.client.create({
                data: {
                    name: body.clientName,
                    phone: body.phoneNumber,
                    location: body.clientAddress,
                    email: body.email,
                },
                select: {
                    id: true
                }
            })
            client = getClient.id
        }
        const data = await prisma.project.create({
            data: {
                name: body.projectName,
                location: body.projectLocation,
                startDate: body.startDate,
                endDate: body.endDate,
                projectManager: body.projectManager,
                contactPerson: body.contactPerson,
                phone: body.phone,
                clientId: client,
                materialMarkUp: "0",
                totalAmount: Number(body.subTasks.reduce((total, subTask) => total + (subTask.addCost + (subTask.vat / 100 * subTask.addCost)), 0)) + Number(body.materials.reduce((total, subTask) => total + subTask.totalCost, 0)),
                remainingAmount: Number(body.subTasks.reduce((total, subTask) => total + (subTask.addCost + (subTask.vat / 100 * subTask.addCost)), 0)) + Number(body.materials.reduce((total, subTask) => total + subTask.totalCost, 0)),
                Material: {
                    create: body.materials.map(m => ({
                        material: m.material,
                        requireFor: m.requiredFor,
                        supplierId: m.supplier,
                        totalCost: m.totalCost,
                        quantity: m.quantity,
                        unit: m.unit,
                        price: m.price,
                        vat: m.vat
                    }))
                },
                SubTask: {
                    create: body.subTasks.map(sub => ({
                        name: sub.subTaskName,
                        description: sub.description,
                        assingTo: sub.assignTo,
                        startDate: sub.startDate,
                        endDate: sub.endDate,
                        cost: sub.addCost,
                        vat: sub.vat,
                    }))
                }
            }
        })
        if (body) {
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
        const data = await prisma.project.findMany({
            select: {
                id: true,
                projectId: true,
                name: true,
                client: {
                    select: {
                        name: true
                    }
                },
                location: true,
                startDate: true,
                endDate: true,
                status: true,
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