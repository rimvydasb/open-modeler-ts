'use client';

import {ReactNode, useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PublicIcon from '@mui/icons-material/Public';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PortraitIcon from '@mui/icons-material/Portrait';
import AccountMenu from '@/components/common/account-menu';

const SIDEBAR_WIDTH = 240;

type SidebarSection = 'public-library' | 'company-workspace' | 'my-workspace';

interface LandingLayoutProps {
    children: ReactNode;
    activeSection?: SidebarSection;
    onSectionChange?: (section: SidebarSection) => void;
}

export default function LandingLayout({children, activeSection, onSectionChange}: LandingLayoutProps) {
    const [section, setSection] = useState<SidebarSection>(activeSection ?? 'public-library');

    const handleSectionChange = (newSection: SidebarSection) => {
        setSection(newSection);
        onSectionChange?.(newSection);
    };

    return (
        <Box sx={{display: 'flex', minHeight: '100vh'}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar>
                    <AutoFixHighIcon sx={{mr: 1}} />
                    <Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
                        EdgeRules Modeler
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{
                    width: SIDEBAR_WIDTH,
                    flexShrink: 0,
                    borderRight: 1,
                    borderColor: 'divider',
                    pt: '64px',
                    position: 'fixed',
                    height: '100vh',
                    bgcolor: 'background.paper',
                }}
            >
                <List>
                    <ListItemButton
                        selected={section === 'public-library'}
                        onClick={() => handleSectionChange('public-library')}
                    >
                        <ListItemIcon>
                            <PublicIcon />
                        </ListItemIcon>
                        <ListItemText primary="Public Library" />
                    </ListItemButton>

                    <Tooltip title="Coming Soon" placement="right">
                        <span>
                            <ListItemButton disabled>
                                <ListItemIcon>
                                    <HomeWorkIcon />
                                </ListItemIcon>
                                <ListItemText primary="My Company Workspace" />
                            </ListItemButton>
                        </span>
                    </Tooltip>

                    <ListItemButton
                        selected={section === 'my-workspace'}
                        onClick={() => handleSectionChange('my-workspace')}
                    >
                        <ListItemIcon>
                            <PortraitIcon />
                        </ListItemIcon>
                        <ListItemText primary="My Workspace" />
                    </ListItemButton>
                </List>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${SIDEBAR_WIDTH}px`,
                    pt: '64px',
                    p: 3,
                    mt: '64px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
