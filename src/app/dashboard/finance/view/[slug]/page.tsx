'use client'
import { QuotationData, Material, SubTask } from "@/types";
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress, Dialog, DialogContent, MenuItem, DialogActions, Chip, IconButton, Select, FormControl, InputLabel } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import SubTaskTable from './subtask'
import MaterialTable from './material'
import jsPDF from 'jspdf';
import MainLogo from '@/assets/auth_logo.png'
import Logo01 from '@/assets/logos-01.png'
import Logo02 from '@/assets/logos-02.png'
import Logo03 from '@/assets/logos-03.png'
import Logo04 from '@/assets/logos-04.png'
import Swal from "sweetalert2";
import { z } from 'zod';
import { Controller, useForm } from "react-hook-form";
import { CircleOutlined } from "@mui/icons-material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/util/firebaseConfig';
import InvoiceTable from './Invoice'


interface GroupedMaterialsBySupplier {
    supplierId: string;
    name: string;
    materials: Material[];
}
interface GroupedSubTaksByContractor {
    subContractorId: string;
    name: string;
    subTaks: SubTask[];
}

type MaterialForm = {
    material: string;
    requireFor: string;
    supplierId: string;
    quantity: number;
    unit: string;
    price: number;
    vat: number;
    totalCost: number;
};


type FormValues = Omit<MaterialForm, 'totalCost'>;

