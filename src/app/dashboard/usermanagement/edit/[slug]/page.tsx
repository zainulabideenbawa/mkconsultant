'use client'
import { Button, Grid, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel,CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from "next/navigation";
import { optional, z } from 'zod';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2'
const schema = z.object({
    firstName: z.string().min(1, "User Name is required"),
    lastName: z.string().min(1, "User Name is required"),
    email: z.string().email("Invalid email address"),
    designation: z.string().optional(),
    role: z.string().min(1, "Designation is required"),
    // password: z.string().min(6, "Password must be at least 6 characters long"),
    // confirmPassword: z.string().min(6, "Password must be at least 6 characters long")
})

type FormData = z.infer<typeof schema>;

const AddUserForm = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        getValues
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submiting,setSubmiting] = useState(false)
    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug)
        } else {
            router.back()
        }
    }, [params])
    const getSupplier = async (slug: any) => {
        setLoading(true);
        const res = await fetch(`/api/usermanagement/${slug}`);
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data = _d.data;
                console.log(_data, "data from api");
                setValue('firstName', _data.firstName);
                setValue('lastName', _data.lastName);
                setValue('email', _data.email);
                setValue('designation', _data.designation); // Convert markup to number
                setValue('role', _data.role);
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
        const res = await fetch(`/api/usermanagement/${params.slug}`, {
            method: "PUT",
            body: JSON.stringify({ ...data,designation:data.designation||"" })
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
                router.replace('/dashboard/usermanagement')
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
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Add New User</Typography>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="firstName"
                                label="Enter User Name"
                                {...register('firstName')}
                                error={!!errors.firstName}
                                helperText={errors.firstName ? errors.firstName.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="lastName"
                                label="Enter User Name"
                                {...register('lastName')}
                                error={!!errors.lastName}
                                helperText={errors.lastName ? errors.lastName.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Designation</InputLabel>
                                <Select
                                value={getValues().designation}
                                    label="Select Designation"
                                    id="designation"
                                    {...register('designation')}
                                    error={!!errors.designation}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Developer">Developer</MenuItem>
                                    <MenuItem value="Designer">Designer</MenuItem>
                                    <MenuItem value="QA">QA</MenuItem>
                                </Select>
                                {errors.designation && <Typography variant="body2" color="error">{errors.designation.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select User Type</InputLabel>
                                <Select
                                    label="Select User Type"
                                    id="userType"
                                    value={getValues().role}
                                    {...register('role')}
                                    error={!!errors.role}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="USER">User</MenuItem>
                                </Select>
                                {errors.role && <Typography variant="body2" color="error">{errors.role.message}</Typography>}
                            </FormControl>
                        </Grid>
                        {/* <Grid item xs={12} sm={6}>
                            <TextField
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="Set Password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="confirmPassword"
                                label="Confirm Password"
                                {...register('confirmPassword')}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                            />
                        </Grid> */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={submiting}
                                >
                                    {submiting ? <CircularProgress /> : "Update User"}
                                
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default AddUserForm;
