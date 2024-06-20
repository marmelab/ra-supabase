import { Typography, CircularProgress } from '@mui/material';
import {
    useRecordContext,
    useReferenceManyFieldController,
    useTimeout,
} from 'ra-core';
import ErrorIcon from '@mui/icons-material/Error';

export const NbRelations = (props: NbNotesProps) => {
    const record = useRecordContext(props);
    const { reference, target, label, timeout = 1000 } = props;

    const oneSecondHasPassed = useTimeout(timeout);

    const { isLoading, error, total } = useReferenceManyFieldController({
        page: 1,
        perPage: 1,
        record,
        reference,
        source: 'id',
        target,
    });

    const body = isLoading ? (
        oneSecondHasPassed ? (
            <CircularProgress size={14} />
        ) : (
            ''
        )
    ) : error ? (
        <ErrorIcon color="error" fontSize="small" titleAccess="error" />
    ) : total ? (
        `- ${total} ${label}${total > 1 ? 's' : ''}`
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
}
