import * as React from 'react';

import { LoginComponent } from 'ra-core';
import { useRedirectIfAuthenticated } from 'ra-supabase-core';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

export const LoginPage: LoginComponent = ({ children = <LoginForm /> }) => {
    useRedirectIfAuthenticated();

    return <AuthLayout>{children}</AuthLayout>;
};
