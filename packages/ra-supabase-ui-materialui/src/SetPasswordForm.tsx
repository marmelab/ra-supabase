import * as React from 'react';
import { Form, onError as OnError, OnSuccess, useTranslate } from 'ra-core';
import { CardActions, styled } from '@mui/material';
import { useSetPassword, useSupabaseAccessToken } from 'ra-supabase-core';
import { PasswordInput, SaveButton } from 'ra-ui-materialui';

export const SetPasswordForm = (props: SetPasswordFormProps) => {
    const translate = useTranslate();
    const access_token = useSupabaseAccessToken();
    const { onSuccess, onFailure } = props;
    const setPassword = useSetPassword({ onSuccess, onFailure });

    const validate = (values: FormData) => {
        const errors: FormData = { email: undefined, password: undefined };

        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        if (
            !values.confirm_password ||
            values.confirm_password !== values.password
        ) {
            errors.password = 'Passwords do not match';
        }
        return errors;
    };

    const submit = async (values: FormData) => {
        await setPassword({
            access_token,
            password: values.password,
        });
    };

    return (
        <Root onSubmit={submit} validate={validate}>
            <div className={SupabaseSetPasswordFormClasses.container}>
                <div>
                    <PasswordInput
                        source="password"
                        type="password"
                        label={translate('ra.auth.password')}
                        autoComplete="current-password"
                    />
                </div>
                <div>
                    <PasswordInput
                        source="confirm_password"
                        type="password"
                        label={translate('ra-supabase.auth.confirm_password', {
                            _: 'Confirm password',
                        })}
                    />
                </div>
            </div>
            <CardActions>
                <SaveButton
                    type="submit"
                    color="primary"
                    className={SupabaseSetPasswordFormClasses.button}
                    label={translate('ra.auth.sign_in')}
                />
            </CardActions>
        </Root>
    );
};

export type SetPasswordFormProps = {
    onSuccess?: OnSuccess;
    onFailure?: OnError;
};

interface FormData {
    email?: string;
    password?: string;
    confirm_password?: string;
}

const PREFIX = 'RaSupabaseSetPasswordForm';

export const SupabaseSetPasswordFormClasses = {
    container: `${PREFIX}-container`,
    input: `${PREFIX}-input`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
};

const Root = styled(Form)(({ theme }) => ({
    [`& .${SupabaseSetPasswordFormClasses.container}`]: {
        padding: '0 1em 1em 1em',
    },
    [`& .${SupabaseSetPasswordFormClasses.input}`]: {
        marginTop: '1em',
    },
    [`& .${SupabaseSetPasswordFormClasses.button}`]: {
        width: '100%',
    },
    [`& .${SupabaseSetPasswordFormClasses.icon}`]: {
        marginRight: theme.spacing(1),
    },
}));
