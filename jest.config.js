module.exports = {
    globalSetup: './test-global-setup.js',
    setupFilesAfterEnv: ['./test-setup.js'],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/lib/',
        '/esm/',
        '/packages/demo',
    ],
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\](?!(@hookform)/).+\\.(js|jsx|mjs|ts|tsx)$',
    ],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                isolatedModules: true,
                useESM: true,
            },
        ],
    },
};
