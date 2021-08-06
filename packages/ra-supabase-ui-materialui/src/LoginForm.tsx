import * as React from 'react';
import { useLogin, useNotify, useTranslate } from 'ra-core';
import { Field, Form } from 'react-final-form';
import { Button, CardActions, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Input } from './Input';

export const LoginForm = () => {
    const classes = useStyles();
    const login = useLogin();
    const notify = useNotify();
    const translate = useTranslate();

    const validate = (values: FormData) => {
        const errors: FormData = { email: undefined, password: undefined };

        if (!values.email) {
            errors.email = translate('ra.validation.required');
        }
        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        return errors;
    };

    const submit = (values: FormData) => {
        return login(values).catch(error => {
            notify(
                typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                    ? 'ra.auth.sign_in_error'
                    : error.message,
                'warning',
                {
                    _:
                        typeof error === 'string'
                            ? error
                            : error && error.message
                            ? error.message
                            : undefined,
                }
            );
        });
    };

    return (
        <Form
            onSubmit={submit}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
                <form onSubmit={handleSubmit} noValidate>
                    <div className={classes.form}>
                        <div className={classes.input}>
                            <Field
                                autoFocus
                                id="email"
                                name="email"
                                type="email"
                                component={Input}
                                label={translate('ra-supabase.auth.email', {
                                    _: 'Email',
                                })}
                                disabled={submitting}
                            />
                        </div>
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
            )}
        />
    );
};

interface FormData {
    email?: string;
    password?: string;
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
        name: 'RaSupabaseLoginForm',
    }
);
