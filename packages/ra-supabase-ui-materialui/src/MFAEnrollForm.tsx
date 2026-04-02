import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useLogout, useNotify, useRedirect, useTranslate } from 'ra-core';
import { useMFAEnroll, useMFAUnenroll } from 'ra-supabase-core';
import * as React from 'react';
import { useEffect, useState } from 'react';

export const MFAEnrollForm = () => {
    const [qr, setQR] = useState('');
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState<string | null>(null);
    const translate = useTranslate();
    const redirect = useRedirect();
    const notify = useNotify();
    const logout = useLogout();
    const [, { mutateAsync: unenroll }] = useMFAUnenroll();
    const [mutate, mutation] = useMFAEnroll({
        onSuccess: data => {
            setFactorId(data.id);
            setQR(data.totp.qr_code);
            setSecret(data.totp.secret);
        },
    });
    const { isPending, error } = mutation;

    useEffect(() => {
        mutate();
    }, [mutate]);

    const handleCancel = async () => {
        if (factorId) {
            await unenroll({ factorId });
        }
        logout();
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
                                : 'An error occurred'}
                        </Typography>
                    ) : isPending ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography
                                sx={{
                                    my: 2,
                                }}
                            >
                                {translate(
                                    'ra-supabase.mfa.totp.enroll-instructions',
                                    {
                                        _: 'Use an Authenticator app (such as Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) to scan the QR code below and click Next.',
                                    }
                                )}
                            </Typography>

                            {qr ? <img src={qr} alt="TOTP QR Code" /> : null}
                            {secret ? (
                                <Button
                                    onClick={() =>
                                        navigator.clipboard
                                            .writeText(secret)
                                            .then(() =>
                                                notify(
                                                    'ra-supabase.mfa.totp.secret-copied',
                                                    {
                                                        type: 'info',
                                                        messageArgs: {
                                                            _: 'Secret key copied to clipboard',
                                                        },
                                                    }
                                                )
                                            )
                                    }
                                    variant="text"
                                >
                                    {translate(
                                        'ra-supabase.mfa.totp.copy-secret-key-to-clipboard',
                                        {
                                            _: 'Copy secret key to clipboard',
                                        }
                                    )}
                                </Button>
                            ) : null}
                        </>
                    )}
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'end' }}>
                <Button variant="outlined" type="button" onClick={handleCancel}>
                    {translate('ra.action.cancel', {
                        _: 'Cancel',
                    })}
                </Button>
                {error || isPending ? null : (
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={() => redirect('/mfa-challenge')}
                    >
                        {translate('ra-supabase.action.next', {
                            _: 'Next',
                        })}
                    </Button>
                )}
            </CardActions>
        </>
    );
};
