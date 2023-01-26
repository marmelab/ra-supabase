import { useCheckAuth } from 'ra-core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * This hook redirect the user to the provided path (/ by default) if they are authenticated.
 *
 * @example
 * import { useRedirectIfAuthenticated } from 'react-admin';
 * const MyLoginPage = () => {
 *     useRedirectIfAuthenticated();
 *     // UI and logic for authentication
 * }
 **/
export const useRedirectIfAuthenticated = (
    redirectTo: UseRedirectIfAuthenticatedOptions = '/'
) => {
    const navigate = useNavigate();
    const checkAuth = useCheckAuth();

    useEffect(() => {
        checkAuth({}, false, undefined, true)
            .then(() => {
                // already authenticated, redirect to the home page
                navigate(redirectTo);
            })
            .catch(() => {
                // not authenticated, stay on the login page
            });
    }, [redirectTo]);
};

export type UseRedirectIfAuthenticatedOptions = string;
