import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { CoreAdminContext } from 'ra-core';
import {
    useSupabaseAccessToken,
    UseSupabaseAccessTokenOptions,
} from './useSupabaseAccessToken';

// TODO: fix those tests
describe.skip('useSupabaseAccessToken', () => {
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
        const history = createMemoryHistory({
            initialEntries: ['/set-password'],
        });

        const { queryByText } = render(
            <CoreAdminContext history={history}>
                <UseSupabaseAccessToken />
            </CoreAdminContext>
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
        const history = createMemoryHistory({
            initialEntries: ['/set-password'],
        });

        const { queryByText } = render(
            <CoreAdminContext history={history}>
                <UseSupabaseAccessToken parameterName="my_token" />
            </CoreAdminContext>
        );

        await waitFor(() => {
            expect(queryByText('bazinga')).not.toBeNull();
        });
    });

    test('should redirect users if the access token is not present in the URL', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');
        const history = createMemoryHistory({
            initialEntries: ['/set-password'],
        });

        render(
            <CoreAdminContext history={history}>
                <UseSupabaseAccessToken />
            </CoreAdminContext>
        );

        await waitFor(() => {
            expect(history.location.pathname).toEqual('/');
        });
    });

    test('should redirect users to the provided path if the access token is not present in the URL', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');
        const history = createMemoryHistory({
            initialEntries: ['/set-password'],
        });

        render(
            <CoreAdminContext history={history}>
                <UseSupabaseAccessToken redirectTo="/login" />
            </CoreAdminContext>
        );

        await waitFor(() => {
            expect(history.location.pathname).toEqual('/login');
        });
    });

    test('should not redirect users if the access token is not present in the URL and redirectTo is false', async () => {
        window.history.pushState({}, 'React Admin', '/set-password');
        const history = createMemoryHistory({
            initialEntries: ['/set-password'],
        });

        render(
            <CoreAdminContext history={history}>
                <UseSupabaseAccessToken redirectTo={false} />
            </CoreAdminContext>
        );

        await waitFor(() => {
            expect(history.location.pathname).toEqual('/set-password');
        });
    });
});
