/**
 * Enum representing different upload error codes.
 * @enum {number}
 */
export declare enum upload {
    maxFileSize = 1,// Error code for exceeding the maximum file size.
    allowExtensions = 2,// Error code for invalid file extensions.
    maxFields = 3
}
/**
 * This class represents errors encountered during file uploads.
 * It provides an error message and an error code.
 * @class
 */
export declare class UploadError {
    message: string;
    code: number;
    /**
     * Creates a new instance of the UploadError class.
     * @param message - The error message to be displayed.
     * @param code - The error code associated with the upload error.
     */
    constructor(message: string, code: upload);
}
