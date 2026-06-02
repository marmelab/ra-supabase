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
                'challenge-header': 'Enter your TOTP code',
                'challenge-instructions':
                    'Enter the TOTP code from your Authenticator app to verify your identity.',
                code: 'Code',
                'no-factor-error': 'No TOTP factors found!',
                'enroll-header': 'Enable Multi-Factor Authentication (TOTP)',
                'enroll-instructions':
                    'Use an Authenticator app (such as Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) to scan the QR code below and click Next.',
                'secret-copied': 'Secret key copied to clipboard',
                'copy-secret-key-to-clipboard': 'Copy secret key to clipboard',
                'enroll-start': 'Set up',
                'unenroll-header':
                    'Unenroll from Multi-Factor Authentication (TOTP)',
                'unenroll-instructions':
                    'Click the button below to unenroll from TOTP MFA. Be warned that you may lose access to some or all features of this application if you do not have another MFA method set up. You can always enroll again later.',
                'unenroll-success': 'Successfully unenrolled from TOTP MFA',
            },
        },
    },
};
