/* eslint-disable import/no-anonymous-default-export */
import * as React from 'react';
import {
    List as RaList,
    SimpleListLoading,
    ReferenceField,
    TextField,
    useListContext,
    ExportButton,
    SortButton,
    TopToolbar,
    CreateButton,
    Pagination,
    useGetIdentity,
    BulkActionsToolbar,
    BulkDeleteButton,
    RecordContextProvider,
} from 'react-admin';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Checkbox,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

import { Avatar } from './Avatar';
import { Status } from '../misc/Status';
import { TagsList } from './TagsList';
import { ContactListFilter } from './ContactListFilter';
import { Contact } from '../types';
import { NbRelations } from '../misc/NbRelations';

const ContactListContent = () => {
    const {
        data: contacts,
        error,
        isLoading,
        onToggleItem,
        selectedIds,
    } = useListContext<Contact>();
    if (isLoading) {
        return <SimpleListLoading hasLeftAvatarOrIcon hasSecondaryText />;
    }
    if (error) {
        return null;
    }
    const now = Date.now();

    return (
        <>
            <BulkActionsToolbar>
                <BulkDeleteButton />
            </BulkActionsToolbar>
            <List dense>
                {contacts.map(contact => (
                    <RecordContextProvider key={contact.id} value={contact}>
                        <ListItem
                            button
                            component={Link}
                            to={`/contacts/${contact.id}/show`}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={selectedIds.includes(contact.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    onClick={e => {
                                        e.stopPropagation();
                                        onToggleItem(contact.id);
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Avatar />
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${contact.first_name} ${contact.last_name}`}
                                secondaryTypographyProps={{
                                    component: 'div',
                                }}
                                secondary={
                                    <>
                                        {contact.title} at{' '}
                                        <ReferenceField
                                            source="company_id"
                                            reference="companies"
                                            link={false}
                                        >
                                            <TextField source="name" />
                                        </ReferenceField>
                                        <NbRelations
                                            label="note"
                                            reference="contactNotes"
                                            target="contact_id"
                                        />
                                        <NbRelations
                                            label="task"
                                            reference="tasks"
                                            target="contact_id"
                                        />
                                        &nbsp;&nbsp;
                                        <TagsList />
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    last activity{' '}
                                    {formatDistance(
                                        new Date(contact.last_seen),
                                        now
                                    )}{' '}
                                    ago <Status status={contact.status} />
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </RecordContextProvider>
                ))}
            </List>
        </>
    );
};

const ContactListActions = () => (
    <TopToolbar>
        <SortButton fields={['last_name', 'first_name', 'last_seen']} />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="New Contact"
            sx={{ marginLeft: 2 }}
        />
    </TopToolbar>
);

export const ContactList = () => {
    const { identity } = useGetIdentity();
    return identity ? (
        <RaList
            actions={<ContactListActions />}
            aside={<ContactListFilter />}
            perPage={10}
            pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
            filterDefaultValues={{ sales_id: identity?.id }}
            sort={{ field: 'last_seen', order: 'DESC' }}
        >
            <ContactListContent />
        </RaList>
    ) : null;
};
