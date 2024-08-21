'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { useEffect, useState } from "react";
const Suppliers = () => {
    const [loading, setLoading] = useState(true)
    const [search,setSearch] = useState("")
    const [orignal, setOrignal] = useState< {
        id: string,
        name: string,
        email: string,
        location: string,
        phone: string,
    }[]>([])

    const [clientData, setClientData] = useState< {
        id: string,
        name: string,
        email: string,
        location: string,
        phone: string,
    }[]>([])

    useEffect(() => {
        getData()
    }, [])
    useEffect(() => {
        if (search === "" || !search) {
            setClientData(orignal)
        } else {
            setClientData(orignal.filter(f => f.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
        }
    }, [search])

    async function getData() {
        const res = await fetch('/api/client', { cache: 'no-store' })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {

            throw new Error('Failed to fetch data')
        }

        let body = await res.json()
        setClientData(body.data)
        setOrignal(body.data)
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
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Clients</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter Inovice,Name" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Box sx={{ flex: 1 }} />
                    <Link href={`/dashboard/clients/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Create New Client</Button>
                    </Link>
                </Box>
                <SuplierTable rows={clientData} />
            </Paper>
        </main>
    )
}

export default Suppliers
