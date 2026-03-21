'use client';

import {useHashRoute, getActiveTab} from '@/hooks/use-hash-route';
import LandingLayout from '@/components/layouts/landing-layout';
import ProjectLayout from '@/components/layouts/project-layout';
import LandingView from '@/components/views/landing/landing-view';
import FlowEditorView from '@/components/views/flow-editor/flow-editor-view';
import VisualEditorView from '@/components/views/visual-editor/visual-editor-view';
import CodeEditorView from '@/components/views/code-editor/code-editor-view';
import TestsManagerView from '@/components/views/tests-manager/tests-manager-view';
import TypesEditorView from '@/components/views/types-editor/types-editor-view';
import AppPreviewView from '@/components/views/app-preview/app-preview-view';
import DeployManagerView from '@/components/views/deploy-manager/deploy-manager-view';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';

function HealthView() {
    return (
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
    );
}

function renderProjectView(view: string, projectId: string, key: string | null) {
    switch (view) {
        case 'flow':
            return <FlowEditorView projectId={projectId} nodeKey={key} />;
        case 'visual-editor':
            return <VisualEditorView projectId={projectId} contextKey={key} />;
        case 'code-editor':
            return <CodeEditorView projectId={projectId} fileKey={key} />;
        case 'tests':
            return <TestsManagerView projectId={projectId} testKey={key} />;
        case 'types':
            return <TypesEditorView projectId={projectId} />;
        case 'app':
            return <AppPreviewView projectId={projectId} />;
        case 'deploy':
            return <DeployManagerView projectId={projectId} />;
        default:
            return null;
    }
}

export default function Home() {
    const route = useHashRoute();

    if (route.view === 'landing') {
        return (
            <LandingLayout>
                {(section) => <LandingView activeSection={section} />}
            </LandingLayout>
        );
    }

    if (route.view === 'health') {
        return <HealthView />;
    }

    const activeTab = getActiveTab(route.view);
    if (activeTab && route.projectId) {
        return (
            <ProjectLayout projectId={route.projectId} activeTab={activeTab}>
                {renderProjectView(route.view, route.projectId, route.key)}
            </ProjectLayout>
        );
    }

    return (
        <LandingLayout>
            {(section) => <LandingView activeSection={section} />}
        </LandingLayout>
    );
}
