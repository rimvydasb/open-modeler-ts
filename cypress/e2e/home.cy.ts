describe('Health Check', () => {
    it('should load the application', () => {
        cy.visit('/');
        cy.contains('EdgeRules Modeler').should('be.visible');
    });

    it('should display the health page', () => {
        cy.visit('/health');
        cy.contains('Health Check').should('be.visible');
        cy.contains('OK').should('be.visible');
    });
});
