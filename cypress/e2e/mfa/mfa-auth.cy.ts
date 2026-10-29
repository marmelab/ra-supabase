const TEST_EMAIL = 'mfa-test@test.dev';
const TEST_PASSWORD = 'password123';

const login = (
    email: string = TEST_EMAIL,
    password: string = TEST_PASSWORD
) => {
    cy.intercept('POST', '**/auth/v1/token*').as('signIn');
    cy.findByLabelText('Email *').type(email);
    cy.findByLabelText('Password *').type(password);
    cy.findByText('Sign in').click();
    cy.wait('@signIn');
};

// The guesser re-renders the login form once the API schema is loaded, losing
// what was already typed: wait for the schema before typing.
// Visit the login page directly, as visiting / redirects to it after the schema
// is loaded, through a logout that also resets the form.
const visitMfaDemo = () => {
    cy.intercept({ method: 'GET', pathname: '/rest/v1/' }).as('apiSchema');
    cy.visit('/mfa/login');
    cy.wait('@apiSchema');
};

const getPaginationText = () =>
    cy.findByText(/\d+-\d+ of \d+/, { timeout: 10000 });

const assertOnApp = () => {
    cy.url({ timeout: 10000 }).should('include', '/contacts');
    getPaginationText();
};

const openUserMenuItem = (label: string) => {
    cy.findByLabelText('Profile').scrollIntoView().click({ force: true });
    cy.findByText(label).click({ force: true });
};

const logout = () => {
    openUserMenuItem('Logout');
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.findByText('Sign in').should('exist');
};

describe('MFA Authentication', () => {
    let testUserId: string | null = null;

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.task('deleteTestUserByEmail', TEST_EMAIL);
        cy.task('createTestUser', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }).then(userId => {
            testUserId = userId as string;
        });
    });

    afterEach(() => {
        if (testUserId) {
            cy.task('deleteTestUser', testUserId);
            testUserId = null;
        }
    });

    it('should allow an unenrolled user to setup MFA, interact with the app, and logout', () => {
        let totpSecret: string;
        cy.intercept('POST', '**/auth/v1/factors', req => {
            req.continue(res => {
                totpSecret = res.body?.totp?.secret;
            });
        });

        visitMfaDemo();
        login();
        cy.url().should('include', '/mfa-enroll');

        // Start enrollment
        cy.findByText('Set up').click();
        cy.findByAltText('TOTP QR Code', { timeout: 10000 }).should(
            'be.visible'
        );

        // Proceed to challenge
        cy.findByText('Next').click();
        cy.url().should('include', '/mfa-challenge');

        // Verify with TOTP code
        cy.then(() => {
            expect(totpSecret).to.be.a('string');
            return cy.task('generateTOTP', totpSecret);
        }).then(code => {
            cy.get('input[name="code"]').type(code as string);
            cy.findByText('Verify').click();
        });

        // Should be in the app
        assertOnApp();

        // Logout
        logout();
    });

    it('should allow an enrolled user to login with a challenge, interact with the app, and logout', () => {
        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }).then(secret => {
            visitMfaDemo();
            login();

            // Should go straight to challenge (already enrolled)
            cy.url().should('include', '/mfa-challenge');

            // Verify with TOTP code
            cy.task('generateTOTP', secret).then(code => {
                cy.get('input[name="code"]').type(code as string);
                cy.findByText('Verify').click();
            });

            // Should be in the app
            assertOnApp();

            // Should stay in the app after a reload
            cy.reload();
            assertOnApp();

            // Logout
            logout();
        });
    });

    it('should allow an enrolled user to add a second authenticator, pick it at login, and remove the first', () => {
        let secret2: string;
        let factorId2: string;
        cy.intercept('POST', '**/auth/v1/factors', req => {
            req.continue(res => {
                secret2 = res.body?.totp?.secret;
                factorId2 = res.body?.id;
            });
        });
        const verify = (secret: string) =>
            cy.task('generateTOTP', secret).then(code => {
                cy.get('input[name="code"]').type(code as string);
                cy.findByText('Verify').click();
                assertOnApp();
            });

        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }).then(secret1 => {
            visitMfaDemo();
            login();
            cy.url().should('include', '/mfa-challenge');
            // A single authenticator needs no picking
            cy.get('input[type="radio"]').should('not.exist');
            verify(secret1 as string);
        });

        // Cancelling the addition of an authenticator goes back to the app
        openUserMenuItem('Add an authenticator');
        cy.url().should('include', '/mfa-enroll');
        cy.findByText('Set up').click();
        cy.findByAltText('TOTP QR Code', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.findByText('Cancel').click();
        assertOnApp();

        // Add a second authenticator from the user menu
        openUserMenuItem('Add an authenticator');
        cy.url().should('include', '/mfa-enroll');
        cy.findByText('Set up').click();
        cy.findByAltText('TOTP QR Code', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.findByText('Next').click();
        cy.url().should('include', '/mfa-challenge');
        // The challenge verifies the authenticator just added
        cy.get('input[type="radio"]').should('not.exist');
        cy.then(() => verify(secret2));

        // Log back in and pick the second authenticator, numbered after the first
        logout();
        login();
        cy.url().should('include', '/mfa-challenge');
        cy.get('input[type="radio"]').should('have.length', 2);
        // A factor is preselected (which one depends on the server order)
        cy.get('input[type="radio"]:checked').should('have.length', 1);
        cy.then(() => {
            cy.findByLabelText('CRM Demo 2')
                .should('have.value', factorId2)
                .click();
            verify(secret2);
        });

        // Remove the first authenticator
        openUserMenuItem('Remove an authenticator');
        cy.url().should('include', '/mfa-unenroll');
        cy.get('input[type="radio"]').should('have.length', 2);
        cy.findByLabelText('CRM Demo').click();
        cy.findByText('Unenroll').click();
        cy.findByText('Successfully unenrolled from TOTP MFA', {
            timeout: 10000,
        });

        // Only the second authenticator is left
        openUserMenuItem('Remove an authenticator');
        cy.url().should('include', '/mfa-unenroll');
        cy.findByText('Unenroll').should('not.be.disabled');
        cy.get('input[type="radio"]').should('not.exist');
    });

    it('should reject an enrolled user that fails login/password without showing a challenge', () => {
        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });

        visitMfaDemo();
        login(TEST_EMAIL, 'wrong-password');

        // Should stay on login page with an error
        cy.findByText('Invalid login credentials', {
            timeout: 10000,
        }).should('exist');
        cy.url().should('include', '/login');
        cy.url().should('not.include', '/mfa-');
    });

    it('should send an enrolled user that skips the challenge back to login', () => {
        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });

        visitMfaDemo();
        login();
        cy.url().should('include', '/mfa-challenge');

        // Load the app directly with the aal1 session
        cy.visit('/mfa/contacts');

        cy.url({ timeout: 10000 }).should('include', '/login');
        cy.findByText('Sign in').should('exist');
    });

    it('should reject an enrolled user that fails the challenge', () => {
        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });

        visitMfaDemo();
        login();

        // Should go to challenge
        cy.url().should('include', '/mfa-challenge');

        // Enter an invalid TOTP code
        cy.get('input[name="code"]').type('000000');
        cy.findByText('Verify').click();

        // Should stay on challenge page with an error
        cy.findByText('Invalid TOTP code entered', { timeout: 10000 }).should(
            'exist'
        );
        cy.url().should('include', '/mfa-challenge');
    });
});
