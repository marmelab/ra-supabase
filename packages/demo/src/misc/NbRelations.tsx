import { Typography, CircularProgress } from '@mui/material';
import { RaRecord, useTimeout } from 'react-admin';
import ErrorIcon from '@mui/icons-material/Error';
import { useNbRelations } from './useNbRelations';

export const NbRelations = (props: NbNotesProps) => {
    const { timeout = 1000, ...rest } = props;
    const { isLoading, error, label } = useNbRelations(rest);
    const oneSecondHasPassed = useTimeout(timeout);

    const body = isLoading ? (
        oneSecondHasPassed ? (
            <CircularProgress size={14} />
        ) : (
            ''
        )
    ) : error ? (
        <ErrorIcon color="error" fontSize="small" titleAccess="error" />
    ) : label ? (
        ` - ${label}`
    ) : (
        ''
    );

    return (
        <Typography component="span" variant="body2">
            {body}
        </Typography>
    );
};

export interface NbNotesProps {
    reference: string;
    target: string;
    timeout?: number;
    label: string;
    record?: RaRecord;
}
