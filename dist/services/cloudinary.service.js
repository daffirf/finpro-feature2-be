"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
class CloudinaryService {
    constructor() {
        this.bufferToStream = (buffer) => {
            const readable = new stream_1.Readable();
            readable._read = () => { };
            readable.push(buffer);
            readable.push(null);
            return readable;
        };
        this.upload = async (file) => {
            const stream = this.bufferToStream(file.buffer);
            return new Promise((resolve, reject) => {
                const readableStream = this.bufferToStream(file.buffer);
                const uploadStream = cloudinary_1.v2.uploader.upload_stream((err, result) => {
                    if (err)
                        return reject(err);
                    if (!result)
                        return reject(new Error("upload failed"));
                    resolve(result);
                });
                readableStream.pipe(uploadStream);
            });
        };
        cloudinary_1.v2.config({
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME
        });
    }
}
exports.CloudinaryService = CloudinaryService;
