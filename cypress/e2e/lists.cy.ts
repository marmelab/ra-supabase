import { login } from './login';

const getPaginationText = () =>
    cy.findByText(/\d+-\d+ of \d+/, { timeout: 10000 });

describe('Lists', () => {
    it('should render a list', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        getPaginationText();
    });

    it('should allow to filter by date', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        getPaginationText().then(el => {
            const count = parseInt(el.text().split('of')[1].trim());

            cy.findByText('Earlier').click();
            // Use should here to allow built-in retry as it may take a few ms for the list to update
            getPaginationText().should(el => {
                const countFiltered = parseInt(el.text().split('of')[1].trim());
                expect(countFiltered).to.be.lessThan(count);
            });
        });
    });

    it('should allow to filter by status', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        getPaginationText().then(el => {
            const count = parseInt(el.text().split('of')[1].trim());

            cy.findByText('Cold').click();
            // Use should here to allow built-in retry as it may take a few ms for the list to update
            getPaginationText().should(el => {
                const countFiltered = parseInt(el.text().split('of')[1].trim());
                expect(countFiltered).to.be.lessThan(count);
            });
        });
    });

    it('should allow to filter by tag', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        getPaginationText().then(el => {
            const count = parseInt(el.text().split('of')[1].trim());

            cy.findByText('football-fan', {
                selector: '[role=button] *',
            }).click();

            // Use should here to allow built-in retry as it may take a few ms for the list to update
            getPaginationText().should(el => {
                const countFiltered = parseInt(el.text().split('of')[1].trim());
                expect(countFiltered).to.be.lessThan(count);
            });
        });
    });

    it('should allow to move through pages', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        getPaginationText().then(el => {
            const page = parseInt(el.text().split('-')[0].trim());
            cy.findByLabelText('Go to page 4').click();

            let page4 = 0;
            // Use should here to allow built-in retry as it may take a few ms for the list to update
            getPaginationText().should(el => {
                page4 = parseInt(el.text().split('-')[0].trim());
                expect(page4).to.be.greaterThan(page);
            });

            cy.findByLabelText('Go to page 2').click();

            // Use should here to allow built-in retry as it may take a few ms for the list to update
            getPaginationText().should(el => {
                const page2 = parseInt(el.text().split('-')[0].trim());
                expect(page2).to.be.greaterThan(page);
                expect(page2).to.be.lessThan(page4);
            });
        });
    });

    it('should allow to sort data', () => {
        cy.visit('/');
        login();
        cy.findByText('Contacts').click();
        cy.findAllByText(/\d+ days? ago/, { timeout: 10000 }).should(
            'have.length.greaterThan',
            0
        );
        cy.findAllByText(/\d+ years? ago/, { timeout: 10000 }).should(
            'have.length',
            0
        );
        cy.findByText('Sort by Last seen descending').click();
        cy.findByText('Last seen ascending').click();
        cy.findAllByText(/\d+ days? ago/, { timeout: 10000 }).should(
            'have.length',
            0
        );
        cy.findAllByText(/\d+ years? ago/, { timeout: 10000 }).should(
            'have.length.greaterThan',
            0
        );
    });
});
