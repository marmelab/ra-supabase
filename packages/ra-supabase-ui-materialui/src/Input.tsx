import * as React from 'react';
import { FieldRenderProps } from 'react-final-form';
import { TextField } from '@material-ui/core';

export const Input = ({
    meta: { touched, error },
    input: inputProps,
    ...props
}: FieldRenderProps<string>) => (
    <TextField
        error={!!(touched && error)}
        helperText={touched && error}
        {...inputProps}
        {...props}
        fullWidth
    />
);
