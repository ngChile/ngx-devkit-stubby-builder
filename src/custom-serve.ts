import {
    normalize,
    resolve,
    JsonObject
} from '@angular-devkit/core';
import {
    createBuilder,
    BuilderContext,
    BuilderOutput,
    scheduleTargetAndForget,
    targetFromTargetString
} from '@angular-devkit/architect';
import { readFile } from '@angular-devkit/schematics/tools/file-system-utility';
import { Observable, of } from 'rxjs';
import { concatMap, tap, catchError } from 'rxjs/operators';

const { Stubby } = require('stubby');

export interface CustomServeBuilderOptions extends JsonObject {
    devServerTarget: string;
    stubsConfigFile: string;
    watch: boolean;
    stubs: number;
    admin: number;
    tls: number;
    location: string;
    key: string;
    cert: string;
    pfx: string;
}

export default createBuilder<CustomServeBuilderOptions>(run);

function run(
    options: CustomServeBuilderOptions,
    context: BuilderContext
): Observable<BuilderOutput> {
    return of(null)
        .pipe(
            concatMap(() => runStubs(options, context)),
            concatMap(() => startDevServer(options.devServerTarget, true, context)),
            catchError((error) => {
                context.logger.error(`
                    ++++++++++++++++++++++++++++++++++++
                        Error trying to load stubby
                    ++++++++++++++++++++++++++++++++++++
                    ${error}
                    ++++++++++++++++++++++++++++++++++++
                `);
                return of({ success: false });
            })
        );
}

function runStubs(
    options: CustomServeBuilderOptions,
    context: BuilderContext
): Observable<BuilderOutput> {
    const root = normalize(context.workspaceRoot);

    return Observable.create((observer: any) => {
        if (options.stubsConfigFile) {
            const stubsConfigFullPath = resolve(
                root, 
                normalize(options.stubsConfigFile)
            );
            const data = JSON.parse(readFile(stubsConfigFullPath));
            const stubsServer = new Stubby();

            stubsServer.start({
                ...options,
                quiet: false,
                watch: stubsConfigFullPath,
                location: 'localhost',
                data
            }, () => {
                context.logger.info('Stubby Server Running ...');
                observer.next({ success: true })
            });
        } else {
            throw new Error('Please provide "stubsConfigFile" option on angular.json file for architecture "development"');
        }
    });
}

function startDevServer(
    devServerTarget: string,
    isWatching: boolean,
    context: BuilderContext
  ): Observable<BuilderOutput> {
    // Overrides dev server watch setting.
    const overrides = {
      watch: isWatching
    };
    return scheduleTargetAndForget(
      context,
      targetFromTargetString(devServerTarget),
      overrides
    );
  }
  
