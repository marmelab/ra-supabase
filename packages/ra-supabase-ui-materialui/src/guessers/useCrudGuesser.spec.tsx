import * as React from 'react';
import { DataProviderContext, TestMemoryRouter } from 'ra-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';

import { useCrudGuesser } from './useCrudGuesser';
import exampleSchema from './exampleSchema.json';

const dataProvider = {
    getSchema: async () => exampleSchema,
} as any;

const wrapper = ({ children }) => (
    <TestMemoryRouter>
        <QueryClientProvider client={new QueryClient()}>
            <DataProviderContext.Provider value={dataProvider}>
                {children}
            </DataProviderContext.Provider>
        </QueryClientProvider>
    </TestMemoryRouter>
);

describe('useAPISchema', () => {
    it('should create one resource per path in the schema', async () => {
        const Component = () => {
            const resources = useCrudGuesser();
            return (
                <ul>
                    {resources.map(resource => (
                        <li key={resource.name}>{resource.name}</li>
                    ))}
                </ul>
            );
        };
        render(<Component />, { wrapper });
        const litItems = await screen.findAllByRole('listitem');
        expect(litItems).toHaveLength(8);
    });

    it('should set the CRUD pages according to the available paths', async () => {
        const Component = () => {
            const resources = useCrudGuesser();
            return (
                <ul>
                    {resources.map(resource => (
                        <li key={resource.name}>
                            {resource.name}
                            <ul>
                                {resource.list && <li>list</li>}
                                {resource.show && <li>show</li>}
                                {resource.edit && <li>edit</li>}
                                {resource.create && <li>create</li>}
                            </ul>
                        </li>
                    ))}
                </ul>
            );
        };
        render(<Component />, { wrapper });
        const companies = await screen.findByText('companies');
        expect(within(companies).queryByText('list')).not.toBeNull();
        expect(within(companies).queryByText('show')).not.toBeNull();
        expect(within(companies).queryByText('edit')).not.toBeNull();
        expect(within(companies).queryByText('create')).not.toBeNull();

        const sales = await screen.findByText('sales');
        expect(within(sales).queryByText('list')).not.toBeNull();
        expect(within(sales).queryByText('show')).not.toBeNull();
        expect(within(sales).queryByText('edit')).toBeNull();
        expect(within(sales).queryByText('create')).toBeNull();
    });
});
