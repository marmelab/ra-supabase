import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import {
    useResourceContext,
    Loading,
    EditBase,
    EditView,
    InferredElement,
    editFieldTypes,
} from 'react-admin';
import type { EditProps, EditViewProps } from 'react-admin';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';

export const EditGuesser = (props: EditProps & { enableLogs?: boolean }) => {
    const {
        resource,
        id,
        mutationMode,
        mutationOptions,
        queryOptions,
        redirect,
        transform,
        disableAuthentication,
        ...rest
    } = props;
    return (
        <EditBase
            resource={resource}
            id={id}
            mutationMode={mutationMode}
            mutationOptions={mutationOptions}
            queryOptions={queryOptions}
            redirect={redirect}
            transform={transform}
            disableAuthentication={disableAuthentication}
        >
            <EditGuesserView {...rest} />
        </EditBase>
    );
};

export const EditGuesserView = (
    props: EditViewProps & {
        enableLog?: boolean;
    }
) => {
    const { data: schema, error, isPending } = useAPISchema();
    const resource = useResourceContext();
    const [child, setChild] = React.useState<ReactNode>(null);
    if (!resource) {
        throw new Error('EditGuesser must be used withing a ResourceContext');
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
        if (!resourceDefinition || !resourceDefinition.properties) {
            return;
        }
        const inferredInputs = Object.keys(resourceDefinition.properties)
            .filter((source: string) => source !== 'id')
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

        const components = ['Edit']
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

        // eslint-disable-next-line no-console
        console.log(
            `Guessed Edit:
            
import { ${components.join(', ')} } from 'react-admin';
            
export const ${capitalize(singularize(resource))}Edit = () => (
    <Edit>
${representation}
    </Edit>
);`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return <EditView {...rest}>{child}</EditView>;
};
