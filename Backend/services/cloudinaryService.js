const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

function uploadResumeToCloudinary(buffer, originalName) {
    return new Promise((resolve, reject) => {
        const publicId = `resume_${Date.now()}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "careerlens/resumes",
                public_id: publicId,
                format: "pdf",
                use_filename: false,
                unique_filename: true,
                overwrite: false
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    resourceType: result.resource_type,
                    format: result.format,
                    originalName
                });
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
}

module.exports = {
    uploadResumeToCloudinary,
};