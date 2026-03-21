'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import {useSnackbar} from 'notistack';
import {useProjects, useExampleProjects, useCreateProject, useAddExampleToWorkspace, useDeleteProject} from '@/hooks/use-projects';
import {navigateTo} from '@/hooks/use-hash-route';
import {formatRelativeTime} from '@/lib/utils';
import type {ExampleProjectManifest} from '@/lib/projects';

type SidebarSection = 'public-library' | 'company-workspace' | 'my-workspace';

interface LandingViewProps {
    activeSection?: SidebarSection;
}

export default function LandingView({activeSection = 'public-library'}: LandingViewProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const {enqueueSnackbar} = useSnackbar();

    const section = activeSection;

    const {data: projects, isLoading: projectsLoading} = useProjects();
    const {data: examples, isLoading: examplesLoading} = useExampleProjects();
    const createProject = useCreateProject();
    const addExample = useAddExampleToWorkspace();
    const deleteProject = useDeleteProject();

    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;
        createProject.mutate(
            {name: newProjectName.trim(), description: newProjectDescription.trim() || undefined},
            {
                onSuccess: (project) => {
                    setCreateDialogOpen(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                    enqueueSnackbar(`Project "${project.name}" created`, {variant: 'success'});
                    navigateTo(`flow/${project.id}`);
                },
                onError: (error) => {
                    enqueueSnackbar(error.message, {variant: 'error'});
                },
            },
        );
    };

    const handleAddExample = (example: ExampleProjectManifest) => {
        addExample.mutate(example, {
            onSuccess: (project) => {
                enqueueSnackbar(`"${example.name}" added to workspace`, {variant: 'success'});
                navigateTo(`flow/${project.id}`);
            },
            onError: (error) => {
                enqueueSnackbar(error.message, {variant: 'error'});
            },
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteTargetId) return;
        deleteProject.mutate(deleteTargetId, {
            onSuccess: () => {
                enqueueSnackbar(`Project "${deleteTargetName}" deleted`, {variant: 'info'});
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
            },
            onError: (error) => {
                enqueueSnackbar(error.message, {variant: 'error'});
            },
        });
    };

    const openDeleteDialog = (id: string, name: string) => {
        setDeleteTargetId(id);
        setDeleteTargetName(name);
        setDeleteDialogOpen(true);
    };

    return (
        <>
            {section === 'public-library' && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Public Library
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        Explore example projects to learn EdgeRules Modeler capabilities.
                    </Typography>

                    {examplesLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: 2,
                            }}
                        >
                            {examples?.map((example) => (
                                <Card key={example.id} variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{example.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {example.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<LibraryAddIcon />}
                                            onClick={() => handleAddExample(example)}
                                            disabled={addExample.isPending}
                                        >
                                            Add to Workspace
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {section === 'my-workspace' && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        My Workspace
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                        Your local projects stored in this browser.
                    </Typography>

                    {projectsLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                            <CircularProgress />
                        </Box>
                    ) : projects && projects.length > 0 ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: 2,
                            }}
                        >
                            {projects.map((project) => (
                                <Card key={project.id} variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{project.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {project.description || 'No description'}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{mt: 1, display: 'block'}}>
                                            Last edited: {formatRelativeTime(project.updatedAt)} •{' '}
                                            {project.assetCount} asset{project.assetCount !== 1 ? 's' : ''}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<OpenInNewIcon />}
                                            onClick={() => navigateTo(`flow/${project.id}`)}
                                        >
                                            Open
                                        </Button>
                                        <Tooltip title="Delete project">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => openDeleteDialog(project.id, project.name)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{textAlign: 'center', mt: 4}}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                No projects yet. Create one or add an example from the Public Library.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateDialogOpen(true)}
                                sx={{mt: 2}}
                            >
                                Create Project
                            </Button>
                        </Box>
                    )}

                    <Fab
                        color="primary"
                        aria-label="New Project"
                        sx={{position: 'fixed', bottom: 24, right: 24}}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        <AddIcon />
                    </Fab>
                </Box>
            )}

            {section === 'company-workspace' && (
                <Box sx={{textAlign: 'center', mt: 8}}>
                    <Typography variant="h6" color="text.secondary">
                        Company Workspace
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Coming Soon — team-based projects via Git or Cloud API.
                    </Typography>
                </Box>
            )}

            {/* Create Project Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Project Name"
                        fullWidth
                        required
                        value={newProjectName}
                        onChange={(event) => setNewProjectName(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleCreateProject()}
                    />
                    <TextField
                        margin="dense"
                        label="Description (optional)"
                        fullWidth
                        multiline
                        rows={2}
                        value={newProjectDescription}
                        onChange={(event) => setNewProjectDescription(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim() || createProject.isPending}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete &quot;{deleteTargetName}&quot;? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                        disabled={deleteProject.isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
