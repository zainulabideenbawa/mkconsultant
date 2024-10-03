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
  const [submitting,setSubmitting] = useState(false)
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
        number: `£ ${Number(body.earning).toFixed(0)}`,
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
    setSubmitting(true)
    const _c = data.client
    const _p = data.Project
    if (!_c && _p) return null
    console.log(_p,_c,data)
    try {
        const res = await fetch('/api/generateInovice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/pdf'
            },
            body: JSON.stringify({
                invoiceNumber: String(data.InvoiceId).padStart(6, "0"),
                invoiceDate: new Date().toLocaleDateString(),
                invoiceDueDate: new Date(data.dueDate).toLocaleDateString(),
                name: _c?.name || "",
                phone: _c?.phone || "",
                email: _c?.email || "",
                location: _c?.location || "",
                total: `${data.Amount.toLocaleString()}`,
                data: [{
                    no: 1,
                    description: `Project ID - ${String(_p?.projectId).padStart(6, '0')}, ${_p?.name}`,
                    price: `£ ${Number(data.Amount).toLocaleString()}`
                }]
            })
        });

        if (res.ok) {
            const blob = await res.blob();  // Convert the response to a Blob (binary data)
            const url = window.URL.createObjectURL(blob);  // Create a temporary URL for the Blob

            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Inovice ${data.InvoiceId}.pdf`);  // Set the file name for the download
            document.body.appendChild(link);  // Append the link to the document
            link.click();  // Programmatically click the link to trigger the download
            if (link?.parentNode)
                // Clean up
                link?.parentNode.removeChild(link);  // Remove the link element from the document
            window.URL.revokeObjectURL(url);  // Release the Blob URL to free up memory
        } else {
            console.error('Failed to download PDF:', res.statusText);
        }
    } catch (error) {
        console.error('Error while fetching the PDF:', error);
    }
    setSubmitting(false)

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
                    <Button disabled={submitting} variant='outlined' onClick={() => generatePDF(invoice)}>{submitting?<CircularProgress/>:"View"}</Button>
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
