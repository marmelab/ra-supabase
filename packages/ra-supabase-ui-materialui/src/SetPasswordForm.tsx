import * as React from 'react';
import { Form, required, useNotify, useTranslate } from 'ra-core';
import { CardActions, styled } from '@mui/material';
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
    const [setPassword] = useSetPassword({
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

    const validate = (values: FormData) => {
        if (values.password !== values.confirmPassword) {
            return {
                password: 'ra-supabase.validation.password_mismatch',
                confirmPassword: 'ra-supabase.validation.password_mismatch',
            };
        }
        return undefined;
    };

    const submit = (values: FormData) => {
        return setPassword({
            access_token,
            refresh_token,
            password: values.password,
        });
    };

    return (
        <Root onSubmit={submit} validate={validate}>
            <div className={SupabaseLoginFormClasses.container}>
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
    password?: string;
    confirmPassword?: string;
}

const PREFIX = 'RaSupabaseSetPasswordForm';

const SupabaseLoginFormClasses = {
    container: `${PREFIX}-container`,
    input: `${PREFIX}-input`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
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
    [`& .${SupabaseLoginFormClasses.icon}`]: {
        marginRight: theme.spacing(1),
    },
}));
