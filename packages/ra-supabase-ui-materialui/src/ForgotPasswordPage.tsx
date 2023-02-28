import * as React from 'react';
import { ReactNode } from 'react';
import { AuthLayout } from './AuthLayout';
import { ForgotPasswordForm } from './ForgotPasswordForm';

/**
 * A component that renders a page for resetting the current user password through Supabase.
 * @param props
 * @param props.children The content of the page. If not set, it will render a ForgotPasswordForm.
 *
 * @example
 * import { ForgotPasswordPage } from 'ra-supabase-ui-materialui';
 * import { Admin, CustomRoutes } from 'react-admin';
 *
 * const App = () => (
 *    <Admin dataProvider={dataProvider}>
 *      <CustomRoutes>
 *       <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
 *     </CustomRoutes>
 *      ...
 *  </Admin>
 * );
 */
export const ForgotPasswordPage = (props: ForgotPasswordPageProps) => {
    const { children = <ForgotPasswordForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

ForgotPasswordPage.path = '/forgot-password';

export type ForgotPasswordPageProps = {
    children?: ReactNode;
};
