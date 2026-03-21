'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CodeIcon from '@mui/icons-material/Code';

interface CodeEditorViewProps {
    projectId: string;
    fileKey: string | null;
}

export default function CodeEditorView({projectId, fileKey}: CodeEditorViewProps) {
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
            <CodeIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Code Editor
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId} {fileKey ? `• File: ${fileKey}` : ''}
            </Typography>
        </Box>
    );
}
