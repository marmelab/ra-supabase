import * as React from 'react';
import type { ReactNode } from 'react';

import { AuthLayout } from './AuthLayout';
import { MFAChallengeForm } from './MFAChallengeForm';

export const MFAChallengePage = (props: MFAChallengePageProps) => {
    const { children = <MFAChallengeForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

MFAChallengePage.path = '/mfa-challenge';

export type MFAChallengePageProps = {
    children?: ReactNode;
};
