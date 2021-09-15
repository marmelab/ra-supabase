import * as React from 'react';
import { OnFailure, OnSuccess, useTranslate } from 'ra-core';
import { Field, Form } from 'react-final-form';
import { Button, CardActions, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ClassesOverride } from 'ra-ui-materialui';
import { useSetPassword, useSupabaseAccessToken } from 'ra-supabase-core';
import { Input } from './Input';

export const SetPasswordForm = (props: SetPasswordFormProps) => {
    const classes = useStyles(props);
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
        <Form
            onSubmit={submit}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
                <>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className={classes.form}>
                            <div>
                                <Field
                                    id="password"
                                    name="password"
                                    type="password"
                                    component={Input}
                                    label={translate('ra.auth.password')}
                                    disabled={submitting}
                                    autoComplete="current-password"
                                />
                            </div>
                            <div>
                                <Field
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    component={Input}
                                    label={translate(
                                        'ra-supabase.auth.confirm_password',
                                        { _: 'Confirm password' }
                                    )}
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                        <CardActions>
                            <Button
                                variant="contained"
                                type="submit"
                                color="primary"
                                disabled={submitting}
                                className={classes.button}
                            >
                                {submitting && (
                                    <CircularProgress
                                        className={classes.icon}
                                        size={18}
                                        thickness={2}
                                    />
                                )}
                                {translate('ra.auth.sign_in')}
                            </Button>
                        </CardActions>
                    </form>
                </>
            )}
        />
    );
};

export type SetPasswordFormProps = {
    classes?: ClassesOverride<typeof useStyles>;
    onSuccess?: OnSuccess;
    onFailure?: OnFailure;
};

interface FormData {
    email?: string;
    password?: string;
    confirm_password?: string;
}

const useStyles = makeStyles(
    theme => ({
        form: {
            padding: '0 1em 1em 1em',
        },
        input: {
            marginTop: '1em',
        },
        button: {
            width: '100%',
        },
        icon: {
            marginRight: theme.spacing(1),
        },
    }),
    {
        name: 'RaSupabaseSetPasswordForm',
    }
);
