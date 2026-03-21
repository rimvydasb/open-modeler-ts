'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface DeployManagerViewProps {
    projectId: string;
}

export default function DeployManagerView({projectId}: DeployManagerViewProps) {
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
            <RocketLaunchIcon sx={{fontSize: 64, color: 'text.disabled'}} />
            <Typography variant="h6" color="text.secondary">
                Deployment Manager
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Project: {projectId} — Coming Soon
            </Typography>
        </Box>
    );
}
