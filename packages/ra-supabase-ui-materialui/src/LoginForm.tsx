import * as React from 'react';
import type { ComponentProps } from 'react';
import { Box, styled } from '@mui/material';
import { required, useTranslate } from 'ra-core';
import {
    Link,
    LoginForm as RaLoginForm,
    PasswordInput,
    TextInput,
} from 'ra-ui-materialui';

import { ForgotPasswordPage } from './ForgotPasswordPage';

/**
 * A component that renders a form to login to the application with an email and password.
 */
export const LoginForm = ({
    disableForgotPassword,
    ...props
}: LoginFormProps) => {
    const translate = useTranslate();

    return (
        <Root>
            <RaLoginForm {...props}>
                <TextInput
                    autoFocus
                    source="email"
                    type="email"
                    label={translate('ra.auth.email', {
                        _: 'Email',
                    })}
                    autoComplete="email"
                    validate={required()}
                />
                <PasswordInput
                    source="password"
                    label={translate('ra.auth.password', {
                        _: 'Password',
                    })}
                    autoComplete="current-password"
                    validate={required()}
                />
            </RaLoginForm>
            {!disableForgotPassword ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 1,
                    }}
                >
                    <Link to={ForgotPasswordPage.path} variant="body2">
                        {translate('ra-supabase.auth.forgot_password', {
                            _: 'Forgot password?',
                        })}
                    </Link>
                </Box>
            ) : null}
        </Root>
    );
};

export interface LoginFormProps
    extends Omit<ComponentProps<typeof Root>, 'onSubmit' | 'children'> {
    disableForgotPassword?: boolean;
}

const PREFIX = 'RaSupabaseLoginForm';

const Root = styled('div', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(() => ({}));
