import { BulkUpdateFormButton } from '@react-admin/ra-form-layout';
import {
    AutocompleteArrayInput,
    AutocompleteInput,
    BooleanInput,
    Datagrid,
    DateInput,
    List,
    ReferenceArrayInput,
    ReferenceField,
    ReferenceInput,
    SearchInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    useCreate,
} from 'react-admin';

const filters = [
    <SearchInput alwaysOn source="fts@fts" />,
    <TextInput source="id" />,
    <TextInput source="first_name" />,
    <TextInput source="last_name" />,
    <TextInput source="gender" />,
    <TextInput source="title" />,
    <ReferenceInput source="company_id" reference="companies">
        <AutocompleteInput
            filterToQuery={searchText => ({ 'name@ilike': `%${searchText}%` })}
        />
    </ReferenceInput>,
    <TextInput source="email" />,
    <TextInput source="phone_number1" />,
    <TextInput source="phone_number2" />,
    <TextInput source="background" />,
    <TextInput source="acquisition" />,
    <TextInput source="avatar" />,
    <DateInput source="first_seen" />,
    <DateInput source="last_seen" />,
    <BooleanInput source="has_newsletter" />,
    <TextInput source="status" />,
    <ReferenceArrayInput source="tag_ids" reference="tags">
        <AutocompleteArrayInput
            filterToQuery={searchText => ({ 'name@ilike': `%${searchText}%` })}
        />
    </ReferenceArrayInput>,
    <ReferenceInput source="sales_id" reference="sales" />,
];

const ContactBulkUpdateButton = () => {
    const [create] = useCreate();
    return (
        <BulkUpdateFormButton>
            <SimpleForm>
                <ReferenceInput source="company_id" reference="companies">
                    <SelectInput
                        onCreate={async () => {
                            const newCompanyName = prompt(
                                'Enter a new company name'
                            );
                            const newCompany = await create(
                                'companies',
                                {
                                    data: { name: newCompanyName },
                                },
                                { returnPromise: true }
                            );
                            console.log({ newCompany });
                            return newCompany;
                        }}
                    />
                </ReferenceInput>
            </SimpleForm>
        </BulkUpdateFormButton>
    );
};

export const ContactList = () => (
    <List filters={filters}>
        <Datagrid bulkActionButtons={<ContactBulkUpdateButton />}>
            <TextField source="id" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <ReferenceField source="company_id" reference="companies" />
        </Datagrid>
    </List>
);
