import * as React from 'react';
import { Form, required, useLogin, useNotify, useTranslate } from 'ra-core';
import { CardActions, styled } from '@mui/material';
import { PasswordInput, SaveButton, TextInput } from 'ra-ui-materialui';

export const LoginForm = () => {
    const login = useLogin();
    const notify = useNotify();
    const translate = useTranslate();

    const submit = (values: FormData) => {
        return login(values).catch(error => {
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
        });
    };

    return (
        <Root onSubmit={submit}>
            <div className={SupabaseLoginFormClasses.container}>
                <div className={SupabaseLoginFormClasses.input}>
                    <TextInput
                        autoFocus
                        source="email"
                        type="email"
                        label={translate('ra-supabase.auth.email', {
                            _: 'Email',
                        })}
                        fullWidth
                        validate={required()}
                    />
                </div>
                <div>
                    <PasswordInput
                        source="password"
                        label={translate('ra.auth.password', {
                            _: 'Password',
                        })}
                        autoComplete="current-password"
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
                    label={translate('ra.auth.sign_in')}
                />
            </CardActions>
        </Root>
    );
};

interface FormData {
    email?: string;
    password?: string;
}

const PREFIX = 'RaSupabaseLoginForm';

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
