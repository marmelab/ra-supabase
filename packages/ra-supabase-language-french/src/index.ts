export const raSupabaseFrenchMessages = {
    'ra-supabase': {
        auth: {
            email: 'Email',
            confirm_password: 'Confirmation du mot de passe',
            sign_in_with: 'Se connecter avec %{provider}',
            forgot_password: 'Mot de passe oublié ?',
            reset_password: 'Réinitialiser le mot de passe',
            password_reset:
                'Votre mot de passe a été réinitialisé. Vous recevrez un email contenant un lien pour vous connecter.',
            missing_tokens:
                "Les jetons d'accès et de rafraîchissement sont manquants",
            back_to_login: 'Retour à la page de connexion',
        },
        reset_password: {
            forgot_password: 'Mot de passe oublié ?',
            forgot_password_details: 'Obtenez les instructions par email.',
        },
        set_password: {
            new_password: 'Nouveau mot de passe',
        },
        validation: {
            password_mismatch: 'Les mots de passe ne correspondent pas',
        },
        action: {
            verify: 'Vérifier',
            next: 'Suivant',
            unenroll: 'Désinscrire',
        },
        mfa: {
            totp: {
                challenge_header: 'Entrez votre code TOTP',
                challenge_instructions:
                    "Entrez le code TOTP de votre application d'authentification pour vérifier votre identité.",
                code: 'Code',
                factor: 'Authentificateur',
                no_factor_error: 'Aucun facteur TOTP trouvé !',
                enroll_header:
                    "Activer l'authentification multi-facteurs (TOTP)",
                enroll_instructions:
                    "Utilisez une application d'authentification (telle que Google Authenticator, Microsoft Authenticator, Bitwarden Authenticator, ...) pour scanner le QR code ci-dessous puis cliquez sur Suivant.",
                qr_code_alt: 'QR code TOTP',
                secret_copied: 'Clé secrète copiée dans le presse-papiers',
                copy_secret_key_to_clipboard:
                    'Copier la clé secrète dans le presse-papiers',
                enroll_start: 'Configurer',
                unenroll_header:
                    "Désactiver l'authentification multi-facteurs (TOTP)",
                unenroll_instructions:
                    "Cliquez sur le bouton ci-dessous pour désactiver l'authentification TOTP. Attention, vous pourriez perdre l'accès à certaines ou toutes les fonctionnalités de cette application si vous n'avez pas configuré une autre méthode d'authentification multi-facteurs. Vous pourrez toujours vous réinscrire ultérieurement.",
                unenroll_success:
                    "Désinscription de l'authentification TOTP réussie",
            },
        },
    },
};
