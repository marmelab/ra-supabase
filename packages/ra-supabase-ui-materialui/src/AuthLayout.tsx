import React, {
    HtmlHTMLAttributes,
    ComponentType,
    createElement,
    ReactNode,
    useRef,
    useEffect,
    useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    Avatar,
    ThemeProvider,
    createTheme,
    Box,
    styled,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

import { TitleComponent } from 'ra-core';
import { defaultTheme, LayoutClasses, Notification } from 'ra-ui-materialui';

/**
 * A standalone login page, to serve as authentication gate to the admin
 *
 * Expects the user to enter a login and a password, which will be checked
 * by the `authProvider.login()` method. Redirects to the root page (/)
 * upon success, otherwise displays an authentication error message.
 *
 * Copy and adapt this component to implement your own login logic
 * (e.g. to authenticate via email or facebook or anything else).
 *
 * @example
 *     import MyLoginPage from './MyLoginPage';
 *     const App = () => (
 *         <Admin loginPage={MyLoginPage} authProvider={authProvider}>
 *             ...
 *        </Admin>
 *     );
 */
export const AuthLayout: React.FunctionComponent<LoginProps> = props => {
    const {
        theme,
        title,
        classes: classesOverride,
        className,
        children,
        notification,
        backgroundImage,
        ...rest
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const muiTheme = useMemo(() => createTheme(theme), [theme]);
    let backgroundImageLoaded = false;

    const updateBackgroundImage = () => {
        if (!backgroundImageLoaded && containerRef.current) {
            containerRef.current.style.backgroundImage = `url(${backgroundImage})`;
            backgroundImageLoaded = true;
        }
    };

    // Load background image asynchronously to speed up time to interactive
    const lazyLoadBackgroundImage = () => {
        if (backgroundImage) {
            const img = new Image();
            img.onload = updateBackgroundImage;
            img.src = backgroundImage;
        }
    };

    useEffect(() => {
        if (!backgroundImageLoaded) {
            lazyLoadBackgroundImage();
        }
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <Root {...rest} ref={containerRef}>
                <Card className={AuthLayoutClasses.card}>
                    <div className={AuthLayoutClasses.avatar}>
                        <Avatar className={AuthLayoutClasses.icon}>
                            <LockIcon />
                        </Avatar>
                    </div>
                    {children}
                </Card>
                {notification ? createElement(notification) : null}
            </Root>
        </ThemeProvider>
    );
};

AuthLayout.propTypes = {
    backgroundImage: PropTypes.string,
    children: PropTypes.node,
    classes: PropTypes.object,
    className: PropTypes.string,
    theme: PropTypes.object,
};

AuthLayout.defaultProps = {
    theme: defaultTheme,
    notification: Notification,
};

export interface LoginProps
    extends Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {
    backgroundImage?: string;
    children?: ReactNode;
    classes?: object;
    className?: string;
    notification?: ComponentType;
    theme?: object;
    title?: TitleComponent;
}

const PREFIX = 'RaAuthLayout';

export const AuthLayoutClasses = {
    card: `${PREFIX}-card`,
    avatar: `${PREFIX}-avatar`,
    icon: `${PREFIX}-icon`,
};

const Root = styled('div', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    height: '1px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage:
        'radial-gradient(circle at 50% 14em, #313264 0%, #00023b 60%, #00023b 100%)',
    [`& .${AuthLayoutClasses.card}`]: {
        minWidth: 300,
        marginTop: '6em',
    },
    [`& .${AuthLayoutClasses.avatar}`]: {
        margin: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${AuthLayoutClasses.icon}`]: {
        backgroundColor: theme.palette.grey[500],
    },
}));
