import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import generateData from './src/dataGenerator';

dotenv.config();

async function main() {
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_KEY as string
    );

    const data = generateData();

    console.log('Adding sales...');
    const { error: errorSales } = await supabase
        .from('sales')
        .insert(data.sales);

    if (errorSales) {
        throw errorSales;
    }

    console.log('Adding tags...');
    const { error: errorTags } = await supabase.from('tags').insert(data.tags);

    if (errorTags) {
        throw errorTags;
    }

    console.log('Adding companies...');
    const { error: errorCompanies } = await supabase
        .from('companies')
        .insert(
            data.companies.map(
                ({ nb_contacts, nb_deals, ...company }) => company
            )
        );

    if (errorCompanies) {
        throw errorCompanies;
    }

    console.log('Adding contacts...');
    const { error: errorContacts } = await supabase
        .from('contacts')
        .insert(data.contacts);

    if (errorContacts) {
        throw errorContacts;
    }

    console.log('Adding contact notes...');
    const { error: errorContactNotes } = await supabase
        .from('contactNotes')
        .insert(data.contactNotes);

    if (errorContactNotes) {
        throw errorContactNotes;
    }

    console.log('Adding deals...');
    const { error: errorDeals } = await supabase
        .from('deals')
        .insert(data.deals.map(({ nb_notes, ...deal }) => deal));

    if (errorDeals) {
        throw errorDeals;
    }

    console.log('Adding deal notes...');
    const { error: errorDealNotes } = await supabase
        .from('dealNotes')
        .insert(data.dealNotes);

    if (errorDealNotes) {
        throw errorDealNotes;
    }

    console.log('Adding tasks...');
    const { error: errorTasks } = await supabase
        .from('tasks')
        .insert(data.tasks);

    if (errorTasks) {
        throw errorTasks;
    }

    console.log('Adding users...');
    for (const sale of data.sales) {
        const { error } = await supabase.auth.admin.createUser({
            email: sale.email,
            password: 'password',
            email_confirm: true,
        });

        if (error) {
            throw error;
        }
    }

    console.log('Data seeded successfully');
}

main().catch(error => {
    console.error(error);

    process.exit(1);
});
