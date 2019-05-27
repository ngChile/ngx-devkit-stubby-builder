import { Architect, BuilderContext } from '@angular-devkit/architect';
import { scheduleTargetAndForget, targetFromTargetString } from '@angular-devkit/architect/src/api';
import { TestingArchitectHost } from '@angular-devkit/architect/testing/';
import { schema, logging } from '@angular-devkit/core';
import { normalize } from 'path';
import { of } from 'rxjs';
import { CustomServeBuilderOptions } from './custom-serve';

const { readFileSync } = require('fs');
const { Stubby } = require('stubby');

jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));
jest.mock('stubby', () => ({
    Stubby: jest.fn(),
}));

describe('Ngx Devkit Stubby Builder', () => {
    let architect: Architect;
    let architectHost: TestingArchitectHost;
    
    beforeEach(async () => {
        const registry = new schema.CoreSchemaRegistry();
        registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    
        // Arguments to TestingArchitectHost are workspace and current directories.
        // Since we don't use those, both are the same in this case.
        architectHost = new TestingArchitectHost();
        architect = new Architect(architectHost, registry);
    
        // This will either take a Node package name, or a path to the directory
        // for the package.json file.
        const packageJsonPath = normalize(`${__dirname}/..`);
        await architectHost.addBuilderFromPackage(packageJsonPath);
    });

    it('test', async () => {
        // Configure mocks, stubs and options
        const stubbyOptions: CustomServeBuilderOptions = { 
            devServerTarget: 'web-app:serve',
            stubsConfigFile: 'stubby.json',
            watch: false
        };
        const stubbyConfigAsFile = `
            {
                "request": {
                    "url": "^/auth-service/v1/login$",
                    "method": "POST"
                },
                "response": {
                    "status": 200
                }
            }
        `;
        const stubbyConfigAsObject = JSON.parse(stubbyConfigAsFile);
        readFileSync.mockReturnValue(stubbyConfigAsFile);
        const stubbyStartMock = jest.fn()
            .mockImplementation((options, callback) => callback());
        Stubby.mockImplementation(() => ({
            start: stubbyStartMock,
        }));
        (scheduleTargetAndForget as any) = jest
            .fn()
            .mockReturnValue(
                of({ success: true })
            );
        (targetFromTargetString as any) = jest
            .fn()
            .mockReturnValue(null);
        
        // Execute the builder and wait for results
        const run = await architect.scheduleBuilder(
            'ngx-devkit-stubby-builder:serve', 
            stubbyOptions,
        );
        const output = await run.result;
        await run.stop();
        
        // Expectations
        expect(output.success).toBe(true);
        expect(targetFromTargetString).toHaveBeenCalledWith(stubbyOptions.devServerTarget);
        expect(stubbyStartMock).toHaveBeenCalledWith({
            ...stubbyOptions,
            quiet: false,
            watch: stubbyOptions.stubsConfigFile,
            location: 'localhost',
            data: stubbyConfigAsObject,
        }, expect.any(Function));
    });
});
