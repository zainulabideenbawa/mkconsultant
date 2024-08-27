'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, Select, FormControl, InputLabel, MenuItem, FormHelperText, Alert, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2'
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const schema = z.object({
    name: z.string().min(3),
    address: z.string().min(3),
    phone: z.string().regex(/^\d+$/, "Phone number must contain only digits").length(11, "Phone number must be exactly 11 digits"),
    email: z.string().email(),
    supplierType: z.string(),
    markup: z.number().max(100).min(0),
    notes: z.string().optional()
});
type FormData = z.infer<typeof schema>;
const Suppliers = () => {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [submiting,setSubmiting] = useState(false)
    const [select,setSelect] = useState("")
    console.log(params, "params")
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue

    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug)
        } else {
            router.back()
        }
    }, [params])
    const getSupplier = async (slug: any) => {
        setLoading(true);
        const res = await fetch(`/api/suppiler/${slug}`);
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data = _d.data;
                console.log(_data, "data from api");
                setValue('name', _data.name);
                setValue('email', _data.email);
                setValue('markup', Number(_data.markup)); // Convert markup to number
                setValue('address', _data.address);
                setValue('notes', _data.notes);
                setValue('phone', _data.phone);
                setValue('supplierType', _data.supplierType);
                setSelect(_data.supplierType)
            } else {
                router.back();
            }
        } else {
            router.back();
        }
        setLoading(false);
    };

    const onSubmit: SubmitHandler<FormData> = async data => {
        setSubmiting(true)
        console.log(data, "data")
        const res = await fetch(`/api/suppiler/${params.slug}`, {
            method: "PUT",
            body: JSON.stringify({ ...data })
        })
        if (res.ok) {
            // console.log(await res.json())
            let _d = await res.json()
            if (_d.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Supplier Updated Successfully",
                    timer: 3000
                });
                router.replace('/dashboard/suppliers')
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
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>)
    }

    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Add New Suppliers</Typography>
            <Paper sx={{ padding: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2, color: "rgba(0, 0, 0, 0.6)" }}>Supplier’s Details</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid xs={12} sm={4} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Enter Name/Company Name"
                                {...register('name')}
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ''}
                                autoFocus
                            />
                        </Grid>
                        <Grid xs={12} sm={4} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="address"
                                label="Enter Address"
                                {...register('address')}
                                error={!!errors.address}
                                helperText={errors.address ? errors.address.message : ''}
                                autoFocus
                            />
                        </Grid>
                        <Grid xs={12} sm={4} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Enter Email Address"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                                autoFocus
                            />
                        </Grid>
                        <Grid xs={12} sm={6} md={4} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                type='tel'
                                label="Enter Contact Number"
                                {...register('phone')}
                                error={!!errors.phone}
                                helperText={errors.phone ? errors.phone.message : ''}
                                autoFocus
                                inputProps={{ pattern: '[0-9]*', maxLength: 11 }}
                            />
                        </Grid>
                        <Grid xs={12} sm={6} md={4} >

                            <TextField
                                select
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="supplierType"
                                label="Supplier Type"
                                // {...register('supplierType')}
                                value={select}
                                onChange={(e)=>{setSelect(e.target.value);setValue("supplierType",e.target.value)}}
                                error={!!errors.supplierType}
                                helperText={errors.supplierType ? errors.supplierType.message : ''}
                                autoFocus
                            >
                                <MenuItem value="">None</MenuItem>
                                {["Concrete Supplier", "Steel Supplier", "Wood Supplier", "Glass Supplier", "Heavy Machinery Supplier"].map((v, i) => (
                                    <MenuItem value={v} key={i}>{v}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid xs={12} sm={6} md={4} >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="markup"
                                type="number"
                                label="Markup Percentage"
                                {...register('markup', { valueAsNumber: true })}
                                error={!!errors.markup}
                                helperText={errors.markup ? errors.markup.message : ''}
                                inputProps={{ min: 0, max: 100, step: 1 }}
                                autoFocus
                            />
                        </Grid>
                        <Grid xs={12}  >
                            <TextField
                                variant="outlined"
                                margin="normal"
                                // required
                                fullWidth
                                id="notes"
                                label="Notes"
                                {...register('notes')}
                                error={!!errors.notes}
                                helperText={errors.notes ? errors.notes.message : ''}
                                autoFocus
                                multiline
                                rows={5}
                            />
                        </Grid>
                        <Grid xs={12}>
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

export default Suppliers