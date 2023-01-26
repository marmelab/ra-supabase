import * as React from 'react';
import { ReactNode } from 'react';

import { useRedirectIfAuthenticated } from 'ra-supabase-core';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

export const LoginPage = ({ children = <LoginForm /> }: LoginPageProps) => {
    useRedirectIfAuthenticated();

    return <AuthLayout>{children}</AuthLayout>;
};

export interface LoginPageProps {
    children?: ReactNode;
}
