import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { logging, schema } from '@angular-devkit/core';
import * as path from 'path';
import CustomServeBuilder from './custom-serve';

const { Stubby } = require('stubby');

describe('Ngx Devkit Stubby Builder', () => {
    let architect: Architect;
    let architectHost: TestingArchitectHost;
    
    beforeEach(async () => {
        const registry = new schema.CoreSchemaRegistry();
        registry.addPostTransform(schema.transforms.addUndefinedDefaults);
    
        // Arguments to TestingArchitectHost are workspace and current directories.
        // Since we don't use those, both are the same in this case.
        architectHost = new TestingArchitectHost('/root', '/root');
        architect = new Architect(architectHost, registry);
    
        // This will either take a Node package name, or a path to the directory
        // for the package.json file.
        await architectHost.addBuilderFromPackage(__dirname);
    });

    it('test', async () => {
        // Create a logger that keeps an array of all messages that were logged.
        const logger = new logging.Logger('');
        const logs: any = [];
        logger.subscribe(ev => logs.push(ev.message));

        // A "run" can contain multiple outputs, and contains progress information.
        const run = await architect.scheduleBuilder('ngx-devkit-stubby-builder:serve', {
        command: 'ls',
        args: [__dirname],
        }, { logger });  // We pass the logger for checking later.

        // The "result" member is the next output of the runner.
        // This is of type BuilderOutput.
        const output = await run.result;
        
        // Stop the builder from running. This really stops Architect from keeping
        // the builder associated states in memory, since builders keep waiting
        // to be scheduled.
        await run.stop();

        // Expect that it succeeded.
        expect(output.success).toBe(true);

        // Expect that this file was listed. It should be since we're running
        // `ls $__dirname`.
        expect(logs).toContain('index_spec.ts');
    });
});
