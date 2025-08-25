import * as React from 'react';
import type { ReactNode } from 'react';

import { AuthLayout } from './AuthLayout';
import { MFAEnrollForm } from './MFAEnrollForm';

export const MFAEnrollPage = (props: MFAEnrollPageProps) => {
    const { children = <MFAEnrollForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

MFAEnrollPage.path = '/mfa-enroll';

export type MFAEnrollPageProps = {
    children?: ReactNode;
};
