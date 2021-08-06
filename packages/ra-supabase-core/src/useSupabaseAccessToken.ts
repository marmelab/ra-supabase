import { useRedirect } from 'ra-core';
import { useEffect } from 'react';

/**
 * This hook gets the access_token from supabase in the current browser URL and redirects to the specified page (/ by default) if there is none.
 * To be used in pages such as those which set the password after a reset or an invitation.
 **/
export const useSupabaseAccessToken = ({
    redirectTo = '/',
    parameterName = 'access_token',
}: UseSupabaseAccessTokenOptions = {}) => {
    const redirect = useRedirect();

    const urlSearchParams = new URLSearchParams(
        window.location.search.substr(1)
    );

    const access_token = urlSearchParams.get(parameterName);
    useEffect(() => {
        if (access_token == null) {
            if (redirectTo !== false) {
                redirect(redirectTo);
            }
        }
    });

    return access_token;
};

export type UseSupabaseAccessTokenOptions = {
    redirectTo?: string | false;
    parameterName?: string;
};
