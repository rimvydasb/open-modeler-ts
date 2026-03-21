import {validateCreate} from '../projects-validator';
import type {StoredProject} from '../projects-types';

function makeProject(overrides: Partial<StoredProject> = {}): StoredProject {
    return {
        id: 'test-id',
        name: 'Existing Project',
        description: 'A test project',
        tags: {},
        assets: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('ProjectsValidator', () => {
    describe('validateCreate', () => {
        it('should accept a valid project name', () => {
            const result = validateCreate({name: 'My New Project'}, []);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should reject an empty name', () => {
            const result = validateCreate({name: ''}, []);
            expect(result.valid).toBe(false);
            expect(result.error?.message).toBe('Project name is required');
        });

        it('should reject a whitespace-only name', () => {
            const result = validateCreate({name: '   '}, []);
            expect(result.valid).toBe(false);
            expect(result.error?.message).toBe('Project name is required');
        });

        it('should reject a name that is too long', () => {
            const longName = 'A'.repeat(101);
            const result = validateCreate({name: longName}, []);
            expect(result.valid).toBe(false);
            expect(result.error?.message).toContain('100 characters');
        });

        it('should reject a name starting with a special character', () => {
            const result = validateCreate({name: '-bad-name'}, []);
            expect(result.valid).toBe(false);
            expect(result.error?.message).toContain('must start with a letter or number');
        });

        it('should accept names with hyphens and underscores', () => {
            const result = validateCreate({name: 'My-Project_v2'}, []);
            expect(result.valid).toBe(true);
        });

        it('should reject duplicate names (case-insensitive)', () => {
            const existing = [makeProject({name: 'Existing Project'})];
            const result = validateCreate({name: 'existing project'}, existing);
            expect(result.valid).toBe(false);
            expect(result.error?.message).toContain('already exists');
        });

        it('should accept a unique name among existing projects', () => {
            const existing = [makeProject({name: 'Other Project'})];
            const result = validateCreate({name: 'New Project'}, existing);
            expect(result.valid).toBe(true);
        });
    });
});
