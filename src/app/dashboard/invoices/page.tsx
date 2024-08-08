import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField } from "@mui/material";
import { faker } from '@faker-js/faker';
import SuplierTable from './table'
import Link from "next/link";

const Suppliers = () => {
    const invoiceData:  {
        id: string,
        clientName: string,
        invoice: string,
        location: string,
        phone: string,
        project: string,
        amount: string,
    }[] = [...Array(100).keys()].map((index) => ({
        id: index + 1 + "",
        clientName: faker.person.firstName(),
        invoice: Math.floor(Math.random()*10000).toString().padStart(6,'0'),
        location: faker.location.secondaryAddress(),
        phone: faker.phone.number(),
        project: Math.floor(Math.random()*10000).toString().padStart(6,'0'),
        amount: Number(faker.commerce.price({min:1000,max:10000})).toLocaleString(),

    }))
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Invoices</Typography>
            <Paper sx={{ padding: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                    <TextField placeholder="Enter Inovice,Name" variant='outlined' label="Search" sx={{ flex: 2 }} />
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