import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";

const Suppliers =async () => {
    const clientData: {
        id: string,
        name: string,
        email: string,
        location: string,
        phone: string,
    }[] = await getData().then(r=>r.data)
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Clients</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField placeholder="Enter Inovice,Name" variant='outlined' label="Search" sx={{ flex: 2 }} />
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


async function getData() {
    let api = process.env.URL + '/api/client'
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