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
        isPending: isPendingFactors,
        error: errorFactors,
    } = useMFAListFactors();
    const [mutate, mutation] = useMFAUnenroll({
        onSuccess: data => {
            notify(
                translate('ra-supabase.mfa.totp.unenroll-success', {
                    _: 'Successfully unenrolled from TOTP MFA',
                }),
                { type: 'success' }
            );
            redirect('/');
        },
    });
    const { isPending, error } = mutation;

    const submit = () => {
        const totpFactor = factors?.all?.filter(
            f => f.factor_type === 'totp'
        )[0]; // TODO handle multiple factors
        if (!totpFactor) {
            throw new Error(
                translate('ra-supabase.mfa.totp.no-factor-error', {
                    _: 'No TOTP factors found!',
                })
            );
        }
        const factorId = totpFactor.id;
        mutate({
            factorId,
        });
    };

    if (isPendingFactors) {
        return <CircularProgress />;
    }

    if (errorFactors) {
        return (
            <Typography sx={{ color: 'error.main' }}>
                {typeof errorFactors === 'string'
                    ? errorFactors
                    : errorFactors && errorFactors.message
                    ? errorFactors.message
                    : 'An error occurred'}
            </Typography>
        );
    }

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
                        {translate('ra-supabase.mfa.totp.unenroll-header', {
                            _: 'Unenroll from Multi-Factor Authentication (TOTP)',
                        })}
                    </Typography>

                    <Typography
                        sx={{
                            my: 2,
                        }}
                    >
                        {translate(
                            'ra-supabase.mfa.totp.unenroll-instructions',
                            {
                                _: 'Click the button below to unenroll from TOTP MFA. Be warned that you may lose access to some or all features of this application if you do not have another MFA method set up. You can always enroll again later.',
                            }
                        )}
                    </Typography>

                    {error ? (
                        <Typography sx={{ color: 'error.main' }}>
                            {typeof error === 'string'
                                ? error
                                : error && error.message
                                ? error.message
                                : 'An error occured'}
                        </Typography>
                    ) : null}
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
                    disabled={isPending}
                >
                    {isPending ? <CircularProgress size={24} /> : null}
                    {translate('ra-supabase.action.unenroll', {
                        _: 'Unenroll',
                    })}
                </Button>
            </CardActions>
        </>
    );
};
