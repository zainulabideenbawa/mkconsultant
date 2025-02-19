'use client'
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Container, Grid, Box, Typography, Paper, Icon, Menu, MenuItem, Autocomplete, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { z } from 'zod';
import Delete from '@mui/icons-material/Delete'

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { ArrowLeftSharp } from '@mui/icons-material';




const subTaskSchema = z.object({
    subTaskId: z.string().nonempty('Sub Task ID is required'),
    subTaskName: z.string().nonempty('Sub Task Name is required'),
    description: z.string().optional(),
    assignTo: z.string().nonempty('Assign To is required'),
    startDate: z.string().nonempty('Start Date is required'),
    endDate: z.string().nonempty('End Date is required'),
    addCost: z.string().optional(),
    vat: z.string().optional(),
});
const projectSchema = z.object({
    projectId: z.string().nonempty('Project ID is required'),
    projectName: z.string().nonempty('Project Name is required'),
    projectLocation: z.string().nonempty('Project Location is required'),
    startDate: z.string().nonempty('Start Date is required'),
    endDate: z.string().nonempty('End Date is required'),
    projectManager: z.string().nonempty('Project Manager is required'),
    clientId: z.string().optional(),
    clientName: z.string().nonempty('Client Name is required'),
    contactPerson: z.string().nonempty('Contact Person is required'),
    phone: z.string().nonempty('Phone Number is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().nonempty('Phone Number is required'),
    clientAddress: z.string().nonempty('Client Address is required'),
    subTasks: z.array(subTaskSchema).optional(),
    notes: z.string().optional(),
});



type Material = {
    material: string;
    requiredFor: string;
    supplier: string;
    quantity: number;
    unit: string;
    price: string;
    vat: string;
    totalCost: string;
};
type Project = z.infer<typeof projectSchema>;

type FormValues = Omit<Material, 'totalCost'>;
const ProjectForm = () => {
    const router = useRouter()
    const [users, setUsers] = useState<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        password: string;
        designation: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>()
    const [client, setClient] = useState<{
        id: string;
        clientId: number;
        name: string;
        email: string;
        phone: string;
        location: string;
    }[]>()
    const [subContractor, setSubContrator] = useState<{
        id: string,
        name: string,
        email: string,
        address: string,
        phone: string,
        dateOfBirth: Date,
        applicantType: string,
        approxTeamSize: string,
        dailyRate: string,
        areasOfWork: string,
        taxStatus: string,
        tools: string[],
        transport: string[],
        licence: string[],
        experienceType: string[],
        experiencePartitions: string[],
        notes: string|null,
    }[]>()
    const [Suppliers, setSuppliers] = useState<{
        id: string;
        name: string;
        address: string;
        phone: string;
        supplierType: string;
        markup: string;
        email: string;
        notes: string | null;
    }[]>()
    const [disableCleint, setDisableClient] = useState(true)
    const [loading, setLoading] = useState(true)
    const [submiting, setSubmiting] = useState(false)
    const { register: registerMaterial,
        handleSubmit: handleSubmitMaterial,
        control: controlMaterial,
        setValue: setMaterialValue,
        formState: { errors: errorsMaterial }, reset } = useForm<FormValues>();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [showMaterial, setShowMaterial] = useState(false)
    const { control, handleSubmit, setValue, watch, register, formState: { errors }, getValues } = useForm<Project>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            subTasks: [{ subTaskId: '', subTaskName: '', description: '', assignTo: '', startDate: '', endDate: '', addCost: '0', vat: '0' }],
        },
    });
    React.useLayoutEffect(() => {
        getCreateDetail()
    }, [])
    const email = watch('email')
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'subTasks',
    });
    React.useEffect(() => {
        console.log('value', getValues())
    }, [email])
    const getCreateDetail = async () => {
        const res = await fetch('/api/project/createDetail')
        if (res.ok) {
            let _d = await res.json();
            console.log(_d, "data")
            setValue("projectId", String(Number(_d.projectId) + 1).padStart(6, '0'))
            setValue(`subTasks.${0}.subTaskId`, `${String(Number(_d.projectId) + 1).padStart(6, '0')} - ${String(Number(getValues().subTasks?.length)).padStart(3, '0')}`)
            setUsers(_d.user)
            setClient(_d.clients.map((d: any) => ({ ...d, label: d.email })))
            setSubContrator(_d.subcontractors)
            setSuppliers(_d.supplier)
            setLoading(false)
        }
    }
    const startDate = watch('startDate')
    const endDate = watch('endDate')
    console.log(startDate, endDate, "dates")



    const onSubmit = (data: Project) => {

        console.log(data);
        // setSubmiting(false)
        setShowMaterial(true)
    };

    const today = new Date().toISOString().split('T')[0];
    const onSubmitMaterial = (data: FormValues) => {
        console.log(data, "data", getValues())
        const totalCost = Number(data.quantity * Number(Number(data.price).toFixed(2)) * (1 + Number(Number(data.vat).toFixed(2)) / 100)).toFixed(2);
        setMaterials([...materials, { ...data, totalCost }]);
        reset();
        setMaterialValue('material', "")
        setMaterialValue('price', "0")
        setMaterialValue('quantity', 0)
        setMaterialValue('requiredFor', "")
        setMaterialValue('supplier', "")
        setMaterialValue('unit', "")
        setMaterialValue('vat', "0")
    };

    const calculateGrandTotal = () => {
        return materials.reduce((acc, material) => acc + Number(Number(material.totalCost).toFixed(2)), 0);
    };
    const goBack = ()=>{
        setShowMaterial(false)
    }
    console.log(Number(getValues().clientId), "Number(getValues().clientId)")
    const submitProject = async () => {
        setSubmiting(true)
        let data = {
            ...getValues(),
            materials: materials.map(m => ({
                ...m,
                quantity: Number(m.quantity),
                vat: String(m.vat),
                price: Number(m.price).toFixed(3),
                totalCost: Number(m.totalCost).toFixed(3)

            })),
            clientMainID: client?.find(f => f.clientId === Number(getValues().clientId))?.id || ""
        }
        const res = await fetch(`/api/project`, {
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
                    text: "Project Created Successfully",
                    timer: 3000
                });
                router.push(`/dashboard/projects/view/${_d.data.id}`);
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
    }
    console.log(client, "client")
    const handleDeleteMaterial = (index:number)=>{
        if (index > -1) {
            setMaterials(materials.filter((_, i) => i!== index));
        }
    }
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>)
    }
    return (
        !showMaterial ? 
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Add New Project</Typography>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2, color: "rgba(0, 0, 0, 0.6)" }}>Project Details</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} >
                            <TextField autoFocus disabled  {...register("projectId")} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label="Project's Name" {...register("projectName")} fullWidth error={!!errors.projectName}
                                helperText={errors.projectName?.message} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label="Project Location" {...register("projectLocation")} fullWidth error={!!errors.projectLocation}
                                helperText={errors.projectLocation?.message} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Start Date"
                                type="date"
                                {...register("startDate")}
                                InputProps={{
                                    inputProps: {
                                        min: today, // Disable past dates
                                    }
                                }}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.startDate}
                                helperText={errors.startDate?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="End Date"
                                type="date"
                                {...register("endDate", {
                                    required: "End date is required",
                                    validate: value =>
                                        value > startDate || "End date must be greater than start date"
                                })}
                                InputProps={{
                                    inputProps: {
                                        min: startDate || today, // Disable dates before the selected start date
                                    }
                                }}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errors.endDate}
                                helperText={errors.endDate?.message}
                            /></Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField select label="Project Manager" {...register("projectManager")} fullWidth error={!!errors.projectManager}
                                helperText={errors.projectManager?.message} >
                                {users?.map(d => <MenuItem key={d.id} value={d.id}>{`${d.firstName} ${d.lastName}`}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label="Contact Person" {...register('contactPerson')} fullWidth error={!!errors.contactPerson}
                                helperText={errors.contactPerson?.message} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label="Contact Person Phone" {...register("phone")} fullWidth error={!!errors.phone}
                                helperText={errors.phone?.message} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2, color: "rgba(0, 0, 0, 0.6)" }}>Client Details</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField disabled fullWidth {...register('clientId')} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={client ? client : []}
                                getOptionLabel={(option) => {
                                    return typeof option === 'object' && option !== null ? option.email : option;
                                }}
                                freeSolo  // Allow free text input  // Specify how to display the options
                                sx={{ width: "100%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )}
                                onChange={(event, value) => {
                                    if (typeof value === 'string') {
                                        // If the value is a string and doesn't match any client, enable the fields
                                        setDisableClient(false);
                                        setValue('email', value)
                                        setValue("clientName", "");
                                        setValue("phoneNumber", "");
                                        setValue("clientAddress", "");
                                        setValue('clientId', String(Number(client?.length) + 1).padStart(6, '0'))
                                    } else if (value) {
                                        // If an existing client is selected, disable the fields and set values
                                        setValue("clientName", value.name);
                                        setValue('email', value.email)
                                        setValue("phoneNumber", value.phone);
                                        setValue("clientAddress", value.location);
                                        setValue('clientId', String(Number(value.clientId)).padStart(6, '0'))
                                        setDisableClient(true);
                                    } else {
                                        // If no client is selected, enable the fields
                                        setDisableClient(false);
                                        setValue("clientName", "");
                                        setValue("phoneNumber", "");
                                        setValue("clientAddress", "");
                                        setValue('clientId', String(Number(client?.length) + 1).padStart(6, '0'))
                                    }
                                }}
                                onInputChange={(event, value) => {
                                    if (client && !client.some(c => c.email === value)) {
                                        // If the input value doesn't match any client email, enable the fields
                                        setDisableClient(false);
                                        setValue('email', value)
                                        setValue('clientId', String(Number(client?.length) + 1).padStart(6, '0'))
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label={!disableCleint ? "Client's Name" : ""} {...register("clientName")} disabled={disableCleint} fullWidth error={!!errors.clientName}
                                helperText={errors.clientName?.message} />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label={!disableCleint ? "Phone Number" : ""} {...register("phoneNumber")} disabled={disableCleint} fullWidth error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber?.message} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField label={!disableCleint ? "Client's Address" : ""}{...register("clientAddress")} disabled={disableCleint} fullWidth error={!!errors.clientAddress}
                                helperText={errors.clientAddress?.message} />
                        </Grid>

                        <Grid item xs={12}>
                            {fields.map((field, index) => (
                                <Box key={field.id} mb={2}>
                                    <Grid item xs={12}>
                                        <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2, color: "rgba(0, 0, 0, 0.6)" }}>
                                            {`Sub Task ${index + 1}`}
                                        </Typography>
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={2}>
                                            <TextField
                                                {...register(`subTasks.${index}.subTaskId`)}
                                                disabled
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <TextField
                                                label="Sub Task Name"
                                                {...register(`subTasks.${index}.subTaskName`, { required: "Sub Task Name is required" })}
                                                fullWidth
                                                error={!!errors.subTasks?.[index]?.subTaskName}
                                                helperText={errors.subTasks?.[index]?.subTaskName?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <TextField
                                                label="Description"
                                                {...register(`subTasks.${index}.description`)}
                                                fullWidth
                                                error={!!errors.subTasks?.[index]?.description}
                                                helperText={errors.subTasks?.[index]?.description?.message}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                select
                                                label="Assign To"
                                                {...register(`subTasks.${index}.assignTo`, { required: "Assign To is required" })}
                                                fullWidth
                                                error={!!errors.subTasks?.[index]?.assignTo}
                                                helperText={errors.subTasks?.[index]?.assignTo?.message}
                                            >
                                                {subContractor?.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                label="Start Date"
                                                type="date"
                                                {...register(`subTasks.${index}.startDate`, { required: "Start Date is required" })}
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                                error={!!errors.subTasks?.[index]?.startDate}
                                                helperText={errors.subTasks?.[index]?.startDate?.message}
                                                InputProps={{
                                                    inputProps: {
                                                        min: startDate || today, // Disable dates before the selected start date
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                label="End Date"
                                                type="date"
                                                {...register(`subTasks.${index}.endDate`, {
                                                    required: "End Date is required",
                                                    validate: (value) => {
                                                        const startDate = watch(`subTasks.${index}.startDate`);
                                                        return value > startDate || "End Date must be after Start Date";
                                                    }
                                                })}
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                                error={!!errors.subTasks?.[index]?.endDate}
                                                helperText={errors.subTasks?.[index]?.endDate?.message}
                                                InputProps={{
                                                    inputProps: {
                                                        min: startDate || today, // Disable dates before the selected start date
                                                        max: endDate
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Controller
                                                name={`subTasks.${index}.addCost`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        label="Add Cost"
                                                        // type="number"
                                                        {...field}
                                                        fullWidth
                                                        error={!!errors.subTasks?.[index]?.addCost}
                                                        helperText={errors.subTasks?.[index]?.addCost?.message}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Allow only numbers and a single decimal point
                                                            if (/^\d*\.?\d*$/.test(value)) {
                                                              field.onChange(value); // Keep value as a string
                                                            }
                                                          }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Controller
                                                name={`subTasks.${index}.vat`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        label="VAT"
                                                        // type="number"
                                                        {...field}
                                                        fullWidth
                                                        error={!!errors.subTasks?.[index]?.vat}
                                                        helperText={errors.subTasks?.[index]?.vat?.message}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Allow only numbers and a single decimal point
                                                            if (/^\d*\.?\d*$/.test(value)) {
                                                              field.onChange(value); // Keep value as a string
                                                            }
                                                          }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {fields.length > 1 && (
                                            <Grid item xs={12} sm={2}>
                                                <Button
                                                    variant="contained"
                                                    color='error'
                                                    onClick={() => remove(index)}
                                                >
                                                    <Delete />
                                                </Button>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            ))}
                            <Button
                                variant='outlined'
                                onClick={() => {
                                    append({ subTaskId: '', subTaskName: '', description: '', assignTo: '', startDate: '', endDate: '', addCost: "0", vat: "0" })
                                    setValue(`subTasks.${Number(getValues().subTasks?.length || 1) - 1 as unknown as number}.subTaskId`, `${String(Number(getValues().projectId)).padStart(6, '0')} - ${String(Number(getValues().subTasks?.length)).padStart(3, '0')}`)
                                }}
                            >
                                Add Sub Task
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" {...register("notes")} fullWidth multiline rows={4} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Proceed to Add Materials
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main> : <main>
            <div style={{display:"flex",flexDirection:"row",justifyContent:"space-between",marginBottom:20}}>
            <Typography variant='h4' sx={{ fontWeight: "bold"}}>Material / Cost</Typography>
            <Button onClick={goBack} variant='contained' color='primary' size='small'>
               <ArrowLeftSharp/> Go Back
            </Button>
            </div>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmitMaterial(onSubmitMaterial)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="material"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label="Material/ Cost" error={!!errorsMaterial.material}
                                        helperText={errorsMaterial.material?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="requiredFor"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label="Required For" error={!!errorsMaterial.requiredFor}
                                        helperText={errorsMaterial.requiredFor?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Controller
                                name="supplier"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Select Supplier" error={!!errorsMaterial.supplier}
                                        helperText={errorsMaterial.supplier?.message}>
                                        <MenuItem value=""></MenuItem>
                                        {Suppliers?.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Controller
                                name="quantity"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Qty"
                                        type="number"
                                        InputProps={{ inputProps: { min: 1 } }}
                                        error={!!errorsMaterial.quantity}
                                        helperText={errorsMaterial.quantity?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Controller
                                name="unit"

                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField select {...field} fullWidth label="Unit" error={!!errorsMaterial.unit}
                                        helperText={errorsMaterial.unit?.message}>
                                        <MenuItem value=""></MenuItem>
                                        <MenuItem value="bags">bags</MenuItem>
                                        <MenuItem value="ton">ton</MenuItem>
                                        <MenuItem value="pieces">pieces</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Controller
                                name="price"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Price"
                                        // type="number"
                                        // InputProps={{ inputProps: { min: 0 } }}
                                        error={!!errorsMaterial.price}
                                        helperText={errorsMaterial.price?.message}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only numbers and a single decimal point
                                            if (/^\d*\.?\d*$/.test(value)) {
                                              field.onChange(value); // Keep value as a string
                                            }
                                          }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Controller
                                name="vat"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="VAT%"
                                        // type="number"
                                        // InputProps={{ inputProps: { min: 0, max: 100 } }}
                                        error={!!errorsMaterial.vat}
                                        helperText={errorsMaterial.vat?.message}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only numbers and a single decimal point
                                            if (/^\d*\.?\d*$/.test(value)) {
                                              field.onChange(value); // Keep value as a string
                                            }
                                          }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Box mt={2}>
                        <Button type="submit" variant='outlined' fullWidth color="primary">
                            Add Material
                        </Button>
                    </Box>
                </form>


                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S. No.</TableCell>
                                <TableCell>Material / Cost</TableCell>
                                <TableCell>Req For</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Unit</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>VAT Tax</TableCell>
                                <TableCell>Total Cost</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {materials.map((material, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{material.material}</TableCell>
                                    <TableCell>{material.requiredFor}</TableCell>
                                    <TableCell>{Suppliers?.find(f => f.id === material.supplier)?.name || ""}</TableCell>
                                    <TableCell>{material.quantity}</TableCell>
                                    <TableCell>{material.unit}</TableCell>
                                    <TableCell>£ {Number(material.price).toFixed(2)}</TableCell>
                                    <TableCell>{Number(material.vat).toFixed(2)}%</TableCell>
                                    <TableCell>£ {Number(material.totalCost).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDeleteMaterial(index)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={8} align="right">
                                    <strong>Total =</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>£ {calculateGrandTotal().toFixed(2)}</strong>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box mt={2}>
                    <Button disabled={submiting} variant="contained" color="primary" fullWidth onClick={submitProject}>
                        {
                            submiting ? <CircularProgress /> : "Save Project & Generate Quotation"
                        }

                    </Button>
                </Box>
            </Paper>
        </main>
    );
};

export default ProjectForm;
