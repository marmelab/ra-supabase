import * as React from 'react';
import { ReactNode } from 'react';
import { AuthLayout } from './AuthLayout';
import { SetPasswordForm } from './SetPasswordForm';

export const SetPasswordPage = (props: SetPasswordPageProps) => {
    const { children = <SetPasswordForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

export type SetPasswordPageProps = {
    children?: ReactNode;
};
