import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import { CreateBase, useResourceContext } from 'ra-core';
import { CreateView, editFieldTypes, Loading } from 'react-admin';
import type { CreateProps, CreateViewProps } from 'ra-ui-materialui';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';
import { InferredElement } from './InferredElement';

export const CreateGuesser = (props: CreateProps & { enableLog?: boolean }) => {
    const {
        mutationOptions,
        resource,
        record,
        transform,
        redirect,
        disableAuthentication,
        ...rest
    } = props;
    return (
        <CreateBase
            resource={resource}
            record={record}
            redirect={redirect}
            transform={transform}
            mutationOptions={mutationOptions}
            disableAuthentication={disableAuthentication}
        >
            <CreateGuesserView {...rest} />
        </CreateBase>
    );
};

export const CreateGuesserView = (
    props: CreateViewProps & {
        enableLog?: boolean;
    }
) => {
    const { data: schema, error, isPending } = useAPISchema();
    const resource = useResourceContext();
    const [child, setChild] = React.useState<ReactNode>(null);
    if (!resource) {
        throw new Error('CreateGuesser must be used withing a ResourceContext');
    }
    const { enableLog = process.env.NODE_ENV === 'development', ...rest } =
        props;

    React.useEffect(() => {
        if (isPending || error) {
            return;
        }
        const resourceDefinition = schema.definitions?.[resource];
        const requiredFields = resourceDefinition?.required || [];
        if (!resourceDefinition || !resourceDefinition.properties) {
            throw new Error(
                `The resource ${resource} is not defined in the API schema`
            );
        }
        const inferredInputs = Object.keys(resourceDefinition.properties)
            .filter((source: string) => source !== 'id')
            .filter(
                source =>
                    resourceDefinition.properties![source].format !== 'tsvector'
            )
            .map((source: string) =>
                inferElementFromType({
                    name: source,
                    types: editFieldTypes,
                    description:
                        resourceDefinition.properties![source].description,
                    format: resourceDefinition.properties![source].format,
                    type: (resourceDefinition.properties &&
                    resourceDefinition.properties[source] &&
                    typeof resourceDefinition.properties[source].type ===
                        'string'
                        ? resourceDefinition.properties![source].type
                        : 'string') as string,
                    requiredFields,
                    schema,
                })
            );
        const inferredForm = new InferredElement(
            editFieldTypes.form,
            null,
            inferredInputs
        );
        setChild(inferredForm.getElement());
        if (!enableLog) return;

        const representation = inferredForm.getRepresentation();

        const components = ['Create']
            .concat(
                Array.from(
                    new Set(
                        Array.from(representation.matchAll(/<([^/\s>]+)/g))
                            .map(match => match[1])
                            .filter(component => component !== 'span')
                    )
                )
            )
            .sort();

        const warnings = inferredInputs
            .map(inferredInput => inferredInput.getWarning())
            .filter(warning => warning != null);

        // eslint-disable-next-line no-console
        console.log(
            `Guessed Create:
            
import { ${components.join(', ')} } from 'react-admin';
            
export const ${capitalize(singularize(resource))}Create = () => (
    <Create>
${representation}
    </Create>
);${
                warnings.length > 0
                    ? warnings.map(warning => `\n\n${warning}`).join('')
                    : ''
            }`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return <CreateView {...rest}>{child}</CreateView>;
};
