import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles({
    avatar: {
        width: 60,
        height: 60,
        backgroundColor: 'aliceblue',
    },
    image: {
        objectFit: 'contain',
    },
    small: {
        width: 20,
        height: 20,
    },
    medium: {
        width: 30,
        height: 30,
    },
    large: {
        width: 40,
        height: 40,
    },
});

export const LogoField = ({
    record,
    source,
    size = 'medium',
}: {
    record?: { logo: string; name: string };
    source?: string;
    size?: 'small' | 'medium';
}) => {
    const classes = useStyles();
    if (!record) return null;
    return (
        <Avatar
            src={record.logo}
            alt={record.name}
            title={record.name}
            className={classes.image}
            imgProps={{ className: clsx(classes.image, classes[size]) }}
        />
    );
};
