import { useCheckAuth } from 'ra-core';
import { useEffect } from 'react';
import { useHistory } from 'react-router';

/**
 * This hook redirect the user to the provided path (/ by default) if they are authenticated.
 **/
export const useRedirectIfAuthenticated = (redirectTo = '/') => {
    const history = useHistory();
    const checkAuth = useCheckAuth();

    useEffect(() => {
        checkAuth({}, false)
            .then(() => {
                // already authenticated, redirect to the home page
                history.push('/');
            })
            .catch(() => {
                // not authenticated, stay on the login page
            });
    }, [checkAuth, history]);
};
