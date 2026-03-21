'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface FlowEditorViewProps {
    projectId: string;
    nodeKey: string | null;
}

export default function FlowEditorView({projectId, nodeKey}: FlowEditorViewProps) {
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
            <AccountTreeIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Flow Editor
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId} {nodeKey ? `• Node: ${nodeKey}` : ''}
            </Typography>
        </Box>
    );
}
