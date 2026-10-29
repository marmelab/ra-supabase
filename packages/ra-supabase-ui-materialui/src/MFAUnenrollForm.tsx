import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useNotify, useRedirect, useTranslate } from 'ra-core';
import { useMFAListFactors, useMFAUnenroll } from 'ra-supabase-core';
import * as React from 'react';

export const MFAUnenrollForm = () => {
    const translate = useTranslate();
    const redirect = useRedirect();
    const notify = useNotify();
    const {
        data: factors,
        isPending: isLoadingFactors,
        error: factorsError,
    } = useMFAListFactors();
    const [mutate, mutation] = useMFAUnenroll({
        onSuccess: data => {
            notify(
                translate('ra-supabase.mfa.totp.unenroll_success', {
                    _: 'Successfully unenrolled from TOTP MFA',
                }),
                { type: 'success' }
            );
            redirect('/');
        },
    });
    const isLoading = mutation.isPending || isLoadingFactors;

    const submit = async () => {
        if (factorsError) {
            notify(factorsError.message, { type: 'error' });
            return;
        }
        const totpFactor = factors?.totp?.[0]; // TODO handle multiple factors
        if (!totpFactor) {
            notify('ra-supabase.mfa.totp.no_factor_error', {
                type: 'error',
                messageArgs: { _: 'No TOTP factors found!' },
            });
            return;
        }
        const factorId = totpFactor.id;
        mutate({
            factorId,
        });
    };

    return (
        <>
            <CardContent
                sx={theme => ({ maxWidth: theme.breakpoints.values.sm })}
            >
                <Stack sx={{ alignItems: 'center', width: '100%' }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        {translate('ra-supabase.mfa.totp.unenroll_header', {
                            _: 'Unenroll from Multi-Factor Authentication (TOTP)',
                        })}
                    </Typography>

                    <Typography
                        sx={{
                            my: 2,
                        }}
                    >
                        {translate(
                            'ra-supabase.mfa.totp.unenroll_instructions',
                            {
                                _: 'Click the button below to unenroll from TOTP MFA. Be warned that you may lose access to some or all features of this application if you do not have another MFA method set up. You can always enroll again later.',
                            }
                        )}
                    </Typography>
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'end' }}>
                <Button
                    variant="outlined"
                    type="button"
                    onClick={() => {
                        redirect('/');
                    }}
                >
                    {translate('ra.action.cancel', {
                        _: 'Cancel',
                    })}
                </Button>
                <Button
                    variant="contained"
                    type="button"
                    onClick={() => {
                        submit();
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : null}
                    {translate('ra-supabase.action.unenroll', {
                        _: 'Unenroll',
                    })}
                </Button>
            </CardActions>
        </>
    );
};
