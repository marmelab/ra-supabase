module.exports = {
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>src/setupTests.ts'],
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
    moduleDirectories: ['node_modules', 'src'],
};
