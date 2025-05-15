import * as React from 'react';
import { CardActions, styled, Typography } from '@mui/material';
import { Form, required, useNotify, useTranslate } from 'ra-core';
import { PasswordInput, SaveButton } from 'ra-ui-materialui';
import { useSetPassword, useSupabaseAccessToken } from 'ra-supabase-core';

/**
 * A component that renders a form for setting the current user password through Supabase.
 * Can be used for the first login after a user has been invited or to reset the password.
 */
export const SetPasswordForm = () => {
    const access_token = useSupabaseAccessToken();
    const refresh_token = useSupabaseAccessToken({
        parameterName: 'refresh_token',
    });

    const notify = useNotify();
    const translate = useTranslate();
    const [, { mutateAsync: setPassword }] = useSetPassword();

    const validate = (values: FormData) => {
        if (values.password !== values.confirmPassword) {
            return {
                password: 'ra-supabase.validation.password_mismatch',
                confirmPassword: 'ra-supabase.validation.password_mismatch',
            };
        }
        return {};
    };

    if (!access_token || !refresh_token) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
                'Missing access_token or refresh_token for set password'
            );
        }
        return (
            <div className={SupabaseLoginFormClasses.container}>
                <div>{translate('ra-supabase.auth.missing_tokens')}</div>
            </div>
        );
    }

    const submit = async (values: FormData) => {
        try {
            await setPassword({
                access_token,
                refresh_token,
                password: values.password,
            });
        } catch (error) {
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
        }
    };

    return (
        <Root onSubmit={submit} validate={validate}>
            <div className={SupabaseLoginFormClasses.container}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                    }}
                >
                    {translate('ra-supabase.set_password.new_password', {
                        _: 'Choose your password',
                    })}
                </Typography>

                <div className={SupabaseLoginFormClasses.input}>
                    <PasswordInput
                        source="password"
                        label={translate('ra.auth.password', {
                            _: 'Password',
                        })}
                        autoComplete="new-password"
                        fullWidth
                        validate={required()}
                    />
                </div>
                <div>
                    <PasswordInput
                        source="confirmPassword"
                        label={translate('ra.auth.confirm_password', {
                            _: 'Confirm password',
                        })}
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
                    label={translate('ra.action.save')}
                />
            </CardActions>
        </Root>
    );
};

interface FormData {
    password: string;
    confirmPassword: string;
}

const PREFIX = 'RaSupabaseSetPasswordForm';

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
        padding: '0 1em 0 1em',
    },
    [`& .${SupabaseLoginFormClasses.input}`]: {
        marginTop: '1em',
    },
    [`& .${SupabaseLoginFormClasses.button}`]: {
        width: '100%',
    },
}));
