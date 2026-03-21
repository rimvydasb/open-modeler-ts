'use client';

import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {ProjectsService, ProjectsRepository} from '@/lib/projects';
import type {CreateProjectInput, ProjectListItem, ExampleProjectManifest} from '@/lib/projects';
import {getStorage} from '@/lib/storage';

function getProjectsService(): ProjectsService {
    const storage = getStorage();
    const repository = new ProjectsRepository(storage);
    return new ProjectsService(repository, storage);
}

const PROJECTS_QUERY_KEY = ['projects'] as const;
const EXAMPLES_QUERY_KEY = ['examples'] as const;

export function useProjects() {
    const service = getProjectsService();

    return useQuery({
        queryKey: PROJECTS_QUERY_KEY,
        queryFn: async (): Promise<ProjectListItem[]> => {
            const result = await service.listProjects();
            if (!result.ok) throw new Error(result.error.message);
            return result.data;
        },
    });
}

export function useExampleProjects() {
    return useQuery({
        queryKey: EXAMPLES_QUERY_KEY,
        queryFn: async (): Promise<ExampleProjectManifest[]> => {
            const response = await fetch('/examples/manifest.json');
            if (!response.ok) throw new Error('Failed to load example projects');
            return response.json();
        },
        staleTime: Infinity,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    const service = getProjectsService();

    return useMutation({
        mutationFn: async (input: CreateProjectInput) => {
            const result = await service.createProject(input);
            if (!result.ok) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: PROJECTS_QUERY_KEY});
        },
    });
}

export function useAddExampleToWorkspace() {
    const queryClient = useQueryClient();
    const service = getProjectsService();

    return useMutation({
        mutationFn: async (example: ExampleProjectManifest) => {
            const response = await fetch(example.sourceFile);
            if (!response.ok) throw new Error(`Failed to fetch ${example.sourceFile}`);
            const sourceContent = await response.text();

            const result = await service.createProjectFromSource(
                {
                    name: example.name,
                    description: example.description,
                    tags: {exampleId: example.id},
                },
                sourceContent,
            );
            if (!result.ok) throw new Error(result.error.message);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: PROJECTS_QUERY_KEY});
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    const service = getProjectsService();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await service.deleteProject(id);
            if (!result.ok) throw new Error(result.error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: PROJECTS_QUERY_KEY});
        },
    });
}
