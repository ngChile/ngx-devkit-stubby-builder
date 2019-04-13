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
        const responseMapper = (responseData: any) => {
            if (responseData.file) {
                const newFilePath = resolve(rootPath,normalize(responseData.file));
                return {
                    ...responseData,
                    file: replacePathForWindows(newFilePath)  
                }
            }
            return responseData;
        };

        if(Array.isArray(response)) {
            return {
                request,
                response: response.map(responseMapper)
            } 
        }
        return { 
            request, 
            response: responseMapper(response)
        };
    });
}
