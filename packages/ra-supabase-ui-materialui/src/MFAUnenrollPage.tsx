import * as React from 'react';
import type { ReactNode } from 'react';

import { AuthLayout } from './AuthLayout';
import { MFAUnenrollForm } from './MFAUnenrollForm';

export const MFAUnenrollPage = (props: MFAUnenrollPageProps) => {
    const { children = <MFAUnenrollForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

MFAUnenrollPage.path = '/mfa-unenroll';

export type MFAUnenrollPageProps = {
    children?: ReactNode;
};
