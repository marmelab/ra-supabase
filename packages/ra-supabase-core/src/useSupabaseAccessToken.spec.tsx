import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
import {
    useSupabaseAccessToken,
    UseSupabaseAccessTokenOptions,
} from './useSupabaseAccessToken';

// TODO: fix those tests
describe('useSupabaseAccessToken', () => {
    const UseSupabaseAccessToken = (props?: UseSupabaseAccessTokenOptions) => {
        const token = useSupabaseAccessToken(props);

        return <span>{token}</span>;
    };

    test('should return the access token if present in the URL', async () => {
        window.history.pushState(
            {},
            'React Admin',
            '/set-password?access_token=bazinga'
        );

        const { queryByText } = render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(queryByText('bazinga')).not.toBeNull();
        });
    });

    test('should return the access token if present in the hash route', async () => {
        window.history.pushState(
            {},
            'React Admin',
            '/set-password#access_token=bazinga'
        );

        const { queryByText } = render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(queryByText('bazinga')).not.toBeNull();
        });
    });

    test('should return the access token from the provided key if present in the URL', async () => {
        window.history.pushState(
            {},
            'React Admin',
            '/set-password?my_token=bazinga'
        );

        const { queryByText } = render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken parameterName="my_token" />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(queryByText('bazinga')).not.toBeNull();
        });
    });

    test.skip('should redirect users if the access token is not present in the URL', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');

        render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(window.location.pathname).toEqual('/');
        });
    });

    test.skip('should redirect users to the provided path if the access token is not present in the URL', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');

        render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken redirectTo="/login" />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(window.location.pathname).toEqual('/login');
        });
    });

    test.skip('should not redirect users if the access token is not present in the URL and redirectTo is false', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');

        render(
            <TestMemoryRouter initialEntries={['/set-password']}>
                <CoreAdminContext>
                    <UseSupabaseAccessToken redirectTo={false} />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        await waitFor(() => {
            expect(window.location.pathname).toEqual('/set-password');
        });
    });
});
