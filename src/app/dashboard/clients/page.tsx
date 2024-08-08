import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";

const Suppliers = () => {
    const clientData: {
        id: string,
        clientName: string,
        email: string,
        location: string,
        phone: string,
    }[] = [...Array(100).keys()].map((index) => ({
        id: index + 1 + "",
        clientName: faker.person.firstName(),
        email: faker.internet.email(),
        location: faker.location.secondaryAddress(),
        phone: faker.phone.number(),
       

    }))
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Clients</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField placeholder="Enter Inovice,Name" variant='outlined' label="Search" sx={{ flex: 2 }} />
                    <Box sx={{ flex: 5 }} />
                    <Box sx={{ flex: 1 }}/>
                    {/* <Link href={`/dashboard/invoices/add`}>
                        <Button variant='contained' fullWidth sx={{ flex: 1 }} >Generate NEw Invoice</Button>
                    </Link> */}
                </Box>
                <SuplierTable rows={clientData} />
            </Paper>
        </main>
    )
}

export default Suppliers