describe('Landing Page', () => {
    beforeEach(() => {
        // Clear IndexedDB to ensure clean state before visiting
        cy.window().then((window) => {
            return new Promise<void>((resolve) => {
                const request = window.indexedDB.deleteDatabase('edgerules-modeler');
                request.onsuccess = () => resolve();
                request.onerror = () => resolve();
                request.onblocked = () => resolve();
            });
        });
        cy.visit('/');
        // Wait for app to be fully rendered
        cy.contains('EdgeRules Modeler').should('be.visible');
    });

    describe('Layout', () => {
        it('should display the top bar with logo', () => {
            cy.contains('EdgeRules Modeler').should('be.visible');
        });

        it('should display sidebar navigation items', () => {
            cy.get('[data-testid="sidebar-public-library"]').should('be.visible');
            cy.get('[data-testid="sidebar-my-workspace"]').should('be.visible');
            cy.get('[data-testid="sidebar-company-workspace"]').should('exist');
        });

        it('should show Public Library as default section', () => {
            cy.contains('Public Library').should('be.visible');
            cy.contains('Explore example projects').should('be.visible');
        });

        it('should have Company Workspace disabled', () => {
            cy.get('[data-testid="sidebar-company-workspace"]')
                .should('have.class', 'Mui-disabled');
        });
    });

    describe('Public Library', () => {
        it('should display example projects from manifest', () => {
            cy.contains('Loan Approval Demo').should('be.visible');
        });

        it('should add an example project to workspace', () => {
            cy.contains('Add to Workspace').click();
            // Should navigate to project flow editor
            cy.url().should('include', '#flow/');
            // Should see project layout with Editor tab
            cy.contains('Editor').should('be.visible');
            cy.contains('Tests').should('be.visible');
            cy.contains('Types').should('be.visible');
        });
    });

    describe('My Workspace', () => {
        it('should show empty state when no projects exist', () => {
            cy.get('[data-testid="sidebar-my-workspace"]').click();
            cy.contains('No projects yet').should('be.visible');
        });

        it('should create a new project via FAB button', () => {
            cy.get('[data-testid="sidebar-my-workspace"]').click();
            cy.contains('No projects yet').should('be.visible');
            // Use the FAB (floating action button) to create
            cy.get('[aria-label="New Project"]').click();
            cy.get('.MuiDialog-root').should('be.visible');
            cy.get('.MuiDialog-root input').first().clear().type('Test Project');
            cy.get('.MuiDialog-root').contains('button', 'Create').click();
            // Should navigate to flow editor
            cy.url().should('include', '#flow/');
        });

        it('should show added example projects in workspace', () => {
            // First, add example from Public Library
            cy.contains('Add to Workspace').click();
            cy.url().should('include', '#flow/');

            // Navigate back to landing
            cy.get('[aria-label="Back to workspace"]').click();

            // Switch to My Workspace
            cy.get('[data-testid="sidebar-my-workspace"]').click();
            cy.contains('Loan Approval Demo').should('be.visible');
        });

        it('should open a project from workspace', () => {
            // Add example first
            cy.contains('Add to Workspace').click();
            cy.url().should('include', '#flow/');

            // Go back
            cy.get('[aria-label="Back to workspace"]').click();
            cy.get('[data-testid="sidebar-my-workspace"]').click();

            // Open the project
            cy.contains('Loan Approval Demo').should('be.visible');
            cy.contains('button', 'Open').click();
            cy.url().should('include', '#flow/');
            cy.contains('Editor').should('be.visible');
        });

        it('should delete a project from workspace', () => {
            // Add example first
            cy.contains('Add to Workspace').click();
            cy.url().should('include', '#flow/');

            // Go back
            cy.get('[aria-label="Back to workspace"]').click();
            cy.get('[data-testid="sidebar-my-workspace"]').click();

            // Delete the project — find the delete icon button
            cy.get('[data-testid="DeleteIcon"]')
                .closest('button')
                .first()
                .click({force: true});
            // Confirm deletion
            cy.get('.MuiDialog-root').contains('button', 'Delete').click();

            // Should show empty state
            cy.contains('No projects yet').should('be.visible');
        });
    });

    describe('Navigation to Project Layout', () => {
        it('should display module tabs in project layout', () => {
            cy.contains('Add to Workspace').click();
            cy.url().should('include', '#flow/');

            cy.contains('Editor').should('be.visible');
            cy.contains('Tests').should('be.visible');
            cy.contains('Types').should('be.visible');
            cy.contains('App').should('be.visible');
            // Deploy tab exists but may be partially hidden
            cy.contains('Deploy').should('exist');
        });

        it('should navigate back to landing from project', () => {
            cy.contains('Add to Workspace').click();
            cy.url().should('include', '#flow/');

            cy.get('[aria-label="Back to workspace"]').click();
            cy.contains('Public Library').should('be.visible');
        });
    });
});
