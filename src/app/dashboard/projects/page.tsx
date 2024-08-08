import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";

const Projects = async () => {

    const projects: {
        id: string,
        projectId:string,
        projectName:string,
        clientName:string,
        projectLocation:string,
        startDate:string,
        endDate:string,
        stauts:string,
        payment:string,
    }[] = [...Array(100).keys()].map((index) => ({
        id: index + 1 + "",
        projectId:faker.number.int().toLocaleString(),
        projectName:"Roof Fixing",
        clientName:faker.person.fullName(),
        projectLocation:faker.location.country(),
        startDate:faker.date.past().toLocaleDateString(),
        endDate:faker.date.future().toLocaleDateString(),
        stauts:faker.helpers.arrayElement(['ACTIVE','PENDING',"COMPLETED"]),
        payment:faker.helpers.arrayElement(['PENDING','COMPLETE PAYMENT']),


    }))
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

