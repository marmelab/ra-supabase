import * as React from 'react';

import { useRedirectIfAuthenticated } from 'ra-supabase-core';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

export const LoginPage = ({ children = <LoginForm /> }) => {
    useRedirectIfAuthenticated();

    return <AuthLayout>{children}</AuthLayout>;
};
