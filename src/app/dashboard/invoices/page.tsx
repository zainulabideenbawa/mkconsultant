'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Invoice } from "@/types";
const Suppliers = () => {
    const [submiting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [invoicing,setInvoicing] = useState<Invoice[]>([])
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
        setInvoicing(body.clients)
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

      const generatePDF = async (id: string) => {
        setSubmitting(true)
        const data = invoicing.find(f => f.id === id)
        // console.log(data)
        if(!data) {
            setSubmitting(false)
            return null}
        const _c = data.client
        const _p = data.Project
        // console.log(_p,_c,data)
        if (!_c && _p) {
            setSubmitting(false)
            return null}
        // console.log(_p,_c,data)
        try {
            const res = await fetch('/api/generateInovice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/pdf'
                },
                body: JSON.stringify({
                    invoiceNumber: String(data.InvoiceId).padStart(6, "0"),
                    invoiceDate: new Date().toLocaleDateString(),
                    invoiceDueDate: new Date(data.dueDate).toLocaleDateString(),
                    name: _c?.name || "",
                    phone: _c?.phone || "",
                    email: _c?.email || "",
                    location: _c?.location || "",
                    total: `${String(data.Amount).toLocaleString()}`,
                    data: [{
                        no: 1,
                        description: `Project ID - ${String(_p?.projectId).padStart(6, '0')}, ${_p?.name}`,
                        price: `£ ${Number(data.Amount).toFixed(2)}`
                    }]
                })
            });
    
            if (res.ok) {
                const blob = await res.blob();  // Convert the response to a Blob (binary data)
                const url = window.URL.createObjectURL(blob);  // Create a temporary URL for the Blob
    
                // Create a link element
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Invoice ${data.InvoiceId}.pdf`);  // Set the file name for the download
                document.body.appendChild(link);  // Append the link to the document
                link.click();  // Programmatically click the link to trigger the download
                if (link?.parentNode)
                    // Clean up
                    link?.parentNode.removeChild(link);  // Remove the link element from the document
                window.URL.revokeObjectURL(url);  // Release the Blob URL to free up memory
            } else {
                console.error('Failed to download PDF:', res.statusText);
            }
        } catch (error) {
            console.error('Error while fetching the PDF:', error);
        }
        setSubmitting(false)
    
    };
    
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
                <SuplierTable rows={invoiceData} func={generatePDF} submiting={submiting} />
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
