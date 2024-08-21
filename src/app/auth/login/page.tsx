import { Suspense } from 'react';
import Form from './form'

const LoginPage = () => {
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Form/>
        </Suspense>
    );
}

export default LoginPage;