'use client'
import { Button, Grid, Typography, Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from "next/navigation";
import Swal from 'sweetalert2'
import { useState } from "react";

const schema = z.object({
    // clientId: z.string().min(1, "Client ID is required"),
    name: z.string().min(1, "Name is Required"),
    email: z.string().email(),
    location: z.string().min(1, "Address is Required"),
    phone: z.string().min(1, "Phone is Required").max(11),
});

type FormData = z.infer<typeof schema>;

const InvoiceForm = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    const [submiting, setSubmiting] = useState(false)
    const onSubmit: SubmitHandler<FormData> = async data => {
        console.log(data, "data")
        setSubmiting(true)
        const res = await fetch('/api/client', {
            method: "POST",
            body: JSON.stringify({ ...data })
        })
        if (res.ok) {
            // console.log(await res.json())
            let _d = await res.json()
            if (_d.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Client Added Successfully",
                    timer: 3000
                });
                router.back()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    // text:"Supplier Added Successfully",
                    timer: 3000
                });
            }
        } else {
            // console.log(await res.json())
            let d = await res.json()
            Swal.fire({
                icon: "error",
                title: "Error",
                text: d.error,
                timer: 3000
            });
        }
        setSubmiting(false)
    };

    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Add New Client</Typography>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Client Name"
                                {...register('name')}
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Client Email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="location"
                                label="Client Address"
                                {...register('location')}
                                error={!!errors.location}
                                helperText={errors.location ? errors.location.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                type='tel'
                                required
                                fullWidth
                                id="phone"
                                label="Client Phone"
                                {...register('phone')}

                                error={!!errors.phone}
                                helperText={errors.phone ? errors.phone.message : ''}
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
                                {submiting ? <CircularProgress /> : "Submit"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default InvoiceForm;
