import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generateSales } from './src/dataGenerator/sales';
import { generateTags } from './src/dataGenerator/tags';
import { generateCompanies } from './src/dataGenerator/companies';
import { generateContacts } from './src/dataGenerator/contacts';
import { generateContactNotes } from './src/dataGenerator/contactNotes';
import { generateDeals } from './src/dataGenerator/deals';
import { generateDealNotes } from './src/dataGenerator/dealNotes';
import { generateTasks } from './src/dataGenerator/tasks';

dotenv.config();

async function main() {
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_KEY as string
    );

    const sales = generateSales();

    console.log('Adding sales...');
    const { data: persistedSales, error: errorSales } = await supabase
        .from('sales')
        .insert(sales.map(({ id, ...sale }) => sale))
        .select();

    if (errorSales) {
        throw errorSales;
    }

    console.log('Adding tags...');
    const tags = generateTags();
    const { data: persistedTags, error: errorTags } = await supabase
        .from('tags')
        .insert(tags.map(({ id, ...tag }) => tag))
        .select();

    if (errorTags) {
        throw errorTags;
    }

    console.log('Adding companies...');
    const companies = generateCompanies({ sales: persistedSales });
    const { data: persistedCompanies, error: errorCompanies } = await supabase
        .from('companies')
        .insert(
            companies.map(
                ({ nb_contacts, nb_deals, id, ...company }) => company
            )
        )
        .select();

    if (errorCompanies) {
        throw errorCompanies;
    }

    console.log('Adding contacts...');
    const contacts = generateContacts({
        tags: persistedTags,
        companies: persistedCompanies,
    });
    const { data: persistedContacts, error: errorContacts } = await supabase
        .from('contacts')
        .insert(contacts)
        .select();

    if (errorContacts) {
        throw errorContacts;
    }

    console.log('Adding contact notes...');
    const contactNotes = generateContactNotes({
        contacts: persistedContacts,
    });
    const { data: persistedContactNotes, error: errorContactNotes } =
        await supabase
            .from('contactNotes')
            .insert(contactNotes.map(({ id, ...note }) => note))
            .select();

    if (errorContactNotes) {
        throw errorContactNotes;
    }

    console.log('Updating contacts status...');
    await Promise.all(
        persistedContactNotes
            .sort(
                (a, b) =>
                    new Date(a.date).valueOf() - new Date(b.date).valueOf()
            )
            .map(note => {
                return supabase.from('contacts').update({
                    ...persistedContacts.find(
                        contact => contact.id === note.contact_id
                    ),
                    status: note.status,
                });
            })
    );

    console.log('Adding deals...');
    const deals = generateDeals({
        companies: persistedCompanies,
        contacts: persistedContacts,
    });
    const { data: persistedDeals, error: errorDeals } = await supabase
        .from('deals')
        .insert(deals.map(({ nb_notes, id, ...deal }) => deal))
        .select();

    if (errorDeals) {
        throw errorDeals;
    }

    console.log('Adding deal notes...');
    const dealNotes = generateDealNotes({
        companies: persistedCompanies,
        deals: persistedDeals,
    });
    const { error: errorDealNotes } = await supabase
        .from('dealNotes')
        .insert(dealNotes.map(({ id, ...note }) => note));

    if (errorDealNotes) {
        throw errorDealNotes;
    }

    console.log('Adding tasks...');
    const tasks = generateTasks({
        contacts: persistedContacts,
    });
    const { error: errorTasks } = await supabase
        .from('tasks')
        .insert(tasks.map(({ id, ...task }) => task));

    if (errorTasks) {
        throw errorTasks;
    }

    console.log('Adding users...');
    for (const sale of sales) {
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
