import {
    Box,
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Typography,
    styled,
} from '@mui/material';
import {
    Form,
    required,
    useLogout,
    useNotify,
    useRedirect,
    useTranslate,
} from 'ra-core';
import { useMFAChallengeAndVerify, useMFAListFactors } from 'ra-supabase-core';
import { TextInput } from 'ra-ui-materialui';
import * as React from 'react';
import { useLocation } from 'react-router';

export const MFAChallengeForm = () => {
    const translate = useTranslate();
    const location = useLocation();
    const redirect = useRedirect();
    const notify = useNotify();
    const logout = useLogout();
    // Verify the factor just enrolled when coming from MFAEnrollForm,
    // otherwise the user's verified TOTP factor.
    const enrolledFactorId: string | undefined = location.state?.factorId;
    const {
        data: factors,
        isPending: isLoadingFactors,
        error: factorsError,
    } = useMFAListFactors();
    const [mutate, mutation] = useMFAChallengeAndVerify({
        onSuccess: () => {
            redirect('/');
        },
    });
    const isLoading =
        mutation.isPending || (!enrolledFactorId && isLoadingFactors);

    const submit = async (values: FormData) => {
        if (!enrolledFactorId && factorsError) {
            notify(factorsError.message, { type: 'error' });
            return;
        }
        const factorId = enrolledFactorId ?? factors?.totp?.[0]?.id; // TODO handle multiple factors
        if (!factorId) {
            notify('ra-supabase.mfa.totp.no_factor_error', {
                type: 'error',
                messageArgs: { _: 'No TOTP factors found!' },
            });
            return;
        }
        mutate({
            code: values.code,
            factorId,
        });
    };

    return (
        <Root onSubmit={submit}>
            <CardContent
                sx={theme => ({ maxWidth: theme.breakpoints.values.sm })}
            >
                <div className={SupabaseMFAChallengeFormClasses.container}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        {translate('ra-supabase.mfa.totp.challenge_header', {
                            _: 'Enter your TOTP code',
                        })}
                    </Typography>

                    <Typography
                        sx={{
                            my: 4,
                        }}
                    >
                        {translate(
                            'ra-supabase.mfa.totp.challenge_instructions',
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
                </div>
            </CardContent>
            <CardActions sx={{ justifyContent: 'end' }}>
                <Button
                    variant="outlined"
                    type="button"
                    className={SupabaseMFAChallengeFormClasses.cancelButton}
                    onClick={() => {
                        logout();
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
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : null}
                    {translate('ra-supabase.action.verify', {
                        _: 'Verify',
                    })}
                </Button>
            </CardActions>
        </Root>
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
