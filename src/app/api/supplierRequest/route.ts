import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium'
import puppeteerCore from "puppeteer-core";

import { z } from 'zod';

const itemSchema = z.array(z.object({
    no: z.string(),
    description: z.string(),
    qty: z.string(),
    price: z.string(),
}))

const schema = z.object({
    projectId:z.string(),
    workOrder: z.string(),
    workOrderDate: z.string(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    // subtotal: z.string(),
    // vat: z.string(),
    // total: z.string(),
    data: itemSchema
})
async function getBrowser() {
    if (process.env.VERCEL_ENV === "production") {
      const executablePath = await chromium.executablePath();
  
      const browser = await puppeteerCore.launch({
        args:  [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
          ],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
      return browser;
    } else {
      const browser = await puppeteer.launch();
      return browser;
    }
  }
  


export async function POST(request: NextRequest,) {
    const _d = await request.json()
    const body = await schema.parse(_d)
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Dynamic HTML content to include your invoice details, records, and layout
    const content =`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supplier Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh; /* Ensure body takes full height */
        }
        .container {
            width: 800px;
            margin: 20px auto;
            padding: 30px;
            background-color: #fff;
            flex: 1; /* Allow container to grow */
            position: relative; /* Required for absolute positioning of footer */
            padding-bottom: 80px; /* Space for the footer */
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        .header img {
            width: 120px; /* Adjusted to reduce size */
            margin-right: 20px; /* Increased gap between image and text */
        }
        .company-text {
            margin-left: 20px;
            line-height: 1.3; /* Adjusted line height for better spacing */
            font-size: 14px;
            color: #555; /* Color adjusted to a darker grey */
        }
        .company-text h2 {
            font-size: 16px; /* Smaller font for text */
            font-weight: normal;
            color: #003366; /* Darker blue color */
            margin: 0;
        }
        .company-text p {
            font-size: 12px; /* Smaller subtext font */
            color: #888; /* Lighter color */
            margin: 0;
        }

        .invoice-title {
            text-align: right;
            font-size: 24px;
            color: #003366;
            font-weight: bold;
        }
        .invoice-title p {
            margin: 2px 0;
        }
        .client-details {
            margin: 20px 0;
        }
        .client-details h3 {
            font-size: 18px;
            margin-bottom: 10px;
        }
        .client-details p {
            margin: 5px 0;
        }
        .invoice-details {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .invoice-details th, .invoice-details td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
        }
        .invoice-details th {
            background-color: #003366;
            color: #fff;
        }
        .invoice-details td {
            text-align: right;
        }
        .invoice-details td:first-child,
        .invoice-details th:first-child {
            text-align: left;
        }
        .totals {
            text-align: right;
            margin-top: 20px;
            font-size: 18px;
        }
        .totals div {
            margin-bottom: 8px;
        }
        .grand-total {
            background-color: #003366;
            color: #fff;
            font-size: 18px;
            padding: 10px;
        }
        .project-details, .payment-details {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }
        .project-details th, .payment-details th {
            background-color: #003366;
            color: #fff;
            padding: 10px;
        }
        .project-details td, .payment-details td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        .terms {
            margin-top: 20px;
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            position: absolute; /* Positioning the footer */
            bottom: 0; /* Aligning it to the bottom */
            left: 0;
            right: 0; /* Make it full width */
            padding: 20px;
            background-color: #f2f2f2;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer img {
            width: 50px;
            margin: 10px;
            vertical-align: middle;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header>
            <div class="header">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/07/logo.png" alt="Company Logo">
                <div class="company-text">
                </div>

                <div class="invoice-title">
                    <p>Supplier Request</p>
                    <p>Supplier Request no: ${body.workOrder}</p>
                    <p>${body.workOrderDate}</p>
                </div>
            </div>
        </header>

        <!-- Client Information -->
        <div class="client-details">
            <h3>Quotation to:</h3>
            <p>${body.name}</p>
            <p>${body.phone}</p>
            <p>${body.email}</p>
            <p>${body.location}</p>
        </div>

        <!-- Invoice Details Table -->
        <table class="invoice-details">
            <tr>
                <th>Sr No.</th>
                <th>DESCRIPTION</th>
                <th>Quantity</th>
                <th>Unit</th>
            </tr>
            ${generateRows(body.data)}
        </table>

        <!-- Footer Section -->
        <footer>
            <div class="footer">
                <p>Thank you for business with us!</p>
                <p>www.mkcontracts.com | +44 (0) 208 518 2100 | 50 Buntingbridge, Newbury Park, Essex, IG2 7LR</p>
                <!-- Placeholder Images for Footer Logos -->
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2022/09/download-3.png" alt="Logo 1">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/08/Gold_CMYK.jpg" alt="Logo 2">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/08/Enviromnetal-Agency-Logo.png" alt="Logo 3">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/08/CHAS-GOLD-SIGN.png" alt="Logo 4">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/08/safetcontractor-banner.jpg" alt="Logo 5">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2024/09/alcumus-removebg-preview.jpg" alt="Logo 6">
                <img src="https://mkcontractltd.tekscrum.com/wp-content/uploads/2022/09/construction-line-social-value-accredited-logo-e1668081874697.png" alt="Logo 7">
            </div>
        </footer>
    </div>
</body>
</html>`;

    await page.setContent(content);
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true, // Ensure background colors and images are included
    });

    await browser.close();

    return new Response(pdf, {
        headers: {
            'Content-Type': 'application/pdf',
        },
    });
}

function generateRows(items: {

    no: string,
    description: string,
    qty:string,
    price: string,
}[]) {
    // const items = [
    //     { description: 'Item 1', qty: 1, price: 100, total: 100 },
    //     { description: 'Item 2', qty: 2, price: 200, total: 400 },
    //     // Add more items here, and handle splitting after every 5 rows
    // ];

    let rows = '';
    items.forEach((item, index) => {
        rows += `
    <tr>
      <td>${index + 1}</td>
      <td>${item.description}</td>
      <td>${item.qty}</td>
      <td>${item.price}</td>
    </tr>`;
        if ((index + 1) % 5 === 0) {
            rows += `</tbody></table><div class="page-break"></div><table><tbody>`; // Break after 5 rows
        }
    });
    return rows;
}