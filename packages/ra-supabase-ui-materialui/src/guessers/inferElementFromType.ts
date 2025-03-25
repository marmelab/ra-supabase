import { InferredElement, required, type InferredTypeMap } from 'ra-core';
import { pluralize } from 'inflection';
import type { OpenAPIV2 } from 'openapi-types';

const hasType = (type, types) => typeof types[type] !== 'undefined';

export const inferElementFromType = ({
    name,
    description,
    format,
    type,
    requiredFields,
    types,
    props,
    schema,
}: {
    name: string;
    types: InferredTypeMap;
    description?: string;
    format?: string;
    type?: string;
    requiredFields?: string[];
    props?: any;
    schema: OpenAPIV2.Document;
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
        const referenceResourceDefinition = schema.definitions?.[reference];
        if (!referenceResourceDefinition) {
            throw new Error(
                `The referenced resource ${reference} is not defined in the API schema`
            );
        }
        const referenceRecordRepresentationField =
            inferRecordRepresentationField(referenceResourceDefinition);

        return new InferredElement(
            types.reference,
            {
                source: name,
                reference,
                ...props,
            },
            [
                new InferredElement(
                    types.autocompleteInput,
                    referenceRecordRepresentationField
                        ? {
                              optionText: referenceRecordRepresentationField,
                          }
                        : {}
                ),
            ]
        );
    }
    if (
        name.substring(name.length - 4) === '_ids' &&
        hasType('reference', types)
    ) {
        const reference = pluralize(name.substr(0, name.length - 4));
        const referenceResourceDefinition = schema.definitions?.[reference];
        if (!referenceResourceDefinition) {
            throw new Error(
                `The referenced resource ${reference} is not defined in the API schema`
            );
        }
        const referenceRecordRepresentationField =
            inferRecordRepresentationField(referenceResourceDefinition);

        return new InferredElement(
            types.referenceArray,
            {
                source: name,
                reference,
                ...props,
            },
            [
                new InferredElement(
                    types.autocompleteArrayInput,
                    referenceRecordRepresentationField
                        ? {
                              optionText: referenceRecordRepresentationField,
                          }
                        : {}
                ),
            ]
        );
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
                ...props,
            });
        }
        if (['url', 'website'].includes(name) && hasType('url', types)) {
            return new InferredElement(types.url, {
                source: name,
                validate,
                ...props,
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
                ...props,
            });
        }
    }
    if (type === 'integer' && hasType('number', types)) {
        return new InferredElement(types.number, {
            source: name,
            validate,
            ...props,
        });
    }
    if (type && hasType(type, types)) {
        return new InferredElement(types[type], {
            source: name,
            validate,
            ...props,
        });
    }
    return new InferredElement(types.string, {
        source: name,
        validate,
        ...props,
    });
};

const inferRecordRepresentationField = (
    referenceResourceDefinition: OpenAPIV2.SchemaObject
) => {
    if (referenceResourceDefinition.properties?.name != null) {
        return 'name';
    }
    if (referenceResourceDefinition.properties?.title != null) {
        return 'title';
    }
    if (referenceResourceDefinition.properties?.label != null) {
        return 'label';
    }
    if (referenceResourceDefinition.properties?.reference != null) {
        return 'reference';
    }
    if (referenceResourceDefinition.properties?.email != null) {
        return 'email';
    }
};
