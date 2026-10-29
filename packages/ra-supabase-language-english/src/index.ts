export const raSupabaseEnglishMessages = {
    'ra-supabase': {
        auth: {
            email: 'Email',
            confirm_password: 'Confirm password',
            sign_in_with: 'Sign in with %{provider}',
            forgot_password: 'Forgot password?',
            reset_password: 'Reset password',
            password_reset:
                'Your password has been reset. You will receive an email containing a link to log in.',
            missing_tokens: 'Access and refresh tokens are missing',
            back_to_login: 'Back to login',
        },
        reset_password: {
            forgot_password: 'Forgot password?',
            forgot_password_details: 'Enter your email for instructions.',
        },
        set_password: {
            new_password: 'Choose your password',
        },
        validation: {
            password_mismatch: 'Passwords do not match',
        },
        action: {
            verify: 'Verify',
            next: 'Next',
            unenroll: 'Unenroll',
        },
        mfa: {
            totp: {
                challenge_header: 'Enter your TOTP code',
                challenge_instructions:
                    'Enter the TOTP code from your Authenticator app to verify your identity.',
                code: 'Code',
                no_factor_error: 'No TOTP factors found!',
                enroll_header: 'Enable Multi-Factor Authentication (TOTP)',
                enroll_instructions:
                    'Use an Authenticator app (such as Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) to scan the QR code below and click Next.',
                qr_code_alt: 'TOTP QR Code',
                secret_copied: 'Secret key copied to clipboard',
                copy_secret_key_to_clipboard: 'Copy secret key to clipboard',
                enroll_start: 'Set up',
                unenroll_header:
                    'Unenroll from Multi-Factor Authentication (TOTP)',
                unenroll_instructions:
                    'Click the button below to unenroll from TOTP MFA. Be warned that you may lose access to some or all features of this application if you do not have another MFA method set up. You can always enroll again later.',
                unenroll_success: 'Successfully unenrolled from TOTP MFA',
            },
        },
    },
};
