'use client'
import { QuotationData, Material, SubTask } from "@/types";
import { Button, Container, Divider, Grid, Typography, Box, Paper, TextField, CircularProgress, Dialog, DialogContent, MenuItem, DialogActions, Chip, IconButton } from "@mui/material";
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
    const [openMaterial, setMaterialDialoge] = useState(false)
    const [openSubTask, setopenSubTask] = useState(false)
    const [openEditMarkup, setOpenEditMarkup] = useState(false)
    const [openUplaod, setOpenUpload] = useState(false)
    const [inputName, setInputName] = useState("")

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<QuotationData>()
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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
        notes: string | null,
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
    const [groupedMaterials, setGroupedMaterials] = useState<GroupedMaterialsBySupplier[]>([]);
    const [groupedSubTasks, setGroupedSubTasks] = useState<GroupedSubTaksByContractor[]>([]);
    const [submiting, setSubmiting] = useState(false)
    const [total, setTotal] = useState({
        subTaskAmount: 0,
        materialAmount: 0,
        markupAmount: 0,
        vat: 0,
        totalAmount: 0
    })
    const { register: registerMaterial,
        handleSubmit: handleSubmitMaterial,
        control: controlMaterial,
        setValue: setMaterialValue,
        formState: { errors: errorsMaterial }, reset } = useForm<FormValues>();
    const { register: registerSubTask,
        handleSubmit: handleSubmitSubTask,
        control: controlSubTask,
        setValue: setSubTaskValue,
        formState: { errors: errorsSubTask }, register } = useForm<SubTaskForm>();
    const footerLogos = [
        Logo01.src,
        Logo02.src,
        Logo03.src,
        Logo04.src,

    ]
    const getCreateDetail = async () => {
        const res = await fetch('/api/project/createDetail')
        if (res.ok) {
            let _d = await res.json();
            console.log(_d, "data")
            setSubContrator(_d.subcontractors)
            setSuppliers(_d.supplier)
        }
    }
    const onSubmitMaterial = async (formData: FormValues) => {
        const totalCost = formData.quantity * formData.price * (1 + formData.vat / 100)
        setSubmiting(true)
        const res = await fetch(`/api/project/${params.slug}/addMaterial`, {
            method: "POST",
            body: JSON.stringify({ ...formData, totalCost })
        });
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data: Material = _d.data;
                console.log(_data, "data from api");
                if (data) {
                    console.log("here in data")
                    groupMaterialsBySupplier([...data.Material, _data])
                    setData({ ...data, Material: [...data.Material, _data] })

                }
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Materail Added Successfully",
                    timer: 3000
                })
                router.refresh()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error Add Material",
                    timer: 3000
                })
            }
        } else {
            // router.back();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error Add Material",
                timer: 3000
            })
        }

        setSubmiting(false)
        // reset();
        setMaterialValue('material', "")
        setMaterialValue('price', 0)
        setMaterialValue('quantity', 0)
        setMaterialValue('requireFor', "")
        setMaterialValue('supplierId', "")
        setMaterialValue('unit', "")
        setMaterialValue('vat', 0)
        setMaterialDialoge(false)
    };
    const onSubmitSubTask = async (formData: SubTaskForm) => {
        setSubmiting(true)
        const res = await fetch(`/api/project/${params.slug}/addSubtask`, {
            method: "POST",
            body: JSON.stringify({ ...formData })
        });
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data: SubTask = _d.data;
                console.log(_data, "data from api");
                if (data) {
                    console.log("here in data")
                    groupSubTaskByContractor([...data.SubTask, _data])
                    setData({ ...data, SubTask: [...data.SubTask, _data] })

                }
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "SubTask Added Successfully",
                    timer: 3000
                })
                router.refresh()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error Add SubTask",
                    timer: 3000
                })
            }
        } else {
            // router.back();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error Add SubTask",
                timer: 3000
            })
        }

        setSubmiting(false)
        setSubTaskValue('subTaskId', "")
        setSubTaskValue('addCost', 0)
        setSubTaskValue('vat', 0)
        setSubTaskValue('assignTo', "")
        setSubTaskValue('description', "")
        setSubTaskValue('endDate', "")
        setSubTaskValue('startDate', "")
        setSubTaskValue('subTaskName', "")
        setopenSubTask(false)
    };


    useEffect(() => {
        if (params.slug) {
            getSupplier(params.slug)
            getCreateDetail()
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
    const saveAndGenerateQoutation = async () => {
        setSubmiting(true)
        if (markup === "" || Number(markup) < 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please Add Markup Percentage",
                timer: 3000
            })
            return null
        }
        const res = await fetch(`/api/project/${params.slug}/updateMarkup`, {
            method: "POST",
            body: JSON.stringify({ markup })
        });
        if (res.ok) {
            const _d = await res.json();
            if (_d.status) {
                const _data: QuotationData = _d.data;
                generatePDF()
                router.refresh()
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error Update Markup",
                    timer: 3000
                })
            }
        } else {
            // router.back();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error Update Markup",
                timer: 3000
            })
        }
        setSubmiting(false)
        setOpenEditMarkup(false)
    }
    const generatePDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const headerHeight = 50;
        const footerHeight = 50;
        const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;

        const header = () => {
            if (!data) return
            doc.addImage(MainLogo.src, 'PNG', margin, margin, 100, 20);
            doc.setFontSize(18);
            doc.setFillColor('blue');
            doc.text('QUOTATION', pageWidth / 2, margin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setFillColor('black');

            doc.text(data?.client.name, margin, margin + 40);
            doc.text(data?.client.phone, margin, margin + 48);
            doc.text(data?.client.email, margin, margin + 56);
            doc.text(data?.client.location, margin, margin + 64);

            doc.text(`Quotation no: ${String(data.projectId).padStart(6, "0")}-${String(data.SubTask.length).padStart(6, "0")}`, pageWidth - margin - 60, margin + 30);
            doc.text(`Quotation Date:${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 35);
        };

        const footer = (page: any) => {
            const footerY = pageHeight - footerHeight - margin;
            doc.setFontSize(10);
            doc.text(`www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Bunting Bridge, Newbury Park, Essex, IG2 7LR`, pageWidth / 2, footerY + 35, { align: 'center' });

            doc.setFontSize(8);
            doc.text('Thank you for your business with us!', pageWidth / 2, footerY + 45, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Page ${page}`, pageWidth / 2, footerY + 55, { align: 'center' });

            // Add footer logos with margin and different sizes on the right side
            const logosY = footerY + 10;
            const logoMargin = 5;
            const logoWidth = 20;  // Width of square logos
            const rectLogoWidth = 30; // Width of rectangular logos
            const logoHeight = 20; // Height of logos

            // Calculate the starting x position based on the number of logos and their sizes
            const logosX = (pageWidth / 2) - (((footerLogos.length - 2) * (logoWidth + logoMargin)) / 2) - ((2 * (rectLogoWidth + logoMargin)) / 2);

            footerLogos.forEach((logo: any, index: any) => {
                const xPosition = index === 1 || index === 3
                    ? logosX + index * (rectLogoWidth + logoMargin)
                    : logosX + index * (logoWidth + logoMargin + 10);

                const width = index === 1 || index === 3 ? rectLogoWidth : logoWidth;
                doc.addImage(logo, 'PNG', xPosition, logosY, width, logoHeight);
            });
        };

        const addTableContent = () => {
            const startY = margin + headerHeight + 20;
            let currentY = startY;
            let page = 1;
            let rowIndex = 0;

            const tableHeader = () => {
                doc.setFontSize(12);
                doc.text("", margin, margin + 64)
                doc.text('NO', margin, currentY);
                doc.text('DESCRIPTION', margin + 20, currentY);
                doc.text('PRICE', pageWidth - margin - 40, currentY);
                currentY += 10;
            };

            const tableRow = (row: any) => {
                doc.text(`${row.no}`, margin, currentY);
                doc.text(`${row.description}`, margin + 20, currentY);
                doc.text(`${row.price}`, pageWidth - margin - 40, currentY);
                currentY += 10;
            };

            tableHeader();
            tableRow({
                no: 1,
                description: `Project ID - ${String(data?.projectId).padStart(6, '0')}, ${data?.name}`,
                price: `$ ${Number(total.subTaskAmount + total.materialAmount + total.markupAmount).toLocaleString()}`
            })
            footer(page);
        };

        const addProjectDetailsAndPaymentMethod = () => {
            const startY = margin + headerHeight + 150;
            doc.setFontSize(12);
            doc.text(`SubTotal :     $ ${Number(total.subTaskAmount + total.materialAmount + total.markupAmount).toLocaleString()}`, pageWidth - margin - 60, startY);
            doc.text(`VAT:           $ ${total.vat.toLocaleString()}`, pageWidth - margin - 60, startY + 10);
            doc.text(`Total Amount : $ ${total.totalAmount.toLocaleString()}`, pageWidth - margin - 60, startY + 20);
        };

        let page = 1;
        header();
        addTableContent();
        addProjectDetailsAndPaymentMethod();
        doc.save(`Qoutation ${data?.projectId}.pdf`);
    };
    const getWorkOrder = async (work: GroupedSubTaksByContractor) => {
        setSubmiting(true)
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const headerHeight = 50;
        const footerHeight = 50;
        const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;
        let findSupplier = subContractor?.find(f => f.id === work.subContractorId)
        if (!findSupplier) return null
        const header = () => {
            if (!data) return
            doc.addImage(MainLogo.src, 'PNG', margin, margin, 100, 20);
            doc.setFontSize(18);
            doc.setFillColor('blue');
            doc.text('QUOTATION', pageWidth / 2, margin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setFillColor('black');

            doc.text(work.name, margin, margin + 40);
            doc.text(findSupplier.phone, margin, margin + 48);
            doc.text(findSupplier.email, margin, margin + 56);
            doc.text(findSupplier.address, margin, margin + 64);

            doc.text(`WorkOrder: ${String(data.projectId).padStart(6, "0")}-${String(work.subTaks.length).padStart(6, "0")}`, pageWidth - margin - 60, margin + 30);
            doc.text(`WorkOrder Date:${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 35);
        };

        const footer = (page: any) => {
            const footerY = pageHeight - footerHeight - margin;
            doc.setFontSize(10);
            doc.text(`www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Bunting Bridge, Newbury Park, Essex, IG2 7LR`, pageWidth / 2, footerY + 35, { align: 'center' });

            doc.setFontSize(8);
            doc.text('Thank you for your business with us!', pageWidth / 2, footerY + 45, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Page ${page}`, pageWidth / 2, footerY + 55, { align: 'center' });

            // Add footer logos with margin and different sizes on the right side
            const logosY = footerY + 10;
            const logoMargin = 5;
            const logoWidth = 20;  // Width of square logos
            const rectLogoWidth = 30; // Width of rectangular logos
            const logoHeight = 20; // Height of logos

            // Calculate the starting x position based on the number of logos and their sizes
            const logosX = (pageWidth / 2) - (((footerLogos.length - 2) * (logoWidth + logoMargin)) / 2) - ((2 * (rectLogoWidth + logoMargin)) / 2);

            footerLogos.forEach((logo: any, index: any) => {
                const xPosition = index === 1 || index === 3
                    ? logosX + index * (rectLogoWidth + logoMargin)
                    : logosX + index * (logoWidth + logoMargin + 10);

                const width = index === 1 || index === 3 ? rectLogoWidth : logoWidth;
                doc.addImage(logo, 'PNG', xPosition, logosY, width, logoHeight);
            });
        };

        const addTableContent = () => {
            const startY = margin + headerHeight + 20;
            let currentY = startY;
            let page = 1;
            let rowIndex = 0;

            const tableHeader = () => {
                doc.setFontSize(12);
                doc.text('Task Id', margin, currentY);
                doc.text('Task Name', margin + 20, currentY);
                doc.text('Start Date', pageWidth - margin - 60, currentY);
                doc.text('End Date', pageWidth - margin - 40, currentY);
                doc.text('Cost', pageWidth - margin - 20, currentY);
                currentY += 10;
            };

            const tableRow = (row: any) => {
                doc.text(`${row.no}`, margin, currentY);
                doc.text(`${row.description}`, margin + 20, currentY);
                doc.text(`${row.qty}`, pageWidth - margin - 60, currentY);
                doc.text(`${row.price}`, pageWidth - margin - 40, currentY);
                doc.text(`${row.total}`, pageWidth - margin - 20, currentY);
                currentY += 10;
            };

            tableHeader();
            work.subTaks.forEach((row: any, index: any) => {
                if ((index + 1) % 10 === 0 && index !== 0) {
                    footer(page);
                    doc.addPage();
                    currentY = margin + headerHeight + 20;
                    page++;
                    header();
                    tableHeader();
                }
                tableRow({
                    no: row.taskId.toString().padStart(3, "0"),
                    description: row.name,
                    qty: new Date(row.startDate).toLocaleDateString(),
                    price: new Date(row.endDate).toLocaleDateString(),
                    total: `$ ${row.cost.toLocaleString()}`
                });
            });

            footer(page);
        };

        const addProjectDetailsAndPaymentMethod = () => {
            const startY = margin + headerHeight + 150;
            doc.setFontSize(12);
            doc.text(`SubTotal :     $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost), 0)).toLocaleString()}`, pageWidth - margin - 60, startY);
            doc.text(`VAT:           $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost * (subTask.vat / 100)), 0)).toLocaleString()}`, pageWidth - margin - 60, startY + 10);
            doc.text(`Total Amount : $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toLocaleString()}`, pageWidth - margin - 60, startY + 20);
        };

        let page = 1;
        header();
        addTableContent();
        addProjectDetailsAndPaymentMethod();
        setSubmiting(false)
        doc.save(`workorer - ${work.name} - ${data?.projectId}.pdf`);

    };
    const getSupplierRequest = async (work: GroupedMaterialsBySupplier) => {
        setSubmiting(true)
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const headerHeight = 50;
        const footerHeight = 50;
        const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;
        let findSupplier = Suppliers?.find(f => f.id === work.supplierId)
        if (!findSupplier) return null
        const header = () => {
            if (!data) return
            doc.addImage(MainLogo.src, 'PNG', margin, margin, 100, 20);
            doc.setFontSize(18);
            doc.setFillColor('blue');
            doc.text('QUOTATION', pageWidth / 2, margin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setFillColor('black');

            doc.text(findSupplier.name, margin, margin + 40);
            doc.text(findSupplier.phone, margin, margin + 48);
            doc.text(findSupplier.email, margin, margin + 56);
            doc.text(findSupplier.address, margin, margin + 64);

            doc.text(`Supplier Request: ${String(data.projectId).padStart(6, "0")}-${String(work.materials.length).padStart(6, "0")}`, pageWidth - margin - 60, margin + 30);
            doc.text(`Request Date:${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 35);
        };

        const footer = (page: any) => {
            const footerY = pageHeight - footerHeight - margin;
            doc.setFontSize(10);
            doc.text(`www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Bunting Bridge, Newbury Park, Essex, IG2 7LR`, pageWidth / 2, footerY + 35, { align: 'center' });

            doc.setFontSize(8);
            doc.text('Thank you for your business with us!', pageWidth / 2, footerY + 45, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`Page ${page}`, pageWidth / 2, footerY + 55, { align: 'center' });

            // Add footer logos with margin and different sizes on the right side
            const logosY = footerY + 10;
            const logoMargin = 5;
            const logoWidth = 20;  // Width of square logos
            const rectLogoWidth = 30; // Width of rectangular logos
            const logoHeight = 20; // Height of logos

            // Calculate the starting x position based on the number of logos and their sizes
            const logosX = (pageWidth / 2) - (((footerLogos.length - 2) * (logoWidth + logoMargin)) / 2) - ((2 * (rectLogoWidth + logoMargin)) / 2);

            footerLogos.forEach((logo: any, index: any) => {
                const xPosition = index === 1 || index === 3
                    ? logosX + index * (rectLogoWidth + logoMargin)
                    : logosX + index * (logoWidth + logoMargin + 10);

                const width = index === 1 || index === 3 ? rectLogoWidth : logoWidth;
                doc.addImage(logo, 'PNG', xPosition, logosY, width, logoHeight);
            });
        };

        const addTableContent = () => {
            const startY = margin + headerHeight + 20;
            let currentY = startY;
            let page = 1;
            let rowIndex = 0;

            const tableHeader = () => {
                doc.setFontSize(12);
                doc.text('Sr No.', margin, currentY);
                doc.text('Description', margin + 20, currentY);
                doc.text('Quantity', pageWidth - margin - 60, currentY);
                doc.text('Unit', pageWidth - margin - 40, currentY);
                // doc.text('Cost', pageWidth - margin - 20, currentY);
                currentY += 10;
            };

            const tableRow = (row: any) => {
                doc.text(`${row.no}`, margin, currentY);
                doc.text(`${row.description}`, margin + 20, currentY);
                doc.text(`${row.qty}`, pageWidth - margin - 60, currentY);
                doc.text(`${row.price}`, pageWidth - margin - 40, currentY);
                // doc.text(`${row.total}`, pageWidth - margin - 20, currentY);
                currentY += 10;
            };

            tableHeader();
            work.materials.forEach((row: Material, index: any) => {
                if ((index + 1) % 10 === 0 && index !== 0) {
                    footer(page);
                    doc.addPage();
                    currentY = margin + headerHeight + 20;
                    page++;
                    header();
                    tableHeader();
                }
                tableRow({
                    no: index + 1,
                    description: row.material,
                    qty: row.quantity,
                    price: row.unit
                });
            });

            footer(page);
        };

        // const addProjectDetailsAndPaymentMethod = () => {
        //     const startY = margin + headerHeight + 150;
        //     doc.setFontSize(12);
        //     doc.text(`SubTotal :     $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost), 0)).toLocaleString()}`, pageWidth - margin - 60, startY);
        //     doc.text(`VAT:           $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost*(subTask.vat/100)), 0)).toLocaleString()}`, pageWidth - margin - 60, startY + 10);
        //     doc.text(`Total Amount : $ ${Number(work.subTaks.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toLocaleString()}`, pageWidth - margin - 60, startY + 20);
        // };

        let page = 1;
        header();
        addTableContent();
        // addProjectDetailsAndPaymentMethod();
        setSubmiting(false)
        doc.save(`Supplier Request - ${work.name} - ${data?.projectId}.pdf`);

    };
    React.useEffect(() => {
        if (data) calculateData(data)
    }, [markup])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };
    const handleUpload = async () => {
        if (!files) return; // Exit if no files selected
        setSubmiting(true)
        await Array.from(files).forEach(async (file) => {
            const storageRef = ref(storage, `documents/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error('Upload failed', error);
                },
                async () => {
                    await getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        // setUploadedFiles((prev) => [...prev, { name: file.name, url: downloadURL }]);
                        const res = await fetch(`/api/project/${params.slug}/uploadDocument`, {
                            method: "POST",
                            body: JSON.stringify({ name: `${inputName} - ${file.name}`, url: downloadURL })
                        });
                        if (res.ok) {
                            const _d = await res.json();
                            if (_d.status) {
                                router.refresh()
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Error upload Document",
                                    timer: 3000
                                })
                            }
                        } else {
                            // router.back();
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Error upload Document",
                                timer: 3000
                            })
                        }
                        setInputName("")
                        setOpenUpload(false)
                        setSubmiting(false)
                        setFiles(null)
                    });
                }
            );
        });

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
            {data?.qutationGenerated && <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Project Details</Typography>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: 'flex-end', alignItems: 'center' }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: "bold", marginBottom: 2, marginRight: 5 }}>Project Status: <Chip label={data?.status} /></Typography>
                    <Button sx={{ marginTop: -2 }} variant='contained' color="primary" onClick={generatePDF}>Download quotation</Button>
                </Box>
            </Box>}
            
            <Paper sx={{ padding: 4 }}>
            {data?.qutationGenerated && <Grid container spacing={2} marginBottom={5}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ border: "1px solid black", borderRadius: 5 ,textAlign:"center"}}>
                        <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Sub Tasks</Typography>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>{data.SubTask.length}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ border: "1px solid black", borderRadius: 5 ,textAlign:"center"}}>
                        <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Payment Pending</Typography>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {total.totalAmount.toLocaleString()}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ border: "1px solid black", borderRadius: 5 ,textAlign:"center"}}>
                        <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Payment Received</Typography>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {data.remainingAmount === 0 ? 0:(total.totalAmount - data.remainingAmount).toLocaleString()}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ border: "1px solid black", borderRadius: 5 ,textAlign:"center"}}>
                        <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>Earning</Typography>
                        <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>$ {total.markupAmount}</Typography>
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
                    <Button variant='outlined' disabled={submiting} onClick={() => {
                        setopenSubTask(true)
                        setSubTaskValue(`subTaskId`, `${String(Number(data?.projectId)).padStart(6, '0')} - ${String(Number(data?.SubTask.length ? data?.SubTask.length + 1 : 1)).padStart(3, '0')}`)
                    }} >
                        {submiting ? <CircularProgress /> : "Add Sub Task"}
                    </Button>

                </Box>
                {
                    groupedSubTasks.map(m => (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>{m.name}</Typography>
                                <Button variant='outlined' disabled={submiting} onClick={() => getWorkOrder(m)} >

                                    {submiting ? <CircularProgress /> : "Download Work Order"}
                                </Button>

                            </Box>
                            <SubTaskTable rows={m.subTaks} />
                            <Box sx={{ display: "flex", justifyContent: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Total = ${Number(m.subTaks.reduce((total, subTask) => total + (subTask.cost + (subTask.vat / 100 * subTask.cost)), 0)).toFixed(2).toLocaleString()}</Typography>
                            </Box>
                            <Divider />
                        </>
                    ))
                }
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Materials / Cost</Typography>
                    <Button variant='outlined' disabled={submiting} onClick={() => setMaterialDialoge(true)}>

                        {submiting ? <CircularProgress /> : "Add Material / Cost"}
                    </Button>

                </Box>
                <Divider />
                {
                    groupedMaterials.map(m => (
                        <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                                <Typography variant='h6' sx={{ fontWeight: "bold", marginBottom: 2 }}>{m.name}</Typography>
                                <Button variant='outlined' disabled={submiting} onClick={() => getSupplierRequest(m)}>

                                    {submiting ? <CircularProgress /> : " Download Supplier Request"}
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
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: 'center', alignContent: 'center' }}>
                        <Typography variant='h5' sx={{ fontWeight: "bold" }}>Add Markup Percentage =</Typography>
                        {data?.qutationGenerated && <Typography variant='h5' > {data?.materialMarkUp}%</Typography>}
                        {data?.qutationGenerated && <Button sx={{ marginLeft: 5 }} onClick={() => setOpenEditMarkup(true)} variant='outlined' disabled={submiting} >{submiting ? <CircularProgress /> : "Edit Percentage"}</Button>}
                        {!data?.qutationGenerated && <TextField type='number' disabled={submiting} value={markup} onChange={(e) => setMarkup(e.target.value)} />}
                    </Box>
                </Box>
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
                {!data?.qutationGenerated && <Button fullWidth variant='contained' color="primary" sx={{ marginTop: 10 }} disabled={submiting} onClick={saveAndGenerateQoutation}>

                    {submiting ? <CircularProgress /> : "Save & Download Quotation PDF"}
                </Button>}
                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 2 }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", marginBottom: 2 }}>Project Documents</Typography>
                    <Button variant='outlined' disabled={submiting} onClick={() => setOpenUpload(true)}>

                        {submiting ? <CircularProgress /> : "Add Documents"}
                    </Button>

                </Box>
                <Divider />
                {data?.qutationGenerated &&
                    <Grid container spacing={2}>
                        {data.documents.map((file, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                                <embed src={file.url} width="200" height="200" type="application/pdf" />
                                <p>{file.name}</p>
                            </Grid>
                        ))}
                    </Grid>}
            </Paper>
            <Dialog
                open={openMaterial}
                onClose={() => {
                    setMaterialValue('material', "")
                    setMaterialValue('price', 0)
                    setMaterialValue('quantity', 0)
                    setMaterialValue('requireFor', "")
                    setMaterialValue('supplierId', "")
                    setMaterialValue('unit', "")
                    setMaterialValue('vat', 0)
                    setMaterialDialoge(false)
                }}
                PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmitMaterial(onSubmitMaterial),
                }}
            >
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Controller
                                name="material"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField disabled={submiting} {...field} fullWidth label="Material/ Cost" error={!!errorsMaterial.material}
                                        helperText={errorsMaterial.material?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Controller
                                name="requireFor"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField disabled={submiting} {...field} fullWidth label="Required For" error={!!errorsMaterial.requireFor}
                                        helperText={errorsMaterial.requireFor?.message} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Controller
                                name="supplierId"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField disabled={submiting} {...field} select fullWidth label="Select Supplier" error={!!errorsMaterial.supplierId}
                                        helperText={errorsMaterial.supplierId?.message}>
                                        <MenuItem value=""></MenuItem>
                                        {Suppliers?.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="quantity"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        disabled={submiting}
                                        label="Qty"
                                        type="number"
                                        InputProps={{ inputProps: { min: 1 } }}
                                        error={!!errorsMaterial.quantity}
                                        helperText={errorsMaterial.quantity?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="unit"

                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField disabled={submiting} select {...field} fullWidth label="Unit" error={!!errorsMaterial.unit}
                                        helperText={errorsMaterial.unit?.message}>
                                        <MenuItem value=""></MenuItem>
                                        <MenuItem value="bags">bags</MenuItem>
                                        <MenuItem value="ton">ton</MenuItem>
                                        <MenuItem value="pieces">pieces</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="price"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        disabled={submiting}
                                        label="Price"
                                        type="number"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        error={!!errorsMaterial.price}
                                        helperText={errorsMaterial.price?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Controller
                                name="vat"
                                control={controlMaterial}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        disabled={submiting}
                                        label="VAT%"
                                        type="number"
                                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                                        error={!!errorsMaterial.vat}
                                        helperText={errorsMaterial.vat?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' disabled={submiting} color='error' onClick={() => {
                        setMaterialValue('material', "")
                        setMaterialValue('price', 0)
                        setMaterialValue('quantity', 0)
                        setMaterialValue('requireFor', "")
                        setMaterialValue('supplierId', "")
                        setMaterialValue('unit', "")
                        setMaterialValue('vat', 0)
                        setMaterialDialoge(false)
                    }}>Close</Button>

                    <Button variant='contained' color='primary' disabled={submiting} type='submit'>


                        {submiting ? <CircularProgress /> : "Add Material/Cost"}</Button>
                </DialogActions>

            </Dialog>
            <Dialog
                open={openSubTask}
                onClose={() => {
                    setSubTaskValue('subTaskId', "")
                    setSubTaskValue('addCost', 0)
                    setSubTaskValue('vat', 0)
                    setSubTaskValue('assignTo', "")
                    setSubTaskValue('description', "")
                    setSubTaskValue('endDate', "")
                    setSubTaskValue('startDate', "")
                    setSubTaskValue('subTaskName', "")
                    setopenSubTask(false)
                }}
                PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmitSubTask(onSubmitSubTask),
                }}
            >
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField

                                {...register('subTaskId')}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Sub Task Name"
                                disabled={submiting}
                                {...register(`subTaskName`, { required: "Sub Task Name is required" })}
                                fullWidth
                                error={!!errorsSubTask?.subTaskName}
                                helperText={errorsSubTask?.subTaskName?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                label="Description"
                                {...register(`description`)}
                                disabled={submiting}
                                fullWidth
                                error={!!errorsSubTask?.description}
                                helperText={errorsSubTask?.description?.message}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Assign To"
                                {...register(`assignTo`, { required: "Assign To is required" })}
                                fullWidth
                                disabled={submiting}
                                error={!!errorsSubTask?.assignTo}
                                helperText={errorsSubTask?.assignTo?.message}
                            >
                                {subContractor?.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Start Date"
                                type="date"
                                disabled={submiting}
                                {...register(`startDate`, { required: "Start Date is required" })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errorsSubTask?.startDate}
                                helperText={errorsSubTask?.startDate?.message}
                                InputProps={{
                                    inputProps: {
                                        min: data?.startDate ? new Date(data?.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Disable dates before the selected start date
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="End Date"
                                type="date"
                                disabled={submiting}
                                {...register(`endDate`, {
                                    required: "End Date is required",
                                })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                error={!!errorsSubTask?.endDate}
                                helperText={errorsSubTask?.endDate?.message}
                                InputProps={{
                                    inputProps: {
                                        min: data?.startDate ? new Date(data?.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Disable dates before the selected start date
                                        max: data?.endDate ? new Date(data?.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller
                                name={`addCost`}
                                disabled={submiting}
                                control={controlSubTask}
                                render={({ field }) => (
                                    <TextField
                                        label="Add Cost"
                                        type="number"
                                        {...field}
                                        fullWidth
                                        error={!!errorsSubTask?.addCost}
                                        helperText={errorsSubTask?.addCost?.message}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Controller
                                name={`vat`}
                                control={controlSubTask}
                                disabled={submiting}
                                render={({ field }) => (
                                    <TextField
                                        label="VAT"
                                        type="number"
                                        {...field}
                                        fullWidth
                                        error={!!errorsSubTask?.vat}
                                        helperText={errorsSubTask?.vat?.message}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' disabled={submiting} color='error' onClick={() => {
                        setSubTaskValue('subTaskId', "")
                        setSubTaskValue('addCost', 0)
                        setSubTaskValue('vat', 0)
                        setSubTaskValue('assignTo', "")
                        setSubTaskValue('description', "")
                        setSubTaskValue('endDate', "")
                        setSubTaskValue('startDate', "")
                        setSubTaskValue('subTaskName', "")
                        setopenSubTask(false)
                    }}>Close</Button>
                    <Button variant='contained' disabled={submiting} color='primary' type='submit'>
                        {submiting ? <CircularProgress /> : "Add SubTask"}
                    </Button>
                </DialogActions>

            </Dialog>
            <Dialog
                open={openEditMarkup}
                onClose={() => {
                    setOpenEditMarkup(false)
                }}
            >
                <DialogContent>
                    <Typography variant='body1' >Edit Markup Percentage</Typography>
                    <TextField type='number' disabled={submiting} value={markup} onChange={(e) => setMarkup(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' disabled={submiting} color='error' onClick={() => { setMaterialDialoge(false) }}>Close</Button>
                    <Button variant='contained' color='primary' disabled={submiting} onClick={() => saveAndGenerateQoutation()}>{submiting ? <CircularProgress /> : "Add Material/Cost"}</Button>
                </DialogActions>

            </Dialog>
            <Dialog
                open={openUplaod}
                onClose={() => {
                    setOpenUpload(false)
                }}
            >
                <DialogContent>
                    <Typography variant='body1' >Edit Markup Percentage</Typography>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="upload-files"
                    />
                    {!files && <label htmlFor="upload-files">
                        <IconButton color="primary" aria-label="upload document" component="span">
                            <CloudUploadIcon />
                        </IconButton>
                    </label>}
                    <TextField disabled={submiting} value={inputName} onChange={(e) => setInputName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' disabled={submiting} color='error' onClick={() => { setOpenUpload(false) }}>Close</Button>
                    <Button variant='contained' color='primary' disabled={submiting} onClick={() => handleUpload()}>{submiting ? <CircularProgress /> : "upload"}</Button>
                </DialogActions>

            </Dialog>
        </main>
    )
}

export default Projects
