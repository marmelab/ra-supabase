import * as React from 'react';
import { EditBase, Form, Toolbar, useEditContext } from 'react-admin';
import { Card, CardContent, Box } from '@mui/material';

import { Avatar } from './Avatar';
import { ContactInputs } from './ContactInputs';
import { ContactAside } from './ContactAside';
import { Contact } from '../types';

export const ContactEdit = () => (
    // Remove the fts (full text search) column as it is a generated one
    // see https://www.postgresql.org/docs/current/ddl-generated-columns.html
    <EditBase redirect="show" transform={({ fts, ...record }) => record}>
        <ContactEditContent />
    </EditBase>
);

const ContactEditContent = () => {
    const { isLoading, record } = useEditContext<Contact>();
    if (isLoading || !record) return null;
    return (
        <Box mt={2} display="flex">
            <Box flex="1">
                <Form>
                    <Card>
                        <CardContent>
                            <Box>
                                <Box display="flex">
                                    <Box mr={2}>
                                        <Avatar />
                                    </Box>
                                    <ContactInputs />
                                </Box>
                            </Box>
                        </CardContent>
                        <Toolbar />
                    </Card>
                </Form>
            </Box>
            <ContactAside link="show" />
        </Box>
    );
};
