import * as React from 'react';
import { InferredElement, InferredTypeMap } from 'ra-core';
import {
    AutocompleteArrayInput,
    AutocompleteArrayInputProps,
    AutocompleteInput,
    AutocompleteInputProps,
    editFieldTypes as defaultEditFieldTypes,
    ReferenceArrayInput,
    ReferenceArrayInputProps,
    ReferenceInput,
    ReferenceInputProps,
} from 'ra-ui-materialui';

export const editFieldTypes: InferredTypeMap = {
    ...defaultEditFieldTypes,
    reference: {
        component: ReferenceInput,
        representation: (
            props: ReferenceInputProps,
            children?: InferredElement[]
        ) =>
            children
                ? `<ReferenceInput source="${props.source}" reference="${
                      props.reference
                  }">\n${children
                      .map(
                          child =>
                              `                ${child.getRepresentation()}`
                      )
                      .join('\n')}\n            </ReferenceInput>`
                : `<ReferenceInput source="${props.source}" reference="${props.reference}" />`,
    },
    autocompleteInput: {
        component: (props: AutocompleteInputProps) =>
            props.optionText ? (
                <AutocompleteInput
                    filterToQuery={searchText => ({
                        [`${props.optionText}@ilike`]: `%${searchText}%`,
                    })}
                    {...props}
                />
            ) : (
                <AutocompleteInput {...props} />
            ),
        representation: (props: AutocompleteInputProps) =>
            `<AutocompleteInput${
                props.source ? ` source="${props.source}"` : ''
            }${
                props.optionText
                    ? ` filterToQuery={searchText => ({ ${props.optionText}@ilike: \`%\${searchText}%\` })}`
                    : ''
            } />`,
    },
    referenceArray: {
        component: ReferenceArrayInput,
        representation: (
            props: ReferenceArrayInputProps,
            children?: InferredElement[]
        ) =>
            children
                ? `<ReferenceArrayInput source="${props.source}" reference="${
                      props.reference
                  }">\n${children
                      .map(child => `\t\t${child.getRepresentation()}`)
                      .join('\n')}\n\t</ReferenceArrayInput>`
                : `<ReferenceArrayInput source="${props.source}" reference="${props.reference}" />`,
    },
    autocompleteArrayInput: {
        component: (props: AutocompleteArrayInputProps) =>
            props.optionText ? (
                <AutocompleteArrayInput
                    filterToQuery={searchText => ({
                        [`${props.optionText}@ilike`]: `%${searchText}%`,
                    })}
                    {...props}
                />
            ) : (
                <AutocompleteArrayInput {...props} />
            ),
        representation: (props: AutocompleteInputProps) =>
            `<AutocompleteArrayInput${
                props.source ? ` source="${props.source}"` : ''
            }${
                props.optionText
                    ? ` filterToQuery={searchText => ({ ${props.optionText}@ilike: \`%\${searchText}%\` })}`
                    : ''
            } />`,
    },
};
