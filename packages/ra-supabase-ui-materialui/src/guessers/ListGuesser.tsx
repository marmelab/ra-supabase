import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import {
    useResourceContext,
    Loading,
    ListBase,
    ListView,
    InferredElement,
    listFieldTypes,
} from 'react-admin';
import type { ListProps, ListViewProps } from 'react-admin';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';

export const ListGuesser = (props: ListProps & { enableLog?: boolean }) => {
    const {
        debounce,
        disableAuthentication,
        disableSyncWithLocation,
        exporter,
        filter,
        filterDefaultValues,
        perPage,
        queryOptions,
        resource,
        sort,
        storeKey,
        ...rest
    } = props;
    return (
        <ListBase
            debounce={debounce}
            disableAuthentication={disableAuthentication}
            disableSyncWithLocation={disableSyncWithLocation}
            exporter={exporter}
            filter={filter}
            filterDefaultValues={filterDefaultValues}
            perPage={perPage}
            queryOptions={queryOptions}
            resource={resource}
            sort={sort}
            storeKey={storeKey}
        >
            <ListGuesserView {...rest} />
        </ListBase>
    );
};

export const ListGuesserView = (
    props: ListViewProps & {
        enableLog?: boolean;
    }
) => {
    const { data: schema, error, isPending } = useAPISchema();
    const resource = useResourceContext();
    const [child, setChild] = React.useState<ReactNode>(null);
    if (!resource) {
        throw new Error('ListGuesser must be used withing a ResourceContext');
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
        const inferredInputs = Object.keys(resourceDefinition.properties).map(
            (source: string) =>
                inferElementFromType({
                    name: source,
                    types: listFieldTypes,
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
            listFieldTypes.table,
            null,
            inferredInputs
        );
        setChild(inferredForm.getElement());
        if (!enableLog) return;

        const representation = inferredForm.getRepresentation();

        const components = ['List']
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
            `Guessed List:
            
import { ${components.join(', ')} } from 'react-admin';
            
export const ${capitalize(singularize(resource))}List = () => (
    <List>
${representation}
    </List>
);`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return <ListView {...rest}>{child}</ListView>;
};
