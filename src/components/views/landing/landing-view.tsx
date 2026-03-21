'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LandingView() {
    return (
        <Box sx={{p: 3}}>
            <Typography variant="h5" gutterBottom>
                Public Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Explore example projects to learn EdgeRules Modeler capabilities.
            </Typography>
        </Box>
    );
}
