import { useNotify } from 'ra-core';

export const defaultMFAOnError =
    (notify: ReturnType<typeof useNotify>) => (error: Error) =>
        notify(
            typeof error === 'string'
                ? error
                : typeof error === 'undefined' || !error.message
                ? 'ra.auth.sign_in_error'
                : error.message,
            {
                type: 'error',
                messageArgs: {
                    _:
                        typeof error === 'string'
                            ? error
                            : error && error.message
                            ? error.message
                            : undefined,
                },
            }
        );
