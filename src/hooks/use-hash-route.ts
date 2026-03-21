'use client';

import {useState, useEffect, useCallback} from 'react';

export type ViewType =
    | 'landing'
    | 'health'
    | 'flow'
    | 'visual-editor'
    | 'code-editor'
    | 'tests'
    | 'types'
    | 'app'
    | 'deploy';

export interface RouteState {
    view: ViewType;
    projectId: string | null;
    key: string | null;
}

const VALID_SEGMENT = /^[a-zA-Z0-9_-]+$/;

function validateSegment(segment: string): string | null {
    if (!segment) return null;
    return VALID_SEGMENT.test(segment) ? segment.toLowerCase() : null;
}

function parseHash(hash: string): RouteState {
    const raw = hash.replace(/^#\/?/, '').replace(/\/+$/, '');

    if (!raw) {
        return {view: 'landing', projectId: null, key: null};
    }

    const segments = raw.split('/').filter(Boolean);
    const viewSegment = segments[0]?.toLowerCase();

    switch (viewSegment) {
        case 'health':
            return {view: 'health', projectId: null, key: null};

        case 'flow':
        case 'visual-editor':
        case 'code-editor':
        case 'tests':
        case 'types':
        case 'app':
        case 'deploy': {
            const projectId = validateSegment(segments[1] ?? '');
            const key = validateSegment(segments[2] ?? '');
            if (!projectId) {
                return {view: 'landing', projectId: null, key: null};
            }
            return {view: viewSegment as ViewType, projectId, key};
        }

        default:
            return {view: 'landing', projectId: null, key: null};
    }
}

export function useHashRoute(): RouteState {
    const [route, setRoute] = useState<RouteState>(() => {
        if (typeof window === 'undefined') {
            return {view: 'landing', projectId: null, key: null};
        }
        return parseHash(window.location.hash);
    });

    const handleHashChange = useCallback(() => {
        setRoute(parseHash(window.location.hash));
    }, []);

    useEffect(() => {
        setRoute(parseHash(window.location.hash));
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [handleHashChange]);

    return route;
}

export function navigateTo(path: string): void {
    if (path === '/' || path === '') {
        // Remove hash entirely from URL
        history.pushState(null, '', window.location.pathname + window.location.search);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
        window.location.hash = path;
    }
}

export type ModuleTab = 'editor' | 'tests' | 'types' | 'app' | 'deploy';

export function getActiveTab(view: ViewType): ModuleTab | null {
    switch (view) {
        case 'flow':
        case 'visual-editor':
        case 'code-editor':
            return 'editor';
        case 'tests':
            return 'tests';
        case 'types':
            return 'types';
        case 'app':
            return 'app';
        case 'deploy':
            return 'deploy';
        default:
            return null;
    }
}
