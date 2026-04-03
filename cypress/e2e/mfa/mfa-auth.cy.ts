const TEST_EMAIL = 'mfa-test@test.dev';
const TEST_PASSWORD = 'password123';

const login = (
    email: string = TEST_EMAIL,
    password: string = TEST_PASSWORD
) => {
    cy.findByLabelText('Email *').type(email);
    cy.findByLabelText('Password *').type(password);
    cy.findByText('Sign in').click();
};

const visitMfaDemo = () => cy.visit('/?mode=mfa');

const assertOnApp = () => {
    cy.url({ timeout: 10000 }).should('include', '/contacts');

    // Open the first contact and verify its fields
    cy.findByText('Joe', { timeout: 10000 }).click();
    cy.url().should('include', '/contacts/1/show');
    cy.findByText('Joe').should('exist');
    cy.findByText('Schultz').should('exist');
};

const logout = () => {
    cy.findByLabelText('Profile').scrollIntoView().click({ force: true });
    cy.findByText('Logout').click({ force: true });
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
        cy.url({ timeout: 10000 }).should('include', '/mfa-enroll');

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
            cy.url({ timeout: 10000 }).should('include', '/mfa-challenge');

            // Verify with TOTP code
            cy.task('generateTOTP', secret).then(code => {
                cy.get('input[name="code"]').type(code as string);
                cy.findByText('Verify').click();
            });

            // Should be in the app
            assertOnApp();

            // Logout
            logout();
        });
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

    it('should reject an enrolled user that fails the challenge', () => {
        // Enroll the user in MFA server-side
        cy.task('enrollUserInMFA', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });

        visitMfaDemo();
        login();

        // Should go to challenge
        cy.url({ timeout: 10000 }).should('include', '/mfa-challenge');

        // Enter an invalid TOTP code
        cy.get('input[name="code"]').type('000000');
        cy.findByText('Verify').click();

        // Should stay on challenge page with an error
        cy.url().should('include', '/mfa-challenge');
    });
});
