'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface AppPreviewViewProps {
    projectId: string;
}

export default function AppPreviewView({projectId}: AppPreviewViewProps) {
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
            <VisibilityIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                App Preview
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId}
            </Typography>
        </Box>
    );
}
