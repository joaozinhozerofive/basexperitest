/**
 * Enum representing different upload error codes.
 * @enum {number}
 */
export var upload;
(function (upload) {
    upload[upload["maxFileSize"] = 1] = "maxFileSize";
    upload[upload["allowExtensions"] = 2] = "allowExtensions";
    upload[upload["maxFields"] = 3] = "maxFields"; // Error code for exceeding the maximum number of fields.
})(upload || (upload = {}));
/**
 * This class represents errors encountered during file uploads.
 * It provides an error message and an error code.
 * @class
 */
export class UploadError {
    message; // The error message describing the issue.
    code; // The error code representing the type of upload error.
    /**
     * Creates a new instance of the UploadError class.
     * @param message - The error message to be displayed.
     * @param code - The error code associated with the upload error.
     */
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }
}
