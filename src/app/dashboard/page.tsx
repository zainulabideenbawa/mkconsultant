'use client'
import { CustomCard } from "@/components/card";
import DashboardTable from "@/components/table/dashboradTable";
import { Button, Container, Divider, Grid, Typography, Box, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { faker } from '@faker-js/faker';

import Image from "next/image";
import { useState, useEffect } from "react";
import { Client, Invoice, QuotationData, User, UserFor2FA } from "@/types";
import jsPDF from "jspdf";
import MainLogo from '@/assets/auth_logo.png'
import Logo01 from '@/assets/logos-01.png'
import Logo02 from '@/assets/logos-02.png'
import Logo03 from '@/assets/logos-03.png'
import Logo04 from '@/assets/logos-04.png'
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

interface RectInvoice extends Invoice {

}
interface userObject {

  name: string;
  email: string;
  id: string;
  role: string;
  twoFactorRequired: boolean;
  twoFactorSecret: string | null;

}

export default function Home() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [userverify, setUserVerify] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [qrloading, setQrloading] = useState(true)
  const [secret, setSecret] = useState('')
  const [showPopup, setPopUp] = useState(false)
  const router = useRouter();
  const [code, setCode] = useState<string>(''); // Input field for user to enter TOTP code
  const [verificationResult, setVerificationResult] = useState<string | null>(null); // Show verification result
const [email,setEmail] = useState("")
  const [cardData, setCardData] = useState([
    {
      title: "Completed Projects",
      number: "0",
    },
    {
      title: "Clients",
      number: "0",
    },
    {
      title: "Earnings",
      number: "£ 0",
    },
    {
      title: "Revenue",
      number: "£ 0",
    },

  ])
  const [recentClient, setRecetClient] = useState<{ name: string, projectId: string, id: string }[]>([
  ])
  const [recetInvoices, setRecentInvoice] = useState<Invoice[]>([])
  const [projects, setProjects] = useState<{
    id: string,
    clientName: string,
    date: string,
    project: string,
    quote: string,
    status: string

  }[]>([])
  useEffect(() => {
    if (session) {
      let s = session.user as unknown as userObject
      if (session.user?.email) {

        verifyUser(session.user?.email)
        setEmail(session.user?.email)
      } else {
        router.push('/auth/login')
      }
    }
  }, [session])
  const footerLogos = [
    Logo01.src,
    Logo02.src,
    Logo03.src,
    Logo04.src,

  ]
  useEffect(() => {
    if (userverify) getData()
  }, [userverify])

  async function getData() {
    const res = await fetch('/api/dashboard', { cache: 'no-store' })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {

      throw new Error('Failed to fetch data')
    }

    let body: { status: boolean, total: number, earning: number, invoice: Invoice[], project: QuotationData[], client: Client[] } = await res.json()
    console.log(body, "body")
    setCardData([
      {
        title: "Completed Projects",
        number: String(body.project.filter(f => f.status === 'COMPLETED').length),
      },
      {
        title: "Clients",
        number: String(body.client.length),
      },
      {
        title: "Earnings",
        number: `£ {Number(body.earning).toFixed(0)}`,
      },
      {
        title: "Revenue",
        number: `£ ${body.total}`,
      },

    ])
    setRecetClient(
      body.client.map(c => ({
        name: c.name,
        projectId: c.project.length > 0 ? String(c.project[0].projectId).padStart(6, "0") : "",
        id: c.id
      })))
    setRecentInvoice(body.invoice)
    setProjects(body.project.map(m => ({
      id: m.id,
      clientName: m.client.name,
      date: `${new Date(m.startDate).toLocaleDateString()}`,
      project: 'Call',
      quote: `£ ${m.totalAmount}`,
      status: m.status
    })))
    setLoading(false)
  }
  async function verifyUser(email: string) {
    const res = await fetch('/api/getuserdata/' + email, { cache: 'no-store' })
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {

      throw new Error('Failed to fetch data')
    }
    let body: { status: boolean, getData: UserFor2FA } = await res.json()
    if (body.status) {
      if (body.getData.twoFactorEnabled) {
        setUserVerify(true)
      } else {
        setPopUp(true)
        const secretSpeakeasy = speakeasy.generateSecret({
          name: 'mkconsultant', // Replace with your app name
          issuer: 'mkconsultant', // Replace with your app name
        });
        setSecret(secretSpeakeasy.base32)
        // Convert the secret to a QR code URL
        const url = secretSpeakeasy.otpauth_url; // otpauth URL for QR code
        console.log(url)
        if (!url) return
        // Use 'qrcode' to generate the QR code from the otpauth URL
        QRCode.toDataURL(url, (err, imageUrl) => {
          if (err) {
            console.error('Error generating QR code:', err);

          } else {
            setQrCode(imageUrl); // Set the generated QR code image URL
          }
          setQrloading(false);
        })
      }
    } else {
      router.push('/auth/login')
    }
  }
  const generatePDF = async (data: Invoice) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const headerHeight = 50;
    const footerHeight = 50;
    const contentHeight = pageHeight - headerHeight - footerHeight - 2 * margin;
    const _c = data.client
    const _p = data.project
    if (!_c && _p) return null
    const header = () => {
      if (!_c && _p) return null
      doc.addImage(MainLogo.src, 'PNG', margin, margin, 100, 20);
      doc.setFontSize(18);
      doc.setFillColor('blue');
      doc.text('INVOICE', pageWidth / 2, margin + 10, { align: 'center' });

      doc.setFontSize(12);
      doc.setFillColor('black');

      doc.text(_c?.name || "", margin, margin + 40);
      doc.text(_c?.phone || "", margin, margin + 48);
      doc.text(_c?.email || "", margin, margin + 56);
      doc.text(_c?.location || "", margin, margin + 64);

      doc.text(`Invoice no: ${String(data.InvoiceId).padStart(6, "0")}`, pageWidth - margin - 60, margin + 30);
      doc.text(`Invoice Date:${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 35);
      doc.text(`Invoice Due Date:${new Date(data.dueDate).toLocaleDateString()}`, pageWidth - margin - 60, margin + 40);
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
        description: `Project ID - ${String(_p?.projectId).padStart(6, '0')}, ${_p?.name}`,
        price: `£ ${Number(data.Amount).toLocaleString()}`
      })
      footer(page);
    };

    const addProjectDetailsAndPaymentMethod = () => {
      const startY = margin + headerHeight + 150;
      doc.setFontSize(12);
      doc.text(`Total Amount : £ ${data.Amount.toLocaleString()}`, pageWidth - margin - 60, startY + 20);
    };

    let page = 1;
    header();
    addTableContent();
    addProjectDetailsAndPaymentMethod();
    doc.save(`Inovice ${data.InvoiceId}.pdf`);
  };
  const handleSubmit = async () => {
    // Send the code and secret to the backend for verification
    try {
      const response = await fetch('/api/verify-2fa/'+email, {
        method: "POST",
        body: JSON.stringify({
          token: code,
          secret: secret,
        })
      })
      let body = await response.json()
      if (body.status) {
        setUserVerify(true)
        setPopUp(false)
      }
      // setVerificationResult(response.data.success ? '2FA setup successfully!' : 'Invalid code, try again.');
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult('Verification failed.');
    }
  };


  if (loading) {
    return (
      <main>
        <CircularProgress />
        <Dialog open={showPopup} onClose={() => { }}>
          <DialogTitle>Two-Factor Authentication Setup</DialogTitle>
          <DialogContent>
            {!qrloading ? (
              <img src={qrCode} alt="2FA QR Code" />
            ) : (
              <CircularProgress />
            )}
            <TextField
              label="Enter the 6-digit code from your authenticator app"
              variant="outlined"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* Show result of verification */}
            {verificationResult && (
              <Typography variant="body2" color={verificationResult.includes('success') ? 'green' : 'red'}>
                {verificationResult}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmit} color="primary">
              Verify Code
            </Button>

          </DialogActions>
        </Dialog>
      </main>)
  }

  return (
    <main>
      <Grid container spacing={3}>
        {cardData.map((data, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <CustomCard title={data.title} number={data.number} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={8}>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Pending Projects</Typography>
            <DashboardTable rows={projects.filter(s => s.status === "PENDING")} />
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Active Jobs</Typography>
            <DashboardTable rows={projects.filter(s => s.status === "ACTIVE")} />
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h6">Approved Project</Typography>
            <DashboardTable rows={projects.filter(s => s.status === "APPROVED")} />
          </Container>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h4">Recent Clients</Typography>
            {
              recentClient.map((client, index) => (
                <div key={index}>
                  <Typography variant="h6">{client.name}</Typography>
                  <Typography variant="body1">{client.projectId}</Typography>
                  <Divider />
                </div>
              ))
            }
          </Container>
          <Container sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, marginTop: 4, marginBottom: 4 }}>
            <Typography variant="h4">Recent Invoices</Typography>
            {
              recetInvoices.map((invoice, index) => (
                <Box key={index} sx={{ marginTop: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: 'space-between', marginBottom: 2 }}>
                    <Box>
                      <Typography variant="h6">Invoice # {invoice.InvoiceId}</Typography>
                      <Typography variant="body1">Client : {invoice.client.name}</Typography>
                    </Box>
                    <Button variant='outlined' onClick={() => generatePDF(invoice)}>View</Button>
                  </Box>
                  <Divider />
                </Box>
              ))
            }

          </Container>
        </Grid>
      </Grid>

    </main>
  );
}
