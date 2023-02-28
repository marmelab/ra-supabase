import * as React from 'react';
import { ReactNode } from 'react';
import { AuthLayout } from './AuthLayout';
import { SetPasswordForm } from './SetPasswordForm';

/**
 * A component that renders a page for setting the current user password through Supabase.
 * Can be used for the first login after a user has been invited or to reset the password.
 * @param props
 * @param props.children The content of the page. If not set, it will render a SetPasswordForm.
 *
 * @example
 * import { SetPasswordPage } from 'ra-supabase-ui-materialui';
 * import { Admin, CustomRoutes } from 'react-admin';
 *
 * const App = () => (
 *    <Admin dataProvider={dataProvider}>
 *      <CustomRoutes>
 *       <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
 *     </CustomRoutes>
 *      ...
 *  </Admin>
 * );
 */
export const SetPasswordPage = (props: SetPasswordPageProps) => {
    const { children = <SetPasswordForm /> } = props;

    return <AuthLayout>{children}</AuthLayout>;
};

SetPasswordPage.path = '/set-password';

export type SetPasswordPageProps = {
    children?: ReactNode;
};
