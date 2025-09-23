import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import { ListBase, useResourceContext } from 'ra-core';
import {
    listFieldTypes,
    type ListProps,
    ListView,
    type ListViewProps,
    Loading,
    SearchInput,
} from 'ra-ui-materialui';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';
import { InferredElement } from './InferredElement';
import { editFieldTypes } from './editFieldTypes';

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
    const [filters, setFilters] = React.useState<
        React.ReactElement[] | undefined
    >(undefined);
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
        if (!resourceDefinition || !resourceDefinition.properties) {
            throw new Error(
                `The resource ${resource} is not defined in the API schema`
            );
        }
        const inferredFields = Object.keys(resourceDefinition.properties)
            .filter(
                source =>
                    resourceDefinition.properties![source].format !== 'tsvector'
            )
            .map((source: string) =>
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
                    schema,
                })
            );
        const inferredTable = new InferredElement(
            listFieldTypes.table,
            null,
            inferredFields
        );
        setChild(inferredTable.getElement());

        const rowFilters =
            schema!
                .paths![`/${resource}`].get!.parameters?.filter(obj =>
                    obj['$ref'].includes('rowFilter')
                )
                .map(obj => obj['$ref'].split('.').pop()) ?? [];
        const inferredInputsForFilters = rowFilters
            .filter(
                source =>
                    resourceDefinition.properties![source].format !== 'tsvector'
            )
            .map(source => {
                const field = resourceDefinition.properties![source];
                return inferElementFromType({
                    name: source,
                    types: editFieldTypes,
                    description: field.description,
                    format: field.format,
                    type: field.type as string,
                    schema,
                });
            });
        if (
            rowFilters.some(
                source =>
                    resourceDefinition.properties![source].format === 'tsvector'
            )
        ) {
            const fullTextSearchSource = rowFilters.find(
                source =>
                    resourceDefinition.properties![source].format === 'tsvector'
            );
            const field = resourceDefinition.properties![fullTextSearchSource!];
            inferredInputsForFilters.unshift(
                inferElementFromType({
                    name: `${fullTextSearchSource!}@fts`,
                    types: {
                        string: {
                            component: SearchInput,
                            representation: props =>
                                `<SearchInput alwaysOn source="${props.source}" />`,
                        },
                    },
                    description: field.description,
                    format: 'tsvector',
                    props: {
                        alwaysOn: true,
                        parse: value => (value ? `${value}:*` : undefined),
                        format: value =>
                            value ? value.substring(0, value.length - 2) : '',
                    },
                    type: field.type as string,
                    schema,
                })
            );
        }
        if (inferredInputsForFilters.length > 0) {
            const filterElements = inferredInputsForFilters
                .map(inferredInput => inferredInput.getElement())
                .filter(el => el != null) as React.ReactElement[];
            setFilters(filterElements);
        }

        if (!enableLog) return;

        const tableRepresentation = inferredTable.getRepresentation();

        const filterRepresentation =
            inferredInputsForFilters.length > 0
                ? `const filters = [
${inferredInputsForFilters
    .map(inferredInput => '    ' + inferredInput.getRepresentation())
    .join(',\n')}
];
`
                : '';

        const fieldComponents = Array.from(
            tableRepresentation.matchAll(/<([^/\s>]+)/g)
        )
            .map(match => match[1])
            .filter(component => component !== 'span');
        const filterComponents = Array.from(
            filterRepresentation.matchAll(/<([^/\s>]+)/g)
        )
            .map(match => match[1])
            .filter(component => component !== 'span');

        const components = Array.from(
            new Set(['List', ...fieldComponents, ...filterComponents])
        )
            .filter(
                component =>
                    component !== 'span' &&
                    !component.match(/[A-Za-z]+\.[A-Za-z]+/i)
            )
            .sort();

        const warnings = inferredInputsForFilters
            .map(inferredInput => inferredInput.getWarning())
            .concat(inferredFields.map(field => field.getWarning()))
            .filter(warning => warning != null);

        // eslint-disable-next-line no-console
        console.log(
            `Guessed List:
            
import { ${components.join(', ')} } from 'react-admin';

${filterRepresentation}
export const ${capitalize(singularize(resource))}List = () => (
    <List${filterRepresentation ? ' filters={filters}' : ''}>
${tableRepresentation}
    </List>
);${
                warnings.length > 0
                    ? warnings.map(warning => `\n\n${warning}`).join('')
                    : ''
            }`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ListView filters={filters} {...rest}>
            {child}
        </ListView>
    );
};
