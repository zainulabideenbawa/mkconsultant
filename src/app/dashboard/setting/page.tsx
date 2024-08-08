'use client'
import { Button, Grid, Typography, Paper, TextField, Link, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2'
// Schema for user details
const userDetailsSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    designation: z.string().min(1, "Designation is required")
});

// Schema for password change
const passwordChangeSchema = z.object({
    currentPassword: z.string().min(6, "Current Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New Password must be at least 6 characters long")
})

type UserDetailsFormData = z.infer<typeof userDetailsSchema>;
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

const SettingsForm = () => {
    const {
        register: registerUserDetails,
        handleSubmit: handleSubmitUserDetails,
        formState: { errors: errorsUserDetails },
        setValue,
        getValues
    } = useForm<UserDetailsFormData>({
        resolver: zodResolver(userDetailsSchema)
    });
    const session = useSession()
    const router = useRouter()
    const [loading,setLoading] = useState(true)
    console.log(session,"session")
    useEffect(()=>{
        if(session.status==="authenticated" && session.data.user){
            getSupplier(session.data.user.email)
        }
    },[session.status])
    const getSupplier = async (slug: any) => {
        setLoading(true);
        const res = await fetch(`/api/setting/${slug}`);
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data = _d.data;
                console.log(_data, "data from api");
                setValue('firstName', _data.firstName);
                setValue('lastName', _data.lastName);
                setValue('email', _data.email);
                setValue('designation', _data.designation);
            } else {
                router.back();
            }
        } else {
            router.back();
        }
        setLoading(false);
    };

    const {
        register: registerPasswordChange,
        handleSubmit: handleSubmitPasswordChange,
        formState: { errors: errorsPasswordChange }
    } = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema)
    });

    const onSubmitUserDetails: SubmitHandler<UserDetailsFormData> =async data => {
        console.log(data);
        const res = await fetch('/api/setting',{
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
                text:"Sub-Contractor Added Successfully",
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
    };

    const onSubmitPasswordChange: SubmitHandler<PasswordChangeFormData> =async data => {
        console.log(data);
        const res = await fetch('/api/setting',{
            method:"PUT",
            body:JSON.stringify({...data,email:session.data?.user?.email})
        })
        if(res.ok){
            // console.log(await res.json())
            let _d =await res.json()
            if(_d.status){
               Swal.fire({
                icon:"success",
                title:"Success",
                text:"Sub-Contractor Added Successfully",
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
    };
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>
        );
    }

    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Settings</Typography>
            
            <Paper sx={{ padding: 4, marginBottom: 4 }}>
                <form onSubmit={handleSubmitUserDetails(onSubmitUserDetails)}>
                    <Typography variant='h6' sx={{ marginBottom: 2 }}>User Details</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                {...registerUserDetails('firstName')}
                                error={!!errorsUserDetails.firstName}
                                helperText={errorsUserDetails.firstName ? errorsUserDetails.firstName.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                {...registerUserDetails('lastName')}
                                error={!!errorsUserDetails.lastName}
                                helperText={errorsUserDetails.lastName ? errorsUserDetails.lastName.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                disabled
                                id="email"
                                label="Email"
                                {...registerUserDetails('email')}
                                error={!!errorsUserDetails.email}
                                helperText={errorsUserDetails.email ? errorsUserDetails.email.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>

                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Designation</InputLabel>
                                <Select
                                    label="Select Designation"
                                    id="designation"
                                    value={getValues().designation}
                                    {...registerUserDetails('designation')}
                                    error={!!errorsUserDetails.designation}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Developer">Developer</MenuItem>
                                    <MenuItem value="Designer">Designer</MenuItem>
                                    <MenuItem value="QA">QA</MenuItem>
                                </Select>
                                {errorsUserDetails.designation && <Typography variant="body2" color="error">{errorsUserDetails.designation.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                            >
                                Save User Details
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmitPasswordChange(onSubmitPasswordChange)}>
                    <Typography variant='h6' sx={{ marginBottom: 2 }}>Change Password</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="currentPassword"
                                label="Enter Current Password"
                                {...registerPasswordChange('currentPassword')}
                                error={!!errorsPasswordChange.currentPassword}
                                helperText={errorsPasswordChange ? errorsPasswordChange.currentPassword?.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="newPassword"
                                label="Enter New Password"
                                {...registerPasswordChange('newPassword')}
                                error={!!errorsPasswordChange.newPassword}
                                helperText={errorsPasswordChange ? errorsPasswordChange.newPassword?.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                            >
                                Save Password
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default SettingsForm;
