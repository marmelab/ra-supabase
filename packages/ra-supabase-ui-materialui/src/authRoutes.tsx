import * as React from 'react';
import { RouteWithoutLayout } from 'ra-core';
import { SetPasswordPage } from './SetPasswordPage';

export const authRoutes = [
    <RouteWithoutLayout
        noLayout
        path="/set-password"
        render={() => <SetPasswordPage />}
    />,
];
