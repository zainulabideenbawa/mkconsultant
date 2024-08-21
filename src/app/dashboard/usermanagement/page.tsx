'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { useEffect, useState } from "react";

const Suppliers = () => {
    // const userData:  = await getData().then(d=>d.)
    const [loading, setLoading] = useState(true)
    const [search,setSearch] = useState("")
    const [orignal, setOrignal] = useState< {
        id: string,
        userName: string,
        email: string,
        designation: string,
        role: string,
    }[]>([])

    const [userData, setUserData] = useState< {
        id: string,
        userName: string,
        email: string,
        designation: string,
        role: string,
    }[]>([])

    useEffect(() => {
        getData()
    }, [])
    useEffect(() => {
        if (search === "" || !search) {
            setUserData(orignal)
        } else {
            setUserData(orignal.filter(f => f.userName.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
        }
    }, [search])

    async function getData() {
        const res = await fetch('/api/usermanagement', { cache: 'no-store' })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {

            throw new Error('Failed to fetch data')
        }

        let body = await res.json()
        setUserData(body.data.map((r:any)=>({...r,userName:r.firstName+" "+r.lastName})))
        setOrignal(body.data.map((r:any)=>({...r,userName:r.firstName+" "+r.lastName})))
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
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>User Management</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter Name,Email" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Link href={`/dashboard/usermanagement/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Add New User</Button>
                    </Link>
                </Box>
                <SuplierTable rows={userData} />
            </Paper>
        </main>
    )
}

export default Suppliers

  