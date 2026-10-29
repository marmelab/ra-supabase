import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useLogout, useNotify, useRedirect, useTranslate } from 'ra-core';
import {
    useMFAEnroll,
    useMFAListFactors,
    useMFAUnenroll,
} from 'ra-supabase-core';
import * as React from 'react';
import { useState } from 'react';

export const MFAEnrollForm = () => {
    const [qr, setQR] = useState('');
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState<string | null>(null);
    const translate = useTranslate();
    const redirect = useRedirect();
    const notify = useNotify();
    const logout = useLogout();
    const [unenroll] = useMFAUnenroll();
    const [mutate, mutation] = useMFAEnroll({
        onSuccess: data => {
            setFactorId(data.id);
            setQR(data.totp.qr_code);
            setSecret(data.totp.secret);
        },
    });
    const { isPending } = mutation;
    const { data: factors, isPending: isLoadingFactors } = useMFAListFactors();

    const handleCancel = () => {
        // Users with a verified factor are adding another one from the app:
        // send them back to it instead of logging them out
        const leave = factors?.totp?.length
            ? () => redirect('/')
            : () => logout();
        if (!factorId) {
            leave();
            return;
        }
        // Leave even if unenroll fails (useMFAUnenroll notifies the error),
        // as Cancel is the only way out of this page
        unenroll({ factorId }, { onSettled: leave });
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
                        {translate('ra-supabase.mfa.totp.enroll_header', {
                            _: 'Enable Multi-Factor Authentication (TOTP)',
                        })}
                    </Typography>

                    {isPending ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography
                                sx={{
                                    my: 2,
                                }}
                            >
                                {translate(
                                    'ra-supabase.mfa.totp.enroll_instructions',
                                    {
                                        _: 'Use an Authenticator app (such as Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) to scan the QR code below and click Next.',
                                    }
                                )}
                            </Typography>

                            {qr ? (
                                <img
                                    src={qr}
                                    alt={translate(
                                        'ra-supabase.mfa.totp.qr_code_alt',
                                        { _: 'TOTP QR Code' }
                                    )}
                                />
                            ) : null}
                            {secret ? (
                                <Button
                                    onClick={() =>
                                        navigator.clipboard
                                            .writeText(secret)
                                            .then(() =>
                                                notify(
                                                    'ra-supabase.mfa.totp.secret_copied',
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
                                        'ra-supabase.mfa.totp.copy_secret_key_to_clipboard',
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
                <Button
                    variant="outlined"
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoadingFactors}
                >
                    {translate('ra.action.cancel', {
                        _: 'Cancel',
                    })}
                </Button>
                {factorId ? (
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={() =>
                            redirect(
                                '/mfa-challenge',
                                undefined,
                                undefined,
                                undefined,
                                { factorId }
                            )
                        }
                    >
                        {translate('ra-supabase.action.next', {
                            _: 'Next',
                        })}
                    </Button>
                ) : !isPending ? (
                    <Button variant="contained" onClick={() => mutate()}>
                        {translate('ra-supabase.mfa.totp.enroll_start', {
                            _: 'Set up',
                        })}
                    </Button>
                ) : null}
            </CardActions>
        </>
    );
};
