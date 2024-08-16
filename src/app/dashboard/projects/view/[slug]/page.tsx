'use client'
import { QuotationData, Material } from "@/types";
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SubTaskTable from './subtask'
import MaterialTable from './material'
interface GroupedMaterialsBySupplier {
    supplierId: string;
    name: string;
    materials: Material[];
}
const Projects = () => {
    const params = useParams()
    const router = useRouter()
    const [markup, setMarkup] = useState("")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<QuotationData>()
    const [groupedMaterials, setGroupedMaterials] = useState<GroupedMaterialsBySupplier[]>([]);

    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug)
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
                setGroupedMaterials(groupMaterialsBySupplier(_data.Material));
            } else {
                router.back();
            }
        } else {
            router.back();
        }
        setLoading(false);
    };
    const groupMaterialsBySupplier = (materials: Material[]): GroupedMaterialsBySupplier[] => {
        return materials.reduce((acc: GroupedMaterialsBySupplier[], material: Material) => {
            const existingGroup = acc.find(group => group.supplierId === material.supplierId);

            if (existingGroup) {
                existingGroup.materials.push(material);
            } else {
                acc.push({
                    supplierId: material.supplierId,
                    name: material.supplier.name,
                    materials: [material],
                });
            }

            return acc;
        }, []);
    };
    const calculateData = () => {
        if (!data) return null
        let subTaskAmount =  Number(data?.SubTask.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0))
        let materialAmount = Number(data?.Material.reduce((total, subTask) => total + subTask.totalCost, 0))
        let markup = 
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
            <Paper sx={{ padding: 4 }}>
                <Grid container spacing={2} marginLeft={2}>
                    <Grid xs={12} sm={5.8}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Project Details</Typography>
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
                    <Button variant='outlined' >
                        Add Sub Task
                    </Button>

                </Box>
                {data?.SubTask && <SubTaskTable rows={data?.SubTask} />}
                <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total = ${data?.SubTask && Number(data?.SubTask.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toFixed(2).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Materials / Cost</Typography>
                    <Button variant='outlined' >
                        Add Material / Cost
                    </Button>

                </Box>
                <Divider />
                {
                    groupedMaterials.map(m => (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>{m.name}</Typography>
                                <Button variant='outlined' >
                                    Download Supplier Request
                                </Button>

                            </Box>
                            <MaterialTable rows={m.materials} />
                            <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total = ${Number(m.materials.reduce((total, subTask) => total + (subTask.totalCost), 0)).toFixed(2).toLocaleString()}</Typography>
                            </Box>
                            <Divider />
                        </>
                    ))
                }
                <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: 'flex-end', alignContent: 'flex-end' }}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Add Markup Percentage =</Typography>
                        <TextField type='number' value={markup} onChange={(e) => setMarkup(e.target.value)} />
                    </Box>
                </Box>
                <Grid container spacing={3} sx={{ marginTop: 10, marginLeft: 4 }}>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Sub-Tasks</Typography>
                        <Typography variant='body1' >{data?.SubTask && Number(data?.SubTask.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toFixed(2).toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Material / Cost</Typography>
                        <Typography variant='body1' >{data?.Material && Number(data?.Material.reduce((total, subTask) => total + (subTask.totalCost), 0)).toFixed(2).toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>% Markup</Typography>
                        <Typography variant='body1' >{String(data?.client.clientId).padStart(6, '0')}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >+</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>VAT</Typography>
                        <Typography variant='body1' >{String(data?.client.clientId).padStart(6, '0')}</Typography>
                    </Grid>
                    <Grid xs={1}>
                        <Typography variant='body1' >=</Typography>
                    </Grid>
                    <Grid xs={1.5}>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Quotation</Typography>
                        <Typography variant='body1' >{String(data?.client.clientId).padStart(6, '0')}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </main>
    )
}

export default Projects
