import { login } from './login';

describe('Dashboard spec', () => {
    it('passes', () => {
        cy.visit('/');
        login();
        cy.findByText('Upcoming Deal Revenue').should('exist');
        cy.findByText('My Latest Notes').should('exist');
        cy.findByText('Upcoming tasks').should('exist');
        cy.findByText('Hot contacts').should('exist');
        cy.findByTestId('my-latest-notes')
            .find('p')
            .should('have.length.gt', 0);
        cy.findByTestId('tasks-list').find('li').should('have.length.gt', 0);
        cy.findByTestId('hot-contacts').find('li').should('have.length.gt', 0);
    });
});
