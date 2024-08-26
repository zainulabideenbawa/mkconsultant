'use client'
import { Button, Grid, Typography, Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState } from "react";
import { Client } from "@/types";
import jsPDF from "jspdf";
import MainLogo from '@/assets/auth_logo.png'
import Logo01 from '@/assets/logos-01.png'
import Logo02 from '@/assets/logos-02.png'
import Logo03 from '@/assets/logos-03.png'
import Logo04 from '@/assets/logos-04.png'
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

const schema = z.object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    client: z.string().min(1, "Client is required"),
    project: z.string().min(1, "Project is required"),
    dueDate: z.string().min(1, "Due Date is required"),
    amount: z.string(),
    notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const InvoiceForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    const router = useRouter()
    const footerLogos = [
        Logo01.src,
        Logo02.src,
        Logo03.src,
        Logo04.src,

    ]
    const [submiting,setSubmiting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [client, setClients] = useState<Client[]>([])
    const [remainting, setRemaining] = useState(0)
    const [total, setTotal] = useState(0)
    const [remaintingAmount, setRemainingAmount] = useState(0)
    const [projects, setProjects] = useState<{
        id: string,
        name: string,
        projectId: number,
        totalAmount: number,
        remainingAmount: number
    }[]>([])
    const wathClient = watch('client')
    const watchProject = watch('project')
    const amount = watch("amount")
    const onSubmit: SubmitHandler<FormData> = async data => {
        console.log(data);
        setSubmiting(true)
        const res = await fetch(`/api/invoices`, {
            method: "POST",
            body: JSON.stringify({ ...data })
        });
        if (res.ok) {
            let _d = await res.json();
            if (_d.status) {
                console.log(_d, "data")
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "invoices Created Successfully",
                    timer: 3000
                });
                generatePDF(data)
                router.replace('/dashboard/invoices');
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    timer: 3000
                });
            }
        } else {
            let d = await res.json();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: d.error,
                timer: 3000
            });
        }
        setSubmiting(false)
    };
    React.useEffect(() => {
        getCreateDetail()
    }, [])
    React.useEffect(() => {
        if (amount !== "") {
            // setRemaining()
            let f = projects.find(f => f.id === watchProject)
            if (f) {
                setRemaining(f.remainingAmount - Number(amount))
            }
        }else{
            setRemaining(remaintingAmount)
        }
    }, [amount])
    React.useEffect(() => {
        if (wathClient) {
            console.log(wathClient, "admin@.12345")
            if (wathClient !== "") {
                let _c = client.find(f => f.id === wathClient)
                if (_c) {
                    let _p = _c.project.map(p => ({
                        id: p.id,
                        name: p.name,
                        projectId: p.projectId,
                        totalAmount: p.totalAmount,
                        remainingAmount: p.remainingAmount
                    }))
                    setProjects(_p)
                }
            }
        }
    }, [wathClient])
    React.useEffect(() => {
        if (watchProject) {
            console.log(wathClient, "admin@.12345")
            if (watchProject !== "") {
                let _c = projects.find(f => f.id === watchProject)
                if (_c) {
                    setTotal(_c.totalAmount)
                    setRemaining(_c.remainingAmount)
                    setRemainingAmount(_c.remainingAmount)

                }
            }
        }
    }, [watchProject])

    const getCreateDetail = async () => {
        const res = await fetch('/api/invoices/createDetail')
        if (res.ok) {
            let _d = await res.json();
            console.log(_d, "data")
            setValue("invoiceId", String(Number(_d.invoiceID) + 1).padStart(6, '0'))
            setClients(_d.clients)

        }
        setLoading(false)
    }

    const generatePDF = async (data: FormData) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const headerHeight = 50;
        const footerHeight = 50;
        const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;
        const _c = client.find(f => f.id === wathClient)
        const _p = projects.find(f => f.id === watchProject)
        if (!_c && _p) return null
        const header = () => {
            if (!_c && _p) return null
            doc.addImage(MainLogo.src, 'PNG', margin, margin, 100, 20);
            doc.setFontSize(18);
            doc.setFillColor('blue');
            doc.text('INVOICE', pageWidth / 2, margin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setFillColor('black');

            doc.text(_c?.name || "", margin, margin + 40);
            doc.text(_c?.phone || "", margin, margin + 48);
            doc.text(_c?.email || "", margin, margin + 56);
            doc.text(_c?.location || "", margin, margin + 64);

            doc.text(`Invoice no: ${String(data.invoiceId).padStart(6, "0")}`, pageWidth - margin - 60, margin + 30);
            doc.text(`Invoice Date:${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 35);
            doc.text(`Invoice Due Date:${new Date(data.dueDate).toLocaleDateString()}`, pageWidth - margin - 60, margin + 40);
        };

        const footer = (page: any) => {
            const footerY = pageHeight - footerHeight - margin;
            doc.setFontSize(10);
            doc.text(`www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Bunting Bridge, Newbury Park, Essex, IG2 7LR`, pageWidth / 2, footerY + 35, { align: 'center' });

            doc.setFontSize(8);
            doc.text('Thank you for your business with us!', pageWidth / 2, footerY + 45, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Page ${page}`, pageWidth / 2, footerY + 55, { align: 'center' });

            // Add footer logos with margin and different sizes on the right side
            const logosY = footerY + 10;
            const logoMargin = 5;
            const logoWidth = 20;  // Width of square logos
            const rectLogoWidth = 30; // Width of rectangular logos
            const logoHeight = 20; // Height of logos

            // Calculate the starting x position based on the number of logos and their sizes
            const logosX = (pageWidth / 2) - (((footerLogos.length - 2) * (logoWidth + logoMargin)) / 2) - ((2 * (rectLogoWidth + logoMargin)) / 2);

            footerLogos.forEach((logo: any, index: any) => {
                const xPosition = index === 1 || index === 3
                    ? logosX + index * (rectLogoWidth + logoMargin)
                    : logosX + index * (logoWidth + logoMargin + 10);

                const width = index === 1 || index === 3 ? rectLogoWidth : logoWidth;
                doc.addImage(logo, 'PNG', xPosition, logosY, width, logoHeight);
            });
        };

        const addTableContent = () => {
            const startY = margin + headerHeight + 20;
            let currentY = startY;
            let page = 1;
            let rowIndex = 0;

            const tableHeader = () => {
                doc.setFontSize(12);
                doc.text("", margin, margin + 64)
                doc.text('NO', margin, currentY);
                doc.text('DESCRIPTION', margin + 20, currentY);
                doc.text('PRICE', pageWidth - margin - 40, currentY);
                currentY += 10;
            };

            const tableRow = (row: any) => {
                doc.text(`${row.no}`, margin, currentY);
                doc.text(`${row.description}`, margin + 20, currentY);
                doc.text(`${row.price}`, pageWidth - margin - 40, currentY);
                currentY += 10;
            };

            tableHeader();
            tableRow({
                no: 1,
                description: `Project ID - ${String(_p?.projectId).padStart(6, '0')}, ${_p?.name}`,
                price: `$ ${Number(data.amount).toLocaleString()}`
            })
            footer(page);
        };

        const addProjectDetailsAndPaymentMethod = () => {
            const startY = margin + headerHeight + 150;
            doc.setFontSize(12);
            doc.text(`Total Amount : $ ${total.toLocaleString()}`, pageWidth - margin - 60, startY + 20);
        };

        let page = 1;
        header();
        addTableContent();
        addProjectDetailsAndPaymentMethod();
        doc.save(`Inovice ${data.invoiceId}.pdf`);
    };
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>)
    }
    console.log(total, remainting, remaintingAmount, "demo")
    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Generate New Invoice</Typography>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="invoiceId"
                                label="Invoice ID"
                                disabled
                                {...register('invoiceId')}
                                error={!!errors.invoiceId}
                                helperText={errors.invoiceId ? errors.invoiceId.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Client</InputLabel>
                                <Select
                                    label="Select Client"
                                    id="client"
                                    {...register('client')}
                                    error={!!errors.client}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {client.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                </Select>
                                {errors.client && <Typography variant="body2" color="error">{errors.client.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Project</InputLabel>
                                <Select
                                    label="Select Project"
                                    id="project"
                                    disabled={projects.length === 0}
                                    {...register('project')}
                                    error={!!errors.project}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {projects.map(p => <MenuItem key={p.id} value={p.id}>{String(p.projectId).padStart(6, "0") + " _ " + p.name}</MenuItem>)}
                                </Select>
                                {errors.project && <Typography variant="body2" color="error">{errors.project.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                type="date"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="dueDate"
                                label="Select Due Date"
                                InputProps={{
                                    inputProps: {
                                        min: new Date().toISOString().split('T')[0], // Disable past dates
                                    }
                                }}
                                {...register('dueDate')}
                                error={!!errors.dueDate}
                                helperText={errors.dueDate ? errors.dueDate.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                type="number"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                disabled
                                label="Total Amount"

                                value={projects.find(f => f.id === watchProject)?.totalAmount || 0}

                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                type="number"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="amount"
                                label="Enter Amount"
                                {...register('amount',{
                                    required: 'Amount is required',
                                    min: {
                                        value: 1,
                                        message: 'Amount must be at least 1',
                                    },
                                    max: {
                                        value: remaintingAmount,
                                        message: `Amount must not exceed ${remaintingAmount}`,
                                    }
                                })}
                                error={!!errors.amount}
                                InputProps={{
                                    inputProps: {
                                        min: 1, // Disable past dates
                                        max:remaintingAmount
                                    }
                                }}
                                helperText={errors.amount ? errors.amount.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                type="number"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                disabled
                                label="Remaining Amount"
                                value={remainting}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="notes"
                                label="Notes"
                                {...register('notes')}
                                error={!!errors.notes}
                                helperText={errors.notes ? errors.notes.message : ''}
                                multiline
                                rows={5}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={submiting}
                            >
                                 {
                            submiting ? <CircularProgress /> : "Submit"
                        }
                                
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default InvoiceForm;
