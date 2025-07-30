import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useRedirect, useTranslate } from 'ra-core';
import { useMFAEnroll } from 'ra-supabase-core';
import * as React from 'react';
import { useEffect, useState } from 'react';

export const MFAEnrollForm = () => {
    const [qr, setQR] = useState('');
    const translate = useTranslate();
    const redirect = useRedirect();
    const [mutate, mutation] = useMFAEnroll({
        onSuccess: data => {
            setQR(data.totp.qr_code);
        },
    });
    const { isPending, error } = mutation;

    useEffect(() => {
        mutate();
    }, [mutate]);

    return (
        <>
            <CardContent>
                <Stack sx={{ alignItems: 'center', width: '100%' }}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        {translate('ra-supabase.mfa.totp.enroll-header', {
                            _: 'Enable Multi-Factor Authentication (TOTP)',
                        })}
                    </Typography>

                    {error ? (
                        <Typography sx={{ color: 'error.main' }}>
                            {typeof error === 'string'
                                ? error
                                : error && error.message
                                ? error.message
                                : 'An error occured'}
                        </Typography>
                    ) : isPending ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography>
                                {translate(
                                    'ra-supabase.mfa.totp.enroll-instructions',
                                    {
                                        _: 'Use an Authenticator app (such as Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) to scan the QR code below and click Next.',
                                    }
                                )}
                            </Typography>

                            {qr ? <img src={qr} alt="TOTP QR Code" /> : null}
                        </>
                    )}
                </Stack>
            </CardContent>
            {error || isPending ? null : (
                <CardActions>
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
                        type="submit"
                        onClick={() => {
                            redirect('/mfa-challenge');
                        }}
                    >
                        {translate('ra-supabase.action.next', {
                            _: 'Next',
                        })}
                    </Button>
                </CardActions>
            )}
        </>
    );
};
