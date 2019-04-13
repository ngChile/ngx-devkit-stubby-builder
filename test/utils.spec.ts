import {
    Path
} from '@angular-devkit/core';
import { 
    replacePathForWindows,
    normalizeResponseFilePaths
}  from '../src/utils';

test('should replace paths for windows', () => {
    const path = '/C/Users/gigas/projects/escalando-aplicaciones-con-angular/stubs/config.json' as Path;
    const expectedPath = '/c/Users/gigas/projects/escalando-aplicaciones-con-angular/stubs/config.json' as Path;

    expect(replacePathForWindows(path)).toEqual(expectedPath);
});

test('should apply replacement for windows in config response', () => {
    const data = [
        { 
            request: {},
            response: {
                file: 'users.json'
            }
        }
    ];
    const expectedData = [
        { 
            request: {},
            response: {
                file: '/c/Users/gpincheiraa/users.json'
            }
        }
    ];
    const rootPath = '/C/Users/gpincheiraa' as Path;
    
    expect(normalizeResponseFilePaths(data, rootPath)).toEqual(expectedData);
});
