'use client'
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, Select, FormControl, InputLabel, MenuItem, FormHelperText, Alert, CircularProgress, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const schema = z.object({
    name: z.string().min(3),
    address: z.string().min(3),
    phone: z.string().max(11),
    email: z.string().email(),
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
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submiting,setSubmiting] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue, control,getValues } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug);
        } else {
            router.back();
        }
    }, [params]);

    const getSupplier = async (slug: any) => {
        setLoading(true);
        
        const res = await fetch(`/api/subcontractors/${slug}`);
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data = _d.data;
                console.log(_data, "data from api");
                setValue('address', _data.address);
                setValue('applicantType', _data.applicantType);
                setValue('approxTeamSize', _data.approxTeamSize);
                setValue('areasOfWork', _data.areasOfWork);
                setValue('dailyRate', _data.dailyRate);
                setValue('dateOfBirth', _data.dateOfBirth);  // Assuming the API returns ISO-8601 date
                setValue('email', _data.email);
                setValue('experiencePartitions', _data.experiencePartitions);
                setValue('experienceType', _data.experienceType);
                setValue('licence', _data.licence);
                setValue('name', _data.name);
                setValue('notes', _data.notes);
                setValue('taxStatus', _data.taxStatus);
                setValue('phone', _data.phone);
                setValue('tools', _data.tools);
                setValue('transport', _data.transport);
            } else {
                router.back();
            }
        } else {
            router.back();
        }
        setLoading(false);
    };

    const onSubmit: SubmitHandler<FormData> = async data => {
        console.log(data, "data");
        setSubmiting(true)
        const res = await fetch(`/api/subcontractors/${params.slug}`, {
            method: "PUT",
            body: JSON.stringify({ ...data })
        });
        if (res.ok) {
            let _d = await res.json();
            if (_d.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Sub-Contractor Updated Successfully",
                    timer: 3000
                });
                router.replace('/dashboard/subcontractors');
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

    const toolsOptions = ["110v Everything", "110v Saws", "110v Drills", "110v Routers", "240v Only", "NONE", "Other"];
    const transportOptions = ["Small Van (Escort Type)", "Midi Van", "Large Van", "NONE", "Other"];
    const licenceOptions = ["Clean Current", "Provisional", "NONE", "Other"];
    const experienceTypeOptions = ["Site Foreman", "Carpentry/Joinery", "Ceiling Fixing", "Decor - Tiling", "Partitioning", "Decor - Painting", "Decor - Wallcovering", "Other"];
    const experiencePartitionsOptions = ["Komfort Systems", "Metal Stud Partitions", "Timber Stud Partitions", "Dry-Lining", "Other"];

    const renderCheckboxGroup = (
        label: string,
        options: string[],
        name: keyof FormData // Explicitly typing the 'name' parameter
      ) => (
        <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 1, marginBottom: 2 }}>
          <Typography variant='h6'>{label}</Typography>
          <FormGroup row>
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={Array.isArray(field.value) && field.value.includes(option)} // Ensure field.value is an array
                        onChange={() => {
                          if (Array.isArray(field.value)) {
                            const newValue = field.value.includes(option)
                              ? field.value.filter((v: string) => v !== option)
                              : [...field.value, option];
                            field.onChange(newValue);
                          } else {
                            field.onChange([option]); // Initialize with the first option if not an array
                          }
                        }}
                        value={option}
                      />
                    )}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </Box>
      );
      
      
      console.log(getValues(),"values" ,new Date(getValues()?.dateOfBirth))
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>
        );
    }

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
                                // value={new Date(getValues().dateOfBirth)}
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
                                value={getValues().applicantType}
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
                        <Grid item xs={12} sm={6} md={4} />

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Tool & Equipment", toolsOptions, 'tools')}
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Transport", transportOptions, 'transport')}
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Licence", licenceOptions, 'licence')}
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Experience Type", experienceTypeOptions, 'experienceType')}
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            {renderCheckboxGroup("Experience Partitions", experiencePartitionsOptions, 'experiencePartitions')}
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

export default Suppliers
