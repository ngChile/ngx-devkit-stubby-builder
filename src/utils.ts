import {
    normalize,
    resolve,
    Path
} from '@angular-devkit/core';

export function replacePathForWindows(
    path: Path
): string {
    return path
        .toString()
        .replace(/^\/C\//, '/c/');
}

export function normalizeResponseFilePaths(
    data: any[],
    rootPath: Path
): any[] {
    return data.map(({ request, response }) => {
        if(response.file) {
            const newFilePath = resolve(rootPath,normalize(response.file));
            return {
                request,
                response: {
                    ...response,
                    file: replacePathForWindows(newFilePath)  
                }
            };
        }
        return { request, data };
    });
}
