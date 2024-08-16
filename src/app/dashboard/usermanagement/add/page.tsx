'use client'
import { Button, Grid, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2'
import { useState } from "react";
const schema = z.object({
    firstName: z.string().min(1, "User Name is required"),
    lastName: z.string().min(1, "User Name is required"),
    email: z.string().email("Invalid email address"),
    designation: z.string().min(1, "Designation is required"),
    role: z.string().min(1, "Designation is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters long")
}).refine(data => data.password === data.confirmPassword, {
    message: "password and confirm password must be same",
    path: ["password", "confirmPassword"]
})


type FormData = z.infer<typeof schema>;

const AddUserForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    const router = useRouter()
    const [submiting,setSubmiting] = useState(false)
    const onSubmit: SubmitHandler<FormData> = async data => {
        setSubmiting(true)
        console.log(data,"data")
        const res = await fetch('/api/usermanagement',{
            method:"POST",
            body:JSON.stringify({...data})
        })
        if(res.ok){
            // console.log(await res.json())
            let _d =await res.json()
            if(_d.status){
               Swal.fire({
                icon:"success",
                title:"Success",
                text:"User Added Successfully",
                timer:3000
               });
               router.back()
            }else{
                Swal.fire({
                    icon:"error",
                    title:"Error",
                    // text:"Supplier Added Successfully",
                    timer:3000
                   });
            }
        }else{
            // console.log(await res.json())
            let d = await res.json()
            Swal.fire({
                icon:"error",
                title:"Error",
                text:d.error,
                timer:3000
               });
        }
        setSubmiting(false)
    };

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
                                label="Enter First Name"
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
                                label="Enter Last Name"
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
                                    label="Select Designation"
                                    id="designation"
                                    {...register('designation')}
                                    error={!!errors.designation}
                                >
                                    <MenuItem value="">None</MenuItem>
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
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={submiting}
                                >
                                    {submiting ? <CircularProgress /> : "Create User"}
                                
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default AddUserForm;
