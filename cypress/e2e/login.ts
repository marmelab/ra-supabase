export const login = (
    email: string = 'janedoe@atomic.dev',
    password: string = 'password'
) => {
    cy.wait(1000);
    cy.findByLabelText('Email *').type(email);
    cy.findByLabelText('Password *').type(password);
    cy.findByText('Sign in').click();
};
