import type {AppError} from './errors';

export type Result<T> = {ok: true; data: T} | {ok: false; error: AppError};

export function success<T>(data: T): Result<T> {
    return {ok: true, data};
}

export function failure<T>(error: AppError): Result<T> {
    return {ok: false, error};
}