const subTaskSchema = z.object({
    subTaskId: z.string().nonempty('Sub Task ID is required'),
    subTaskName: z.string().nonempty('Sub Task Name is required'),
    description: z.string().optional(),
    assignTo: z.string().nonempty('Assign To is required'),
    startDate: z.string().nonempty('Start Date is required'),
    endDate: z.string().nonempty('End Date is required'),
    addCost: z.number().positive('Cost must be a positive number').optional(),
    vat: z.number().positive('VAT must be a positive number').optional(),
});
type SubTaskForm = z.infer<typeof subTaskSchema>;
interface UploadedFile {
    name: string;
    url: string;
}
const Projects = () => {
    const params = useParams()
    const router = useRouter()
    const [markup, setMarkup] = useState("")
    const [openDialoge, setOpenDialoge] = useState(false)
    const [id, setId] = useState({
        id: "",
        type: ""
    })


    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<QuotationData>()

    const [groupedMaterials, setGroupedMaterials] = useState<GroupedMaterialsBySupplier[]>([]);
    const [groupedSubTasks, setGroupedSubTasks] = useState<GroupedSubTaksByContractor[]>([]);
    const [status, setStatus] = useState("UNPAID")
    const [transactionType, setTransactionType] = useState("")
    const [submiting, setSubmiting] = useState(false)
    const [total, setTotal] = useState({
        subTaskAmount: 0,
        materialAmount: 0,
        markupAmount: 0,
        vat: 0,
        totalAmount: 0
    })
    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug)
            // getCreateDetail()
        } else {
            router.back()
        }
    }, [params])
    const getSupplier = async (slug: any) => {
        setLoading(true);
        const res = await fetch(`/api/project/${slug}`);
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data = _d.data;
                console.log(_data, "data from api");
                setData(_data)
                setMarkup(_data.materialMarkUp)
                setGroupedMaterials(groupMaterialsBySupplier(_data.Material));
                setGroupedSubTasks(groupSubTaskByContractor(_data.SubTask))
                calculateData(_data)
            } else {
                router.back();
            }
        } else {
            router.back();
        }
        setLoading(false);
    };
    const groupSubTaskByContractor = (subTasks: SubTask[]): GroupedSubTaksByContractor[] => {
        return subTasks.reduce((acc: GroupedSubTaksByContractor[], subTask: SubTask) => {
            const existingGroup = acc.find(group => group.subContractorId === subTask.subContactor.id);

            if (existingGroup) {
                existingGroup.subTaks.push(subTask);
            } else {
                acc.push({
                    subContractorId: subTask.subContactor.id,
                    name: subTask.subContactor.name,
                    subTaks: [subTask],
                });
            }

            return acc;
        }, []);
    };
    const groupMaterialsBySupplier = (materials: Material[]): GroupedMaterialsBySupplier[] => {
        return materials.reduce((acc: GroupedMaterialsBySupplier[], material: Material) => {
            const existingGroup = acc.find(group => group.supplierId === material.supplier.id);

            if (existingGroup) {
                existingGroup.materials.push(material);
            } else {
                acc.push({
                    supplierId: material.supplier.id,
                    name: material.supplier.name,
                    materials: [material],
                });
            }

            return acc;
        }, []);
    };
    const calculateData = (data: QuotationData) => {
        if (!data) return null
        let subTaskAmount = Number(data?.SubTask.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0))
        let materialAmount = Number(data?.Material.reduce((total, subTask) => total + subTask.totalCost, 0))
        let markupAmount = markup !== "" || Number(markup) > 0 ? (subTaskAmount + materialAmount) * (Number(markup) / 100) :
            data.materialMarkUp !== "" || Number(data.materialMarkUp) > 0 ? (subTaskAmount + materialAmount) * (Number(data.materialMarkUp) / 100) :
                0
        let vat = (subTaskAmount + materialAmount + markupAmount) * 0.2
        let totalAmount = subTaskAmount + materialAmount + markupAmount + vat
        setTotal({
            subTaskAmount,
            materialAmount,
            markupAmount,
            vat,
            totalAmount
        })
    }
    React.useEffect(() => {
        if (data) calculateData(data)
    }, [markup])
    const handelOpenDialogue = (id: string, type: string) => {
        setId({
            id,
            type
        })
        setOpenDialoge(true)
    }
    const handleupdate = async () => {
        
        if(status === "UNPAID" && transactionType==="" || transactionType==="") return null 
        setSubmiting(true)
        const res = await fetch(`/api/project/${params.slug}/updateStatus`, {
            method: "POST",
            body: JSON.stringify({
                id: id.id,
                type: id.type,
                status,
                transactionType
            })
        });
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                // if (data) {
                //     console.log("here in data")
                //     groupSubTaskByContractor([...data.SubTask, _data])
                //     setData({ ...data, SubTask: [...data.SubTask, _data] })

                // }
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Status update Successfully",
                    timer: 3000
                })
                router.refresh()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error update status",
                    timer: 3000
                })
            }
        } else {
            // router.back();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error update status",
                timer: 3000
            })
        }
        setOpenDialoge(false)
        setSubmiting(false)
        setId({
            id: "",
            type: ""
        })
        setTransactionType("")
        setStatus("UNPAID")

    }
    if (loading) {
        return (
            <main>
                <CircularProgress />
            </main>
        );
    }
    return (

        <main>
            {data?.qutationGenerated && <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Project Details</Typography>
            </Box>}

            <Paper sx={{ padding: 4 }}>
                {data?.qutationGenerated && <Grid container spacing={2} marginBottom={5}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, textAlign: "center" }}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total Project Cost</Typography>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {total.totalAmount.toLocaleString()}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, textAlign: "center" }}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total Expense</Typography>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {(total.totalAmount - total.markupAmount).toLocaleString()}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, textAlign: "center" }}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Expected Profit</Typography>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {total.markupAmount.toLocaleString()}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, textAlign: "center" }}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Payment Received</Typography>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {(total.totalAmount - data.remainingAmount).toLocaleString()}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, textAlign: "center" }}>
                            <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Payment Pending</Typography>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {(data.remainingAmount).toLocaleString()}</Typography>
                        </Box>
                    </Grid>
                </Grid>}
                <Grid container spacing={2} marginLeft={2} >
                    <Grid xs={12} sm={5.8}>
                        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Project Details</Typography>

                        </Box>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, padding: 4 }}>
                            <Grid container spacing={2}>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Project ID</Typography>
                                    <Typography variant='body1' >{String(data?.projectId).padStart(6, '0')}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Project’s Name</Typography>
                                    <Typography variant='body1' >{data?.name}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Project Manager</Typography>
                                    <Typography variant='body1' >{data?.user.firstName + " " + data?.user.lastName}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Start Date</Typography>
                                    <Typography variant='body1' >{data?.startDate ? new Date(data?.startDate).toLocaleDateString() : ""}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>End Date</Typography>
                                    <Typography variant='body1' >{data?.endDate ? new Date(data?.endDate).toLocaleDateString() : ""}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Project Address</Typography>
                                    <Typography variant='body1' >{data?.location}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid xs={12} sm={5.8} sx={{ marginLeft: 1 }}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Client Details</Typography>
                        <Box sx={{ border: "1px solid black", borderRadius: 5, padding: 4 }}>
                            <Grid container spacing={2}>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Client ID</Typography>
                                    <Typography variant='body1' >{String(data?.client.clientId).padStart(6, '0')}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Contact Person</Typography>
                                    <Typography variant='body1' >{data?.contactPerson}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Client’s Name</Typography>
                                    <Typography variant='body1' >{data?.client.name}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Email</Typography>
                                    <Typography variant='body1' >{data?.client.email}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Phone Number</Typography>
                                    <Typography variant='body1' >{data?.phone}</Typography>
                                </Grid>
                                <Grid xs={6}>
                                    <Typography variant='h6' sx={{ fontWeight: "bold" }}>Address</Typography>
                                    <Typography variant='body1' >{data?.client.location}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Sub Tasks</Typography>


                </Box>
                {
                    groupedSubTasks.map(m => (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>{m.name}</Typography>

                            </Box>
                            <SubTaskTable rows={m.subTaks} handelOpenDialogue={handelOpenDialogue} submiting={submiting} />
                            <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total = ${Number(m.subTaks.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toFixed(2).toLocaleString()}</Typography>
                            </Box>
                            <Divider />
                        </>
                    ))
                }
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Materials / Cost</Typography>

                </Box>
                <Divider />
                {
                    groupedMaterials.map(m => (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>{m.name}</Typography>

                            </Box>
                            <MaterialTable rows={m.materials} handelOpenDialogue={handelOpenDialogue} submiting={submiting} />
                            <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total = ${Number(m.materials.reduce((total, subTask) => total + (subTask.totalCost), 0)).toFixed(2).toLocaleString()}</Typography>
                            </Box>
                            <Divider />
                        </>
                    ))
                }

                <Grid container spacing={3} sx={{ marginTop: 10, marginLeft: 4 }}>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Sub-Tasks</Typography>
                        <Typography variant='body1' >${total.subTaskAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Material / Cost</Typography>
                        <Typography variant='body1' >${total.materialAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>% Markup</Typography>
                        <Typography variant='body1' >${total.markupAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>VAT</Typography>
                        <Typography variant='body1' >${total.vat.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >=</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Quotation</Typography>
                        <Typography variant='body1' >${total.totalAmount.toLocaleString()}</Typography>
                    </Grid>
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Invoices</Typography>
                </Box>
                {data?.Invoice && <InvoiceTable rows={data?.Invoice} handelOpenDialogue={handelOpenDialogue} submiting={submiting} />}
            </Paper>
            <Dialog
                open={openDialoge}
                fullWidth
                maxWidth={"md"}
                onClose={() => {
                    setOpenDialoge(false)
                    setId({
                        id: "",
                        type: ""
                    })
                }}
            >
                <DialogContent>
                    <Typography variant='body1' >Update Status</Typography>
                    <FormControl fullWidth sx={{marginBottom:5,marginTop:5}} >
                        <InputLabel id="demo-simple-select-label">Select Payment Status</InputLabel>
                        <Select
                            fullWidth
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={status}
                            label="Select Payment Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value={"UNPAID"}>UN PAID</MenuItem>
                            <MenuItem value={"PAID"}>PAID</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label2">Select Payment Status</InputLabel>
                        <Select
                            fullWidth
                            labelId="demo-simple-select-label3"
                            id="demo-simple-select2"
                            value={transactionType}
                            label="Select Transaction Type"
                            onChange={(e) => setTransactionType(e.target.value)}
                        >
                            <MenuItem value={"BANK"}>BANK</MenuItem>
                            <MenuItem value={"CASH"}>CASH</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' disabled={submiting} color='error' onClick={() => {
                        setOpenDialoge(false)
                        setId({
                            id: "",
                            type: ""
                        })
                    }}>Close</Button>
                    <Button variant='contained' color='primary' disabled={submiting} onClick={() => handleupdate()}>{submiting ? <CircularProgress /> : "Save"}</Button>
                </DialogActions>

            </Dialog>
        </main>
    )
}

export default Projects
