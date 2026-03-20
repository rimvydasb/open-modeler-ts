'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';
import theme from '@/theme/theme';
import { SnackbarProvider } from 'notistack';

interface MuiProviderProps {
    children: ReactNode;
}

export default function MuiProvider({ children }: MuiProviderProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                {children}
            </SnackbarProvider>
        </ThemeProvider>
    );
}
