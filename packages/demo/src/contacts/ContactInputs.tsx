import * as React from 'react';
import {
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    BooleanInput,
    SelectInput,
    required,
    email,
    useCreate,
    useGetIdentity,
    useNotify,
} from 'react-admin';
import { Divider, Box, Stack } from '@mui/material';

import { genders } from './constants';

const isUrl = (value: string) => {
    if (!value) return;
    try {
        new URL(value);
    } catch (_) {
        return 'Must be a valid URL';
    }
};

const filterToQuery = (searchText: string) => ({ 'name@ilike': searchText });

export const ContactInputs = () => {
    const [create] = useCreate();
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const handleCreateCompany = async (name?: string) => {
        if (!name) return;
        try {
            const newCompany = await create(
                'companies',
                {
                    data: {
                        name,
                        sales_id: identity?.id,
                        created_at: new Date().toISOString(),
                    },
                },
                { returnPromise: true }
            );
            return newCompany;
        } catch (error) {
            notify('An error occurred while creating the company', {
                type: 'error',
            });
            throw error;
        }
    };
    return (
        <Box flex="1" mt={-1}>
            <Stack direction="row" width={430} gap={1}>
                <TextInput
                    source="first_name"
                    validate={required()}
                    helperText={false}
                    fullWidth
                />
                <TextInput
                    source="last_name"
                    validate={required()}
                    helperText={false}
                    fullWidth
                />
            </Stack>
            <Stack direction="row" width={430} gap={1}>
                <TextInput source="title" helperText={false} fullWidth />
                <ReferenceInput source="company_id" reference="companies">
                    <AutocompleteInput
                        optionText="name"
                        validate={required()}
                        onCreate={handleCreateCompany}
                        helperText={false}
                        fullWidth
                        filterToQuery={filterToQuery}
                    />
                </ReferenceInput>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box width={430}>
                <TextInput
                    source="email"
                    helperText={false}
                    validate={email()}
                    fullWidth
                />
                <Stack direction="row" gap={1}>
                    <TextInput
                        source="phone_number1"
                        helperText={false}
                        fullWidth
                    />
                    <TextInput
                        source="phone_number2"
                        helperText={false}
                        fullWidth
                    />
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box width={430}>
                <TextInput
                    source="background"
                    multiline
                    helperText={false}
                    fullWidth
                />
                <TextInput
                    source="avatar"
                    label="Avatar URL"
                    helperText={false}
                    validate={isUrl}
                    fullWidth
                />
                <Stack direction="row" gap={1} alignItems="center">
                    <SelectInput
                        source="gender"
                        choices={genders}
                        helperText={false}
                        fullWidth
                    />
                    <BooleanInput
                        source="has_newsletter"
                        sx={{
                            width: '100%',
                            label: { justifyContent: 'center' },
                        }}
                        helperText={false}
                    />
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box width={430}>
                <ReferenceInput
                    reference="sales"
                    source="sales_id"
                    sort={{ field: 'last_name', order: 'ASC' }}
                >
                    <SelectInput
                        helperText={false}
                        label="Account manager"
                        sx={{ width: 210 }}
                    />
                </ReferenceInput>
            </Box>
        </Box>
    );
};
