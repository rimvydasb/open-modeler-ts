'use client';

import { Container, Typography, Button, Box, Paper } from '@mui/material';

export default function Home() {
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    EdgeRules Modeler
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Welcome to EdgeRules Modeler. This project is configured for static export to S3.
                </Typography>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Button variant="contained" color="primary">
                        Get Started
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
}
