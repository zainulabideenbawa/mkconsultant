'use client'
import React from 'react';
import { Button, Container } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceComponent = ({ invoiceData }: { invoiceData: any }) => {
    const generatePDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const headerHeight = 50;
        const footerHeight = 50;
        const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;

        const header = () => {
            doc.addImage(invoiceData.logo, 'PNG', margin, margin, 100, 20);
            doc.setFontSize(18);
            doc.setFillColor('blue');
            doc.text('INVOICE', pageWidth / 2, margin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setFillColor('black');
            doc.text(invoiceData.client.name, margin, margin + 40);
            doc.text(invoiceData.client.phone, margin, margin + 45);
            doc.text(invoiceData.client.email, margin, margin + 50);
            doc.text(invoiceData.client.address, margin, margin + 55);

            doc.text(`Invoice no: ${invoiceData.invoiceNumber}`, pageWidth - margin - 40, margin + 30);
            doc.text(invoiceData.invoiceDate, pageWidth - margin - 40, margin + 35);
        };

        const footer = (page:any) => {
            const footerY = pageHeight - footerHeight - margin;
            doc.setFontSize(10);
            doc.text(invoiceData.companyDetails, pageWidth / 2, footerY + 35, { align: 'center' });
          
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
            const logosX = (pageWidth / 2) - (((invoiceData.footerLogos.length - 2) * (logoWidth + logoMargin)) / 2) - ((2 * (rectLogoWidth + logoMargin)) / 2);
          
            invoiceData.footerLogos.forEach((logo:any, index:any) => {
              const xPosition = index === 1 || index === 3
                  ? logosX + index * (rectLogoWidth + logoMargin)
                  : logosX + index * (logoWidth + logoMargin+10);
                  
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
                doc.text('NO', margin, currentY);
                doc.text('DESCRIPTION', margin + 20, currentY);
                doc.text('QTY', pageWidth - margin - 60, currentY);
                doc.text('PRICE', pageWidth - margin - 40, currentY);
                doc.text('TOTAL', pageWidth - margin - 20, currentY);
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
            invoiceData.items.forEach((row: any, index: any) => {
                if ((index + 1) % 10 === 0 && index !== 0) {
                    footer(page);
                    doc.addPage();
                    currentY = margin + headerHeight + 20;
                    page++;
                    header();
                    tableHeader();
                }
                tableRow(row);
            });
            footer(page);
        };

        const addProjectDetailsAndPaymentMethod = () => {
            const startY = margin + headerHeight + 150;
            doc.setFontSize(12);
            doc.text('Project Details:', margin, startY);
            doc.text(`Project ID: ${invoiceData.projectId}`, margin, startY + 10);
            doc.text(invoiceData.projectDetails, margin, startY + 20);

            doc.text('Payment Method:', pageWidth - margin - 60, startY);
            doc.text(`Bank Name: ${invoiceData.bankName}`, pageWidth - margin - 60, startY + 10);
            doc.text(`Account Number: ${invoiceData.accountNumber}`, pageWidth - margin - 60, startY + 20);
        };

        const addTermsAndConditions = () => {
            const startY = pageHeight - footerHeight - margin - 60;
            doc.setFontSize(12);
            doc.text('Terms and Conditions', margin, startY);
            doc.setFontSize(10);
            doc.text(invoiceData.termsAndConditions, margin, startY + 10, { maxWidth: pageWidth - 2 * margin });
        };

        let page = 1;
        header();
        addTableContent();
        addProjectDetailsAndPaymentMethod();
        addTermsAndConditions();
        doc.save('invoice.pdf');
    };

    return (
        <Container>
            <Button variant="contained" color="primary" onClick={generatePDF} style={{ marginTop: '20px' }}>
                Generate PDF
            </Button>
        </Container>
    );
};

export default InvoiceComponent;
