import type { Factor } from '@supabase/supabase-js';
import { useTranslate } from 'ra-core';
import { RadioButtonGroupInput } from 'ra-ui-materialui';
import * as React from 'react';

/**
 * Lets users pick one of their factors when they have several,
 * renders nothing otherwise.
 */
export const MFAFactorInput = ({ factors }: MFAFactorInputProps) => {
    const translate = useTranslate();
    if (factors.length <= 1) {
        return null;
    }
    return (
        <RadioButtonGroupInput
            source="factorId"
            label={translate('ra-supabase.mfa.totp.factor', {
                _: 'Authenticator',
            })}
            choices={factors}
            optionValue="id"
            // Friendly names are optional, fall back to the creation date
            optionText={(factor: Factor) =>
                factor.friendly_name ||
                new Date(factor.created_at).toLocaleString()
            }
            translateChoice={false}
            defaultValue={factors[0].id}
            row={false}
        />
    );
};

export type MFAFactorInputProps = {
    factors: Factor[];
};
