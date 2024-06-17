import { random, lorem } from 'faker/locale/en_US';

import { Db } from './types';
import { randomDate } from './utils';

const type = ['Email', 'Call', 'Call', 'Call', 'Call', 'Meeting', 'Reminder'];

export const generateDealNotes = (db: Db) => {
    return Array.from(Array(300).keys()).map(id => {
        const deal = random.arrayElement(db.deals);
        const company = db.companies[deal.company_id as number];
        const date = company
            ? randomDate(new Date(company.created_at)).toISOString()
            : randomDate().toISOString();
        deal.nb_notes++;
        return {
            id,
            deal_id: deal.id,
            type: random.arrayElement(type),
            text: lorem.paragraphs(random.number({ min: 1, max: 4 })),
            date,
            sales_id: deal.sales_id,
        };
    });
};
