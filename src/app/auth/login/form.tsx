'use client'
import { Box, Container, TextField, Button, CircularProgress } from '@mui/material'
import background from '@/assets/background.png'
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
});
type FormData = z.infer<typeof schema>;

const LoginPage = () => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false)
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
    const onSubmit: SubmitHandler<FormData> =async data => {
        setLoading(true)
        console.log(data);
        // Handle login logic here
        await signIn('credentials', {
            ...data,
            callbackUrl
        })
        setLoading(false)
    };
    useMemo(() => {
        if (error !== "") {
            toast.error(error)
            setTimeout(() => {
                setError("");
            }, 1000);
        }
    }, [error]);
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
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                        </form>
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