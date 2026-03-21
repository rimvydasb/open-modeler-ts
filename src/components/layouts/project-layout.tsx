'use client';

import {ReactNode} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import EditIcon from '@mui/icons-material/Edit';
import ScienceIcon from '@mui/icons-material/Science';
import CategoryIcon from '@mui/icons-material/Category';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountMenu from '@/components/common/account-menu';
import {type ModuleTab, navigateTo} from '@/hooks/use-hash-route';

interface ProjectLayoutProps {
    children: ReactNode;
    projectId: string;
    projectName?: string;
    activeTab: ModuleTab;
}

const MODULE_TABS: {value: ModuleTab; label: string; icon: ReactNode; disabled?: boolean}[] = [
    {value: 'editor', label: 'Editor', icon: <EditIcon />},
    {value: 'tests', label: 'Tests', icon: <ScienceIcon />},
    {value: 'types', label: 'Types', icon: <CategoryIcon />},
    {value: 'app', label: 'App', icon: <VisibilityIcon />},
    {value: 'deploy', label: 'Deploy', icon: <RocketLaunchIcon />, disabled: true},
];

const TAB_DEFAULT_ROUTES: Record<ModuleTab, string> = {
    editor: 'flow',
    tests: 'tests',
    types: 'types',
    app: 'app',
    deploy: 'deploy',
};

export default function ProjectLayout({children, projectId, projectName, activeTab}: ProjectLayoutProps) {
    const handleTabChange = (_event: React.SyntheticEvent, newValue: ModuleTab) => {
        const route = TAB_DEFAULT_ROUTES[newValue];
        navigateTo(`${route}/${projectId}`);
    };

    const handleBackToWorkspace = () => {
        navigateTo('/');
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar variant="dense" sx={{gap: 1}}>
                    <Tooltip title="Back to Workspace">
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleBackToWorkspace}
                            aria-label="Back to workspace"
                            size="small"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>

                    <AutoFixHighIcon fontSize="small" />
                    <Typography variant="subtitle2" noWrap sx={{mr: 1}}>
                        EdgeRules
                    </Typography>

                    <Divider orientation="vertical" flexItem sx={{borderColor: 'rgba(255,255,255,0.3)'}} />

                    <Typography variant="subtitle1" noWrap sx={{mr: 2, fontWeight: 500}}>
                        {projectName ?? projectId}
                    </Typography>

                    <Box sx={{flexGrow: 1}} />

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        textColor="inherit"
                        indicatorColor="secondary"
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                minHeight: 48,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                            },
                        }}
                    >
                        {MODULE_TABS.map((tab) => (
                            <Tab
                                key={tab.value}
                                value={tab.value}
                                label={tab.label}
                                icon={tab.icon as React.ReactElement}
                                iconPosition="start"
                                disabled={tab.disabled}
                                sx={{
                                    opacity: tab.disabled ? 0.5 : 1,
                                }}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{flexGrow: 1}} />

                    <AccountMenu />
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    pt: '48px',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
