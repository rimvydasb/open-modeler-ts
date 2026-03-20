describe('Home Page', () => {
    it('should display the main heading', () => {
        cy.visit('/');
        cy.get('h1').should('contain', 'EdgeRules Modeler');
    });

    it('should have a Get Started button', () => {
        cy.visit('/');
        cy.get('button').should('contain', 'Get Started');
    });
});
