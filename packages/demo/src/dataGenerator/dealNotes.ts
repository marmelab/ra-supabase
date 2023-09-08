import { random, lorem } from 'faker/locale/en_US';

import { Db } from './types';
import { randomDate } from './utils';

const type = ['Email', 'Call', 'Call', 'Call', 'Call', 'Meeting', 'Reminder'];

export const generateDealNotes = (db: Pick<Db, 'companies' | 'deals'>) => {
    return Array.from(Array(300).keys()).map(id => {
        const deal = random.arrayElement(db.deals);
        return {
            id,
            deal_id: deal.id,
            type: random.arrayElement(type),
            text: lorem.paragraphs(random.number({ min: 1, max: 4 })),
            date: randomDate(
                new Date(
                    db.companies.find(
                        company => company.id == deal.company_id
                    ).created_at
                )
            ).toISOString(),
            sales_id: deal.sales_id,
        };
    });
};
