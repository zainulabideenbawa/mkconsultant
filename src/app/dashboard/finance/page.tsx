'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

const Projects = () => {
    const [loading,setLoading] = useState(true)
    const [orignal, setOrignal] = useState<{
        id: string,
        projectId: string,
        name: string,
        clientName: string,
        location: string,
        startDate: string,
        endDate: string,
        status: string,
    }[]>([])
    const [projects, setProjects] = useState<{
        id: string,
        projectId: string,
        name: string,
        clientName: string,
        location: string,
        startDate: string,
        endDate: string,
        status: string,
    }[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        getData()
    }, [])
    useEffect(() => {
        if (search === "" || !search) {
            setProjects(orignal)
        } else {
            setProjects(orignal.filter(f =>f.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
        }
    }, [search])
    async function getData() {
        setLoading(true)
        const res = await fetch('/api/project', { cache: 'no-store' })
        // The return value is *not* serialized
        // You can return Date, Map, Set, etc.

        if (!res.ok) {
            throw new Error("Error in fetching Data")
        }
        let body = await res.json()
        setProjects(body.data.map((f: any) => ({ ...f, clientName: f.client.name })))
        setOrignal(body.data.map((f: any) => ({ ...f, clientName: f.client.name })))
        setLoading(false)
    }
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>)
    }
    return (
        <Suspense fallback={<CircularProgress />} >
            <main>
                <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Finances</Typography>
                <Paper sx={{ padding: 4 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                        <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter Name,Email" variant='outlined' label="Search" sx={{ flex: 2 }} />
                        <Box sx={{ flex: 5 }} />
                    </Box>
                    <SuplierTable rows={projects} />
                </Paper>
            </main>
        </Suspense>
    )
}

export default Projects




