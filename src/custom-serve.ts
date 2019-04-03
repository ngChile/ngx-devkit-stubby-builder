/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
    Builder,
    BuilderConfiguration,
    BuilderContext,
    BuilderDescription,
    BuildEvent
} from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import { concatMap, map, tap, catchError } from 'rxjs/operators';

const { Stubby } = require('stubby');

export interface CustomServeBuilderOptions {
    devServerTarget: string;
    stubsConfigFile: string;
    watch?: boolean;
    stubs?: number;
    admin?: number;
    tls?: number;
    location?: string;
    key?: string;
    cert?: string;
    pfx?: string;
    _httpsOptions?: object;
}

export class CustomServeBuilder implements Builder<CustomServeBuilderOptions> {
    constructor(public context: BuilderContext) {}
    run(
        builderConfig: BuilderConfiguration<CustomServeBuilderOptions>
    ): Observable<BuildEvent> {
        const options = {
            ...builderConfig.options,
            project: builderConfig.root
        };
        return of(null)
            .pipe(
                concatMap(() => this.runStubs(options)),
                concatMap(() => this.startServer(options)),
                catchError((error) => {
                    this.context.logger.error(`
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

    private runStubs(options: CustomServeBuilderOptions): Observable<BuildEvent> {
        const root = this.context.workspace.root;
        return of(null)
            .pipe(
                tap(() => {
                    if (options.stubsConfigFile) {
                        const stubsConfigPath = options.stubsConfigFile.replace(/^\.\//g, '');
                        const stubsConfigFullPath = `${root}/${stubsConfigPath}`;
                        const data = require(stubsConfigFullPath);
                        const stubsServer = new Stubby();

                        stubsServer.start({
                            ...options,
                            quiet: false,
                            watch: stubsConfigFullPath,
                            location: 'localhost',
			    data,
                        });
                    } else {
                        throw new Error('Please provide "stubsConfigFile" option on angular.json file for architecture "development"');
                    }
                }),
                map(() => ({success: true}))
            );
    }

    private startServer(options: CustomServeBuilderOptions) {
        const architect = this.context.architect;
        const [
            project,
            targetName,
            configuration
        ] = (options.devServerTarget as string).split(':');
        const overrides = { watch: true };
        const targetSpec = {
            project,
            target: targetName,
            configuration,
            overrides
        };
        const builderConfig = architect.getBuilderConfiguration<any>(targetSpec);
        let devServerDescription: BuilderDescription;

        return architect.getBuilderDescription(builderConfig).pipe(
            tap(
                description => (devServerDescription = description as BuilderDescription)
            ),
            concatMap(description =>
                architect.validateBuilderOptions(builderConfig, description)
            ),
            concatMap(() => {
                return of(
                    this.context.architect.getBuilder(devServerDescription, this.context)
                );
            }),
            concatMap(builder => builder.run(builderConfig))
          );
    }
}

export default CustomServeBuilder;
