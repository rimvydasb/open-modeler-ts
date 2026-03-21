'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CategoryIcon from '@mui/icons-material/Category';

interface TypesEditorViewProps {
    projectId: string;
}

export default function TypesEditorView({projectId}: TypesEditorViewProps) {
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
            <CategoryIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Types Editor
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId}
            </Typography>
        </Box>
    );
}
