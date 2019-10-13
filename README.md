# ngx-devkit-stubby-builder
[circle-ci-image]: https://circleci.com/gh/ngChile/ngx-devkit-stubby-builder.svg?style=svg

[circle-ci-url]: https://circleci.com/gh/ngChile/ngx-devkit-stubby-builder

[npm-nodeico-image]: https://nodei.co/npm/ngx-devkit-stubby-builder.png?downloads=true&downloadRank=true&stars=true
[npm-nodeico-url]: https://nodei.co/npm/ngx-devkit-stubby-builder/


[![Build Status][circle-ci-image]][circle-ci-url] 
[![NPM][npm-nodeico-image]][npm-nodeico-url] 

Builder architecture that use a Stubby server for handle http request when the Angular web application was serve using *Angular* >= 8 `@angular-devkit/architect` API.

#### Install it
```
npm install --save-dev ngx-devkit-stubby-builder
```

#### Create Stubby configuration file

Create `./stubs/config.json` using the following [documentation](https://github.com/mrak/stubby4node#json-1)


#### Add a new architecture task in your angular.json file
```json
{
    ...
    "projects": {
        "<app-target>": {
            "architect": {
                ...
                "serve": {
                    "builder": "@angular-devkit/build-angular:dev-server",
                    "options": {
                        "browserTarget": "web-app:build"
                    },
                    "configurations": {
                        "production": {
                        "browserTarget": "web-app:build:production"
                        }
                    }
                },
                "serve-with-stubs": {
                    "builder": "ngx-devkit-stubby-builder:serve",
                    "options": {
                        "devServerTarget": "web-app:serve",
                        "stubsConfigFile": "./stubs/config.json"
                    },
                    "configurations": {
                        "production": {
                        "devServerTarget": "web-app:serve:production"
                        }
                    }
                },
                ...
            }
        }
    }
}
```

Replace your `npm start` script in your package.json 

```json
    ...
    "scripts": {
        "ng": "ng",
        "start": "ng run <app-target>:serve-with-stubs",
    ...
```

Note: Don't forget that `<app-target>` should be replaced with your unique target name. Example: "web-app", "my-app" 
