import {ValidationError} from '@/types/errors';
import type {CreateProjectInput, StoredProject} from './projects-types';

export interface ValidationResult {
    valid: boolean;
    error?: ValidationError;
}

const MAX_NAME_LENGTH = 100;
const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/;

export function validateCreate(input: CreateProjectInput, existingProjects: StoredProject[]): ValidationResult {
    if (!input.name || input.name.trim().length === 0) {
        return {valid: false, error: new ValidationError('Project name is required')};
    }

    const trimmedName = input.name.trim();

    if (trimmedName.length > MAX_NAME_LENGTH) {
        return {
            valid: false,
            error: new ValidationError(`Project name must be ${MAX_NAME_LENGTH} characters or less`),
        };
    }

    if (!NAME_PATTERN.test(trimmedName)) {
        return {
            valid: false,
            error: new ValidationError(
                'Project name must start with a letter or number and contain only letters, numbers, spaces, hyphens, or underscores',
            ),
        };
    }

    const nameExists = existingProjects.some(
        (project) => project.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (nameExists) {
        return {
            valid: false,
            error: new ValidationError(`A project named "${trimmedName}" already exists`),
        };
    }

    return {valid: true};
}
