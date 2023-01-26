import { ResourcesOptions, supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabase';

const resources: ResourcesOptions = {
    companies: {
        fields: [
            'id',
            'name',
            'sector',
            'size',
            'linkedIn',
            'website',
            'phone_number',
            'address',
            'zipcode',
            'city',
            'stateAbbr',
            'sales_id',
            'created_at',
            'logo'
        ],
        fullTextSearchFields: [
            'name',
            'sector',
            'website',
            'address',
            'city',
            'stateAbbr',
        ],
    },
    contactNotes: {
        fields: [
            'id',
            'contact_id',
            'type',
            'text',
            'date',
            'sales_id',
            'status',
        ],
        fullTextSearchFields: ['type', 'text', 'status'],
    },
    contacts: {
        fields: [
            'id',
            'first_name',
            'last_name',
            'gender',
            'title',
            'company_id',
            'email',
            'phone_number1',
            'phone_number2',
            'background',
            'acquisition',
            'first_seen',
            'last_seen',
            'has_newsletter',
            'status',
            'tags',
            'sales_id',
            'avatar',
        ],
        fullTextSearchFields: [
            'first_name',
            'last_name',
            'gender',
            'title',
            'email',
            'background',
            'acquisition',
            'status',
        ],
    },
    dealNotes: {
        fields: ['id', 'deal_id', 'type', 'text', 'date', 'sales_id'],
        fullTextSearchFields: ['type', 'text'],
    },
    deals: {
        fields: [
            'id',
            'name',
            'company_id',
            'contact_ids',
            'type',
            'stage',
            'description',
            'amount',
            'created_at',
            'updated_at',
            'start_at',
            'sales_id',
            'index',
        ],
        fullTextSearchFields: ['name', 'type', 'stage', 'description'],
    },
    sales: {
        fields: ['id', 'first_name', 'last_name', 'email'],
        fullTextSearchFields: ['first_name', 'last_name', 'email'],
    },
    tags: {
        fields: ['id', 'name', 'color'],
        fullTextSearchFields: ['name'],
    },
    tasks: {
        fields: ['id', 'contact_id', 'type', 'text', 'due_date', 'sales_id'],
        fullTextSearchFields: ['type', 'text'],
    },
};

export const dataProvider = supabaseDataProvider(supabase, resources);
