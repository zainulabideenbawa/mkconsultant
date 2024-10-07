'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
const Suppliers = () => {
    const [loading, setLoading] = useState(true)
    const [orignal, setOrignal] = useState<{
        id: string,
        clientName: string,
        invoice: string,
        location: string,
        phone: string,
        project: string,
        amount: string,
    }[]>([])
    const [invoiceData, setInvoiceData] = useState<{
        id: string,
        clientName: string,
        invoice: string,
        location: string,
        phone: string,
        project: string,
        amount: string,
    }[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        getData()
    }, [])
    useEffect(() => {
        if (search === "" || !search) {
            setInvoiceData(orignal)
        } else {
            setInvoiceData(orignal.filter(f => f.clientName.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
        }
    }, [search])
    async function getData() {
        setLoading(true)
        const res = await fetch('/api/invoices', { cache: 'no-store' })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {
            throw new Error("Error in fetching Data")
        }
        let body = await res.json()
        console.log(body)
        setInvoiceData(body.clients.map((f: any) => (
            {
                id: f.id,
                clientName: f.client.name,
                invoice: String(f.InvoiceId).padStart(0,"6"),
                location: f.Project.location,
                phone: f.client.phone,
                project: String(f.Project.projectId).padStart(0,"6"),
                amount: Number(f.Amount).toFixed(2).toLocaleString(),
            }
        )))
        setOrignal(body.clients.map((f: any) => (
            {
                id: f.id,
                clientName: f.client.name,
                invoice: String(f.InvoiceId).padStart(0,"6"),
                location: f.Project.location,
                phone: f.client.phone,
                project: String(f.Project.projectId).padStart(0,"6"),
                amount: Number(f.Amount).toFixed(2).toLocaleString(),
            }
        )))
        setLoading(false)
    }
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>)
    }
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Invoices</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter Inovice,Name" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Link href={`/dashboard/invoices/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Generate NEw Invoice</Button>
                    </Link>
                </Box>
                <SuplierTable rows={invoiceData} />
            </Paper>
        </main>
    )
}

export default Suppliers


async function getData() {
    let api = process.env.URL + '/api/project'
    console.log(api, "api")
    const res = await fetch(api, { cache: 'no-store' })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        console.log(await res.json())
        throw new Error('Failed to fetch data')
    }

    // Only return the data, not the entire dashboard element
    return res.json()
    // return null
}
