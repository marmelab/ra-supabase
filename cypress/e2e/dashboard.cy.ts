import { login } from './login';

describe('Dashboard spec', () => {
    it('passes', () => {
        cy.visit('/');
        login();
        cy.findByText('Upcoming Deal Revenue').should('exist');
        cy.findByRole('list', { description: 'My Latest Notes' }).within(() => {
            cy.findAllByRole('listitem').should('have.length.gt', 0);
        });
        cy.findByRole('list', { description: 'Hot contacts' }).within(() => {
            cy.findAllByRole('listitem').should('have.length.gt', 0);
        });
        cy.findByRole('list', { description: 'Deals Pipeline' }).within(() => {
            cy.findAllByRole('listitem').should('have.length.gt', 0);
        });
    });
});
