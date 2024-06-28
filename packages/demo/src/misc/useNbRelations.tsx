import {
    RaRecord,
    useRecordContext,
    useReferenceManyFieldController,
} from 'react-admin';

export const useNbRelations = (props: UseNbNotesProps) => {
    const record = useRecordContext(props);
    const { reference, target, label } = props;

    const { isLoading, error, total } = useReferenceManyFieldController({
        page: 1,
        perPage: 1,
        record,
        reference,
        source: 'id',
        target,
    });

    const finalLabel = total ? `${total} ${label}${total > 1 ? 's' : ''}` : '';

    return {
        isLoading,
        error,
        total,
        label: finalLabel,
    };
};

export interface UseNbNotesProps {
    reference: string;
    target: string;
    label: string;
    record?: RaRecord;
}
