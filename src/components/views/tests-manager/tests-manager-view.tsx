'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ScienceIcon from '@mui/icons-material/Science';

interface TestsManagerViewProps {
    projectId: string;
    testKey: string | null;
}

export default function TestsManagerView({projectId, testKey}: TestsManagerViewProps) {
    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <ScienceIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Tests Manager
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId} {testKey ? `• Test: ${testKey}` : ''}
            </Typography>
        </Box>
    );
}
