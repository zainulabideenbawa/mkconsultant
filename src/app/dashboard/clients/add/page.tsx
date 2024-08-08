'use client'
import { Button, Grid, Typography, Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup } from "@mui/material";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    invoiceId: z.string().min(1, "Invoice ID is required"),
    client: z.string().min(1, "Client is required"),
    project: z.string().min(1, "Project is required"),
    dueDate: z.string().min(1, "Due Date is required"),
    supplier: z.string().min(1, "Supplier is required"),
    amount: z.number().min(0, "Amount must be greater than or equal to 0"),
    tasks: z.array(z.string()).optional(),
    notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const InvoiceForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit: SubmitHandler<FormData> = data => {
        console.log(data);
    };

    const tasks = ["Task 01", "Task 02", "Task 03", "Task 04", "Task 05", "Task 06", "Task 07"];

    return (
        <main>
            <Typography variant='h4' sx={{ fontWeight: "bold", marginBottom: 4 }}>Generate New Invoice</Typography>
            <Paper sx={{ padding: 4 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="invoiceId"
                                label="Invoice ID"
                                {...register('invoiceId')}
                                error={!!errors.invoiceId}
                                helperText={errors.invoiceId ? errors.invoiceId.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Client</InputLabel>
                                <Select
                                    label="Select Client"
                                    id="client"
                                    {...register('client')}
                                    error={!!errors.client}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Client1">Client 1</MenuItem>
                                    <MenuItem value="Client2">Client 2</MenuItem>
                                    <MenuItem value="Client3">Client 3</MenuItem>
                                </Select>
                                {errors.client && <Typography variant="body2" color="error">{errors.client.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Project</InputLabel>
                                <Select
                                    label="Select Project"
                                    id="project"
                                    {...register('project')}
                                    error={!!errors.project}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Project1">Project 1</MenuItem>
                                    <MenuItem value="Project2">Project 2</MenuItem>
                                    <MenuItem value="Project3">Project 3</MenuItem>
                                </Select>
                                {errors.project && <Typography variant="body2" color="error">{errors.project.message}</Typography>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                type="date"
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="dueDate"
                                label="Select Due Date"
                                {...register('dueDate')}
                                error={!!errors.dueDate}
                                helperText={errors.dueDate ? errors.dueDate.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth variant="outlined" margin="normal" required>
                                <InputLabel>Select Supplier</InputLabel>
                                <Select
                                    label="Select Supplier"
                                    id="supplier"
                                    {...register('supplier')}
                                    error={!!errors.supplier}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    <MenuItem value="Supplier1">Supplier 1</MenuItem>
                                    <MenuItem value="Supplier2">Supplier 2</MenuItem>
                                    <MenuItem value="Supplier3">Supplier 3</MenuItem>
                                </Select>
                                {errors.supplier && <Typography variant="body2" color="error">{errors.supplier.message}</Typography>}
                            </FormControl>
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
                                {...register('amount')}
                                error={!!errors.amount}
                                helperText={errors.amount ? errors.amount.message : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Select the job you are invoicing for</Typography>
                            <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 1, marginBottom: 2 }}>
                                <FormGroup row>
                                    {tasks.map((task, index) => (
                                        <FormControlLabel
                                            key={index}
                                            control={<Checkbox {...register('tasks')} value={task} />}
                                            label={task}
                                        />
                                    ))}
                                </FormGroup>
                            </Box>
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
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </main>
    )
}

export default InvoiceForm;
