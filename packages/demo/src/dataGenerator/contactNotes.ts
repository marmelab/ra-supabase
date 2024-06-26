import { random, lorem } from 'faker/locale/en_US';

import { Db } from './types';
import { ContactNote } from '../types';
import { randomDate } from './utils';

const status = ['cold', 'cold', 'cold', 'warm', 'warm', 'hot', 'in-contract'];

export const generateContactNotes = (
    db: Pick<Db, 'contacts'>
): ContactNote[] => {
    return Array.from(Array(1200).keys()).map(id => {
        const contact = random.arrayElement(db.contacts);
        const date = randomDate(new Date(contact.first_seen)).toISOString();
        contact.last_seen = date > contact.last_seen ? date : contact.last_seen;
        return {
            id,
            contact_id: contact.id,
            text: lorem.paragraphs(random.number({ min: 1, max: 4 })),
            date,
            sales_id: contact.sales_id,
            status: random.arrayElement(status),
        };
    });
};
