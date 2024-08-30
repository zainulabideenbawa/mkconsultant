'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { useEffect, useState } from "react";

const Suppliers = () => {
    const [orignal, setOrignal] = useState<{
        id: string,
        name: string,
        email: string,
        address: string,
        phone: string,
        applicantType: string,
    }[]>([])
    const [search, setSearch] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [supilerData, setSupilerData] = useState<{
        id: string,
        name: string,
        email: string,
        address: string,
        phone: string,
        applicantType: string,
    }[]>([])


    useEffect(() => {
        getData()
    }, [])
    useEffect(() => {
        if (search === "" || !search) {
            setSupilerData(orignal)
        } else {
            setSupilerData(orignal.filter(f => f.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
        }
    }, [search])
    const deleteFunction = async (id: string) => {
        setDeleteLoading(true)
        const res = await fetch('/api/subcontractors', {
            method: "PUT",
            body: JSON.stringify({ id })
        })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {

            throw new Error('Failed to fetch data')
        }
        setDeleteLoading(false)
        getData()
    }
    async function getData() {
        const res = await fetch('/api/subcontractors', { cache: 'no-store' })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {

            throw new Error('Failed to fetch data')
        }

        let body = await res.json()
        setSupilerData(body.data)
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
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Sub-Contractors</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter Name,Email" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Link href={`/dashboard/subcontractors/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Add New Sub-contractor</Button>
                    </Link>
                </Box>
                <SuplierTable rows={supilerData} deleteFunction={deleteFunction} deleteLoading={deleteLoading} />
            </Paper>
        </main>
    )
}

export default Suppliers
