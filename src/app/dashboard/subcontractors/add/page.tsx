'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, Select, FormControl, InputLabel, MenuItem, Checkbox, FormControlLabel, FormGroup, CircularProgress } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2'
import { useState } from "react";
const schema = z.object({
    name: z.string().min(3),
    address: z.string().min(3),
    phone: z.string().max(11),
    email:z.string().email(),
    dateOfBirth: z.string().min(3),
    applicantType: z.string().min(1),
    approxTeamSize: z.string(),
    dailyRate: z.string(),
    areasOfWork: z.string(),
    taxStatus: z.string().min(1),
    tools: z.array(z.string()).optional(),
    transport: z.array(z.string()).optional(),
    licence: z.array(z.string()).optional(),
    experienceType: z.array(z.string()).optional(),
    experiencePartitions: z.array(z.string()).optional(),
    notes: z.string().optional()
});



type FormData = z.infer<typeof schema>;

const Suppliers = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });
    const [submiting,setSubmiting] = useState(false)
    const onSubmit: SubmitHandler<FormData> = async data => {
        console.log(data,"data")
        setSubmiting(true)
        const res = await fetch('/api/subcontractors',{
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
        setSubmiting(false)
    };

    const toolsOptions = ["110v Everything", "110v Saws", "110v Drills", "110v Routers", "240v Only", "NONE", "Other"];
    const transportOptions = ["Small Van (Escort Type)", "Midi Van", "Large Van", "NONE", "Other"];
    const licenceOptions = ["Clean Current", "Provisional", "NONE", "Other"];
    const experienceTypeOptions = ["Site Foreman", "Carpentry/Joinery", "Ceiling Fixing", "Decor - Tiling", "Partitioning", "Decor - Painting", "Decor - Wallcovering", "Other"];
    const experiencePartitionsOptions = ["Komfort Systems", "Metal Stud Partitions", "Timber Stud Partitions", "Dry-Lining", "Other"];

    const renderCheckboxGroup = (label: string, options: string[], register: any, name: string) => (
        <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 1, marginBottom: 2 }}>
            <Typography variant='h6'>{label}</Typography>
            <FormGroup row>
                {options.map((option, index) => (
                    <FormControlLabel
                        sx={{width:"100%"}}
                        key={index}
                        control={<Checkbox {...register(name)} value={option} />}
                        label={option}
                    />
                ))}
            </FormGroup>
        </Box>
    );

    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Add New Sub-Contractors</Typography>
            <Paper sx={{ padding: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2, color: "rgba(0, 0, 0, 0.6)" }}>Sub-Contractor’s Details</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                label="Enter Contact Number"
                                {...register('phone')}
                                error={!!errors.phone}
                                helperText={errors.phone ? errors.phone.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                type="date"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="dateOfBirth"
                                label="Date of Birth"
                                {...register('dateOfBirth')}
                                error={!!errors.dateOfBirth}
                                helperText={errors.dateOfBirth ? errors.dateOfBirth.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                select
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="applicantType"
                                label="Applicant Type"
                                {...register('applicantType')}
                                error={!!errors.applicantType}
                                helperText={errors.applicantType ? errors.applicantType.message : ''}
                            >
                                <MenuItem value="">None</MenuItem>
                                {["Type1", "Type2", "Type3"].map((v, i) => <MenuItem value={v} key={i}>{v}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="approxTeamSize"
                                label="Approx Team Size"
                                {...register('approxTeamSize')}
                                error={!!errors.approxTeamSize}
                                helperText={errors.approxTeamSize ? errors.approxTeamSize.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="dailyRate"
                                label="Daily Rate"
                                {...register('dailyRate')}
                                error={!!errors.dailyRate}
                                helperText={errors.dailyRate ? errors.dailyRate.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="areasOfWork"
                                label="Areas Of Work"
                                {...register('areasOfWork')}
                                error={!!errors.areasOfWork}
                                helperText={errors.areasOfWork ? errors.areasOfWork.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="taxStatus"
                                label="Tax Status"
                                {...register('taxStatus')}
                                error={!!errors.taxStatus}
                                helperText={errors.taxStatus ? errors.taxStatus.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}/>

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Tool & Equipment", toolsOptions, register, 'tools')}
                        </Grid>

                        <Grid item  xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Transport", transportOptions, register, 'transport')}
                        </Grid>

                        <Grid item  xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Licence", licenceOptions, register, 'licence')}
                        </Grid>

                        <Grid item  xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Experience Type", experienceTypeOptions, register, 'experienceType')}
                        </Grid>

                        <Grid item  xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Experience Partitions", experiencePartitionsOptions, register, 'experiencePartitions')}
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
                                  {submiting ? <CircularProgress /> : "Submit"}

                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default Suppliers;
