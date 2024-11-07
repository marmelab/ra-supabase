import { InferredElement, required } from 'react-admin';
import type { InferredTypeMap } from 'react-admin';
import { pluralize } from 'inflection';

const hasType = (type, types) => typeof types[type] !== 'undefined';

export const inferElementFromType = ({
    name,
    description,
    format,
    type,
    requiredFields,
    types,
}: {
    name: string;
    types: InferredTypeMap;
    description?: string;
    format?: string;
    type?: string;
    requiredFields?: string[];
}) => {
    if (name === 'id' && hasType('id', types)) {
        return new InferredElement(types.id, { source: 'id' });
    }
    const validate = requiredFields?.includes(name) ? [required()] : undefined;
    if (
        description?.startsWith('Note:\nThis is a Foreign Key to') &&
        hasType('reference', types)
    ) {
        const reference = description.split('`')[1].split('.')[0];
        return new InferredElement(types.reference, {
            source: name,
            reference,
        });
    }
    if (
        name.substring(name.length - 4) === '_ids' &&
        hasType('reference', types)
    ) {
        const reference = pluralize(name.substr(0, name.length - 4));
        return new InferredElement(types.referenceArray, {
            source: name,
            reference,
        });
    }
    if (type === 'array') {
        // FIXME instrospect further
        return new InferredElement(types.string, {
            source: name,
            validate,
        });
    }
    if (type === 'string') {
        if (name === 'email' && hasType('email', types)) {
            return new InferredElement(types.email, {
                source: name,
                validate,
            });
        }
        if (['url', 'website'].includes(name) && hasType('url', types)) {
            return new InferredElement(types.url, {
                source: name,
                validate,
            });
        }
        if (
            format &&
            [
                'timestamp with time zone',
                'timestamp without time zone',
            ].includes(format) &&
            hasType('date', types)
        ) {
            return new InferredElement(types.date, {
                source: name,
                validate,
            });
        }
    }
    if (type === 'integer' && hasType('number', types)) {
        return new InferredElement(types.number, {
            source: name,
            validate,
        });
    }
    if (type && hasType(type, types)) {
        return new InferredElement(types[type], {
            source: name,
            validate,
        });
    }
    return new InferredElement(types.string, {
        source: name,
        validate,
    });
};