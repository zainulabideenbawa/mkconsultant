import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";

const Projects = async () => {

    const projects: {
        id: string,
        projectId: string,
        name: string,
        clientName: string,
        location: string,
        startDate: string,
        endDate: string,
        status: string,
    }[] = await getData().then(d => d.data.map((f: any) => ({ ...f, clientName: f.client.name })))
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Projects</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField placeholder="Enter Name,Email" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Link href={`/dashboard/projects/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Add New Project</Button>
                    </Link>
                </Box>
                <SuplierTable rows={projects} />
            </Paper>
        </main>
    )
}

export default Projects

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


