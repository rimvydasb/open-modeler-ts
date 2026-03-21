'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableChartIcon from '@mui/icons-material/TableChart';

interface VisualEditorViewProps {
    projectId: string;
    contextKey: string | null;
}

export default function VisualEditorView({projectId, contextKey}: VisualEditorViewProps) {
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
            <TableChartIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Visual Editor
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId} {contextKey ? `• Context: ${contextKey}` : ''}
            </Typography>
        </Box>
    );
}
