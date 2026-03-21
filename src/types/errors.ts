export interface AppError {
    code: string;
    message: string;
    details?: unknown;
}

export class ValidationError implements AppError {
    code: string;
    message: string;
    details?: unknown;

    constructor(message: string, details?: unknown) {
        this.code = 'VALIDATION_ERROR';
        this.message = message;
        this.details = details;
    }
}

export class ServiceError implements AppError {
    code: string;
    message: string;
    details?: unknown;

    constructor(code: string, message: string, details?: unknown) {
        this.code = code;
        this.message = message;
        this.details = details;
    }
}

export class NotFoundError implements AppError {
    code = 'NOT_FOUND';
    message: string;
    details?: unknown;

    constructor(entity: string, id: string) {
        this.message = `${entity} with id "${id}" not found`;
        this.details = {entity, id};
    }
}
