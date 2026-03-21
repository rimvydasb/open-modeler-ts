// Suppress MUI hydration mismatch errors in Next.js SSG mode.
// These are expected: the server renders static HTML without Emotion CSS,
// and the client re-hydrates with the full MUI styling. React recovers gracefully.
Cypress.on('uncaught:exception', (error) => {
    if (error.message.includes('Hydration failed') || error.message.includes('hydration mismatch')) {
        return false;
    }
    return true;
});
