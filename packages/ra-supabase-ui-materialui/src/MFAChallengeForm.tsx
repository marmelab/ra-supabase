import {
    Box,
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Typography,
    styled,
} from '@mui/material';
import { Form, required, useRedirect, useTranslate } from 'ra-core';
import { useMFAChallengeAndVerify, useMFAListFactors } from 'ra-supabase-core';
import { TextInput } from 'ra-ui-materialui';
import * as React from 'react';

export const MFAChallengeForm = () => {
    const translate = useTranslate();
    const redirect = useRedirect();
    const {
        data: factors,
        isPending: isPendingFactors,
        error: errorFactors,
    } = useMFAListFactors();
    const [mutate, mutation] = useMFAChallengeAndVerify({
        onSuccess: () => {
            redirect('/');
        },
    });
    const { isPending, error } = mutation;

    const submit = (values: FormData) => {
        const totpFactor = factors?.totp[0]; // TODO handle multiple factors
        if (!totpFactor) {
            throw new Error(
                translate('ra-supabase.mfa.totp.no-factor-error', {
                    _: 'No TOTP factors found!',
                })
            );
        }
        const factorId = totpFactor.id;
        mutate({
            code: values.code,
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
                <Root onSubmit={submit}>
                    <div className={SupabaseMFAChallengeFormClasses.container}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                textAlign: 'center',
                            }}
                        >
                            {translate(
                                'ra-supabase.mfa.totp.challenge-header',
                                {
                                    _: 'Enter your TOTP code',
                                }
                            )}
                        </Typography>

                        <Typography
                            sx={{
                                my: 4,
                            }}
                        >
                            {translate(
                                'ra-supabase.mfa.totp.challenge-instructions',
                                {
                                    _: 'Enter the TOTP code from your Authenticator app to verify your identity.',
                                }
                            )}
                        </Typography>

                        <Box
                            className={SupabaseMFAChallengeFormClasses.input}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <TextInput
                                source="code"
                                label={translate('ra-supabase.mfa.totp.code', {
                                    _: 'Code',
                                })}
                                autoComplete="one-time-code"
                                validate={required()}
                                sx={{
                                    width: 240,
                                    '& input': {
                                        fontSize: '2rem',
                                        letterSpacing: '0.5em',
                                        textAlign: 'center',
                                        padding: '0.5em 0.2em 0em 0.2em',
                                    },
                                }}
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    maxLength: 6,
                                }}
                            />
                        </Box>

                        {error ? (
                            <Typography sx={{ color: 'error.main' }}>
                                {typeof error === 'string'
                                    ? error
                                    : error && error.message
                                    ? error.message
                                    : 'An error occurred'}
                            </Typography>
                        ) : null}
                    </div>
                </Root>
            </CardContent>
            <CardActions sx={{ justifyContent: 'end' }}>
                <Button
                    variant="outlined"
                    type="button"
                    className={SupabaseMFAChallengeFormClasses.cancelButton}
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
                    className={SupabaseMFAChallengeFormClasses.submitButton}
                    disabled={isPending}
                >
                    {isPending ? <CircularProgress size={24} /> : null}
                    {translate('ra-supabase.action.verify', {
                        _: 'Verify',
                    })}
                </Button>
            </CardActions>
        </>
    );
};

interface FormData {
    code: string;
}

const PREFIX = 'RaSupabaseMFAChallengeForm';

const SupabaseMFAChallengeFormClasses = {
    container: `${PREFIX}-container`,
    input: `${PREFIX}-input`,
    submitButton: `${PREFIX}-submitButton`,
    cancelButton: `${PREFIX}-cancelButton`,
};

const Root = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${SupabaseMFAChallengeFormClasses.container}`]: {
        padding: '0 1em 0 1em',
    },
    [`& .${SupabaseMFAChallengeFormClasses.input}`]: {
        marginTop: '1em',
    },
}));
