'use client'
import { Box, Container, TextField, Button, CircularProgress } from '@mui/material'
import background from '@/assets/background.png'
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, SignInResponse, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import speakeasy from 'speakeasy';

interface CustomSignInResponse extends SignInResponse {
    twoFactorRequired?: boolean; // Add other properties if needed
    twoFactorSecret?: string
}
interface userObject {

    name: string;
    email: string;
    id: string;
    role: string;
    twoFactorRequired: boolean;
    twoFactorSecret: string | null;

}
const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
});
type FormData = z.infer<typeof schema>;

const LoginPage = () => {
    const { data: session } = useSession()
    const [verify,setVerify] = useState(false)
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false)
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const [error, setError] = useState(
        searchParams.get("error") ? "Invalid Credentials" : ""
    );

    const callbackUrl = "/dashboard";

    const onSubmit: SubmitHandler<FormData> = async data => {
        setLoading(true)

        const res = await fetch('/api/verifySignIn', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/pdf'
            },
            body: JSON.stringify(data)
        })
        if (res.ok) {
            let body = await res.json()
            console.log(body, "body")
            if (body.twoFactorRequired) {
                setTwoFactorRequired(true);
                setTwoFactorSecret(body.twoFactorSecret || ""); // Adjust based on your setup 
                setUser(data)
            } else {

                const result = await signIn('credentials', {
                    ...data,
                    callbackUrl,
                    redirect: true
                })
                if (result?.error) {
                    setError(result.error);
                }
            }

        } else {
            setError("Email or Password Not Matched");
        }

        setLoading(false)
    };

    React.useEffect(() => {
        if (session) {
            let s = session.user as unknown as userObject
            if (s.twoFactorRequired) {
                setTwoFactorRequired(true);
                setTwoFactorSecret(s?.twoFactorSecret || ""); // Adjust based on your setup 
            } else {
                window.location.href = callbackUrl;
            }
        }
    }, [session])
    useMemo(() => {
        if (error !== "") {
            toast.error(error)
            setTimeout(() => {
                setError("");
            }, 1000);
        }
    }, [error]);

    const verifyTwoFactorToken = async (token: string, secret: string) => {
        // console.log(token,secret)
        // const isValid = speakeasy.totp.verify({
        //     secret, // User's secret
        //     encoding: 'base32',
        //     token,  // The TOTP code entered by the user
        // });

        // return { success: isValid };
        const response = await fetch('/api/verify-2fa/', {
            method: "POST",
            body: JSON.stringify({
                token,
                secret: secret,
            })
        })
        let body = await response.json()
        // return body.status
        return { success: body.status };
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundImage: `url(${background.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <Container maxWidth="sm" sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: 2,
                    }}>
                        <img src="/auth_logo.png" alt="logo" style={{ marginBottom: 16, height: 70 }} />
                        <h1 style={{ textAlign: "center" }}>Login</h1>
                    </Box>
                    <Box sx={{ paddingLeft: 5, paddingRight: 5 }}>
                        {!twoFactorRequired ? <form onSubmit={handleSubmit(onSubmit)}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : ''}
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="Password"
                                type="password"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : ''}
                                autoComplete="current-password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress /> : "Log In"}
                            </Button>
                        </form> :

                            (
                                <Box sx={{ paddingLeft: 5, paddingRight: 5 }}>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="twoFactorToken"
                                        label="2FA Token"
                                        type="text"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                        autoComplete="one-time-code"
                                    />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={verify}
                                        sx={{ mt: 3, mb: 2 }}
                                        onClick={async () => {
                                            setVerify(true)
                                            const verifyResult = await verifyTwoFactorToken(twoFactorToken, twoFactorSecret);
                                            if (verifyResult.success) {
                                                const result = await signIn('credentials', {
                                                    ...user,
                                                    callbackUrl,
                                                    redirect: true
                                                })
                                                if (result?.error) {
                                                    setError(result.error);
                                                }
                                            } else {
                                                setError("Invalid 2FA token");
                                            }
                                            setVerify(false)
                                        }}
                                    >
                                        {verify ? <CircularProgress /> : "Verify 2FA"}
                                        
                                    </Button>
                                </Box>
                            )}

                        <Box sx={{ textAlign: 'center' }}>
                            <Button href="#" variant="text">
                                Forgot password?
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Suspense>
    );
}

export default LoginPage;