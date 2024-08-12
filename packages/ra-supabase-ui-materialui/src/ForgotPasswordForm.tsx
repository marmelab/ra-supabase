import { CardActions, Stack, styled, Typography } from '@mui/material';
import { Form, required, useNotify, useTranslate } from 'ra-core';
import { useResetPassword } from 'ra-supabase-core';
import { SaveButton, TextInput } from 'ra-ui-materialui';
import * as React from 'react';

/**
 * A component that renders a form for resetting the user password.
 */
export const ForgotPasswordForm = () => {
    const notify = useNotify();
    const translate = useTranslate();
    const [resetPassword] = useResetPassword({
        onError: error => {
            notify(
                typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                    ? 'ra.auth.sign_in_error'
                    : error.message,
                {
                    type: 'warning',
                    messageArgs: {
                        _:
                            typeof error === 'string'
                                ? error
                                : error && error.message
                                ? error.message
                                : undefined,
                    },
                }
            );
        },
    });

    const submit = (values: FormData) => {
        return resetPassword({
            email: values.email,
        });
    };

    return (
        <Root onSubmit={submit}>
            <div className={SupabaseLoginFormClasses.container}>
                <Stack spacing={1}>
                    <Typography variant="h1" fontSize="150%">
                        {translate(
                            'ra-supabase.reset_password.forgot_password',
                            {
                                _: 'Forgot password',
                            }
                        )}
                    </Typography>

                    <Typography variant="body2" color="GrayText">
                        {translate(
                            'ra-supabase.reset_password.forgot_password_details',
                            {
                                _: 'Enter your email to receive a reset password link.',
                            }
                        )}
                    </Typography>
                </Stack>

                <div className={SupabaseLoginFormClasses.input}>
                    <TextInput
                        source="email"
                        label={translate('ra.auth.email', {
                            _: 'Email',
                        })}
                        autoComplete="email"
                        fullWidth
                        validate={required()}
                    />
                </div>
            </div>
            <CardActions>
                <SaveButton
                    variant="contained"
                    type="submit"
                    className={SupabaseLoginFormClasses.button}
                    label={translate('ra.action.reset_password', {
                        _: 'Reset password',
                    })}
                />
            </CardActions>
        </Root>
    );
};

interface FormData {
    email: string;
}

const PREFIX = 'RaSupabaseForgotPasswordForm';

const SupabaseLoginFormClasses = {
    container: `${PREFIX}-container`,
    input: `${PREFIX}-input`,
    button: `${PREFIX}-button`,
};

const Root = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${SupabaseLoginFormClasses.container}`]: {
        padding: '0 1em 1em 1em',
    },
    [`& .${SupabaseLoginFormClasses.input}`]: {
        marginTop: '1em',
    },
    [`& .${SupabaseLoginFormClasses.button}`]: {
        width: '100%',
    },
}));
