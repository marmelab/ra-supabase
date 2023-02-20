describe('Dashboard spec', () => {
    it('passes', () => {
        cy.visit('/');
        cy.findByLabelText('Email *').type('janedoe@atomic.dev');
        cy.findByLabelText('Password *').type('password');
        cy.findByText('Sign in').click();
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
