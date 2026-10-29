import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter, useNotify } from 'ra-core';
import { Notification } from 'ra-ui-materialui';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

const NotifyOnMount = () => {
    const notify = useNotify();
    React.useEffect(() => {
        notify('Hello');
    }, [notify]);
    return null;
};

describe('AuthLayout', () => {
    it('should not display notifications twice', async () => {
        render(
            <TestMemoryRouter>
                <CoreAdminContext>
                    <AuthLayout>
                        <NotifyOnMount />
                    </AuthLayout>
                    {/* Rendered by react-admin's AdminUI */}
                    <Notification />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        expect(await screen.findAllByText('Hello')).toHaveLength(1);
    });
});
