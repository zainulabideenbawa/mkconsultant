
import { CustomCard } from "@/components/card";
import DashboardTable from "@/components/table/dashboradTable";
import { Button, Container, Divider, Grid, Typography, Box } from "@mui/material";
import { faker } from '@faker-js/faker';

import Image from "next/image";

export default function Home() {
  const cardData = [
    {
      title: "Completed Projects",
      number: "380",
    },
    {
      title: "Clients",
      number: "350",
    },
    {
      title: "Earnings",
      number: "$342,923",
    },
    {
      title: "Revenue",
      number: "$54,000",
    },

  ]
  const recentClient = [
    { name: "John Doe", projectId: "#1234" },
    { name: "Jane Doe", projectId: "#1234" },
    { name: "John Doe", projectId: "#1234" },
    { name: "Jane Doe", projectId: "#1234" },
    { name: "John Doe", projectId: "#1234" },
    { name: "Jane Doe", projectId: "#1234" },
    { name: "John Doe", projectId: "#1234" },
  ]
  const recetInvoices = [
    {
      name: "John Doe",
      invoiceId: "#1234",
      amount: "$1234"
    },
    {
      name: "John Doe",
      invoiceId: "#1234",
      amount: "$1234"
    },
    {
      name: "John Doe",
      invoiceId: "#1234",
      amount: "$1234"
    }
  ]
  const randomDataGeneratorforTable: {
    id: number,
    clientName: string,
    date: string,
    project: string,
    quote: string,
    status: string,
  }[] = [...Array(100).keys()].map((index) => ({
    id: index + 1,
    clientName: faker.person.firstName(),
    date: `${new Date().toLocaleDateString()}`,
    project: 'Call',
    quote: `$${Math.floor(Math.random() * 10000).toLocaleString()}`,
    status: ['Pending', 'Active', 'Approved'][Math.floor(Math.random() * 3)]

  }))
  return (
    <main>
      <Grid container spacing={3}>
        {cardData.map((data, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <CustomCard title={data.title} number={data.number} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={8}>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Pending Projects</Typography>
            <DashboardTable rows={randomDataGeneratorforTable.filter(s=>s.status==="Pending")} />
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Active Jobs</Typography>
            <DashboardTable rows={randomDataGeneratorforTable.filter(s=>s.status==="Active")} />
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Approved Project</Typography>
            <DashboardTable rows={randomDataGeneratorforTable.filter(s=>s.status==="Approved")} />
          </Container>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h4">Recent Clients</Typography>
            {
              recentClient.map((client, index) => (
                <>
                  <Typography variant="h6">{client.name}</Typography>
                  <Typography variant="body1">{client.projectId}</Typography>
                  <Divider />
                </>
              ))
            }
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h4">Recent Invoices</Typography>
            {
              recetInvoices.map((invoice, index) => (
                <Box sx={{ marginTop: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: 'space-between', marginBottom: 2 }}>
                    <Box>
                      <Typography variant="h6">Invoice # {invoice.name}</Typography>
                      <Typography variant="body1">Clinet : {invoice.name}</Typography>
                    </Box>
                    <Button variant='outlined'>View</Button>
                  </Box>
                  <Divider />
                </Box>
              ))
            }

          </Container>
        </Grid>
      </Grid>

    </main>
  );
}
