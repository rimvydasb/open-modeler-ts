import {Container, Typography, Box, Chip} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function HealthPage() {
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <CheckCircleIcon sx={{fontSize: 64, color: 'success.main'}} />
                <Typography variant="h4">Health Check</Typography>
                <Chip label="OK" color="success" variant="outlined" />
                <Typography variant="body2" color="text.secondary">
                    EdgeRules Modeler is running.
                </Typography>
            </Box>
        </Container>
    );
}
