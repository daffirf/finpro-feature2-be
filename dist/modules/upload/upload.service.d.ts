export declare class UploadService {
    getFile(filePath: string[]): Promise<{
        file: Buffer<ArrayBufferLike>;
        contentType: string;
        headers: {
            'Content-Type': string;
            'Cache-Control': string;
        };
    }>;
    private getContentType;
}
