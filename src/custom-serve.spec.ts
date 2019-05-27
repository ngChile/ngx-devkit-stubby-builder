import { Architect } from '@angular-devkit/architect';
import { scheduleTargetAndForget, targetFromTargetString } from '@angular-devkit/architect/src/api';
import { TestingArchitectHost } from '@angular-devkit/architect/testing/';
import { schema, logging } from '@angular-devkit/core';
import { readFileSync } from 'fs';
import { normalize } from 'path';
import { of } from 'rxjs';
import { CustomServeBuilderOptions } from './custom-serve';

const { Stubby } = require('stubby');

jest.mock('fs');
jest.mock('stubby');

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
        (scheduleTargetAndForget as any) = jest
            .fn()
            .mockReturnValue(
                of({ success: true })
            );
        (targetFromTargetString as any) = jest
            .fn()
            .mockReturnValue(null);
        // A "run" can contain multiple outputs, and contains progress information.
        const options: CustomServeBuilderOptions = { 
            devServerTarget: 'test',
            stubsConfigFile: 'test',
            watch: false
        };
        const run = await architect.scheduleBuilder(
            'ngx-devkit-stubby-builder:serve', 
            options
        );

        // The "result" member is the next output of the runner.
        // This is of type BuilderOutput.
        const output = await run.result;
        
        // Stop the builder from running. This really stops Architect from keeping
        // the builder associated states in memory, since builders keep waiting
        // to be scheduled.
        await run.stop();

        // Expect that it succeeded.
        expect(output.success).toBe(true);
        expect(targetFromTargetString).toHaveBeenCalledWith(options.devServerTarget);
    });
});
