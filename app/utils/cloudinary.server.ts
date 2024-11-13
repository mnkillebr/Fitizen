import { writeAsyncIterableToWritable } from "@remix-run/node";
import { v2 as cloudinary } from "cloudinary";
// import { Cloudinary } from "@cloudinary/url-gen"
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

if (typeof CLOUDINARY_CLOUD_NAME !== "string") {
  throw new Error("Missing env: CLOUDINARY_CLOUD_NAME");
}
if (typeof CLOUDINARY_API_KEY !== "string") {
  throw new Error("Missing env: CLOUDINARY_API_KEY");
}
if (typeof CLOUDINARY_API_SECRET !== "string") {
  throw new Error("Missing env: CLOUDINARY_API_SECRET");
}

// Configure Cloudinary
export const cldConfig = {
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
}
// server instance
cloudinary.config(cldConfig);
export const cldInstance = cloudinary;
// client instance
// export const cldInstance = new Cloudinary({
//   cloud: {
//     cloudName: cldConfig.cloud_name,
//     apiKey: cldConfig.api_key,
//     apiSecret: cldConfig.api_secret,
//   }
// })

// Helper function to convert a Buffer to AsyncIterable<Uint8Array>
async function* bufferToAsyncIterable(buffer: Buffer) {
  yield buffer;
}

type CloudinaryResourceType = "image" | "video" | "raw" | "auto";

export type CloudinaryUploadResult = {
  url: string;
  filename: string;
  public_id: string;
  signature: string;
  format: string;
  resource_type: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  original_filename: string;
};

export const uploadToCloudinary = async ({ name, contentType, data, filename }: any): Promise<string | undefined> => {
  if (name !== "file") {
    return undefined;
  }

  const uploadPromise = new Promise<string>((resolve, reject) => {
    let uploadStream;

    const chunks: Buffer[] = [];
    (async () => {
      for await (const chunk of data) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const fileSize = buffer.length;

      // Determine resource type and file extension
      let resourceType: CloudinaryResourceType = "raw";
      if (contentType.startsWith('image/')) {
        resourceType = "image";
      } else if (contentType.startsWith('video/')) {
        resourceType = "video";
      }
      const fileExtension = filename.split('.').pop();

      const uploadOptions = {
        asset_folder: "fitizen",
        display_name: filename,
        format: fileExtension,
        public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        resource_type: resourceType,
        type: "private",
      };

      const uploadCallback = (error: any, result: any) => {
        if (error) {
          reject(error);
        } else if (result && result.secure_url) {
          const uploadResult: CloudinaryUploadResult = {
            asset_folder: result.asset_folder,
            display_name: result.display_name,
            filename,
            format: result.format,
            original_filename: result.original_filename,
            public_id: result.public_id,
            resource_type: result.resource_type,
            secure_url: result.secure_url,
            signature: result.signature,
            url: result.url,
          };
          resolve(JSON.stringify(uploadResult));
        } else {
          reject(new Error("Upload failed: No secure URL received"));
        }
      };

      if (fileSize > 100 * 1024 * 1024) {
        cldInstance.uploader.upload_large(buffer.toString('base64'), uploadOptions, uploadCallback);
      } else {
        uploadStream = cldInstance.uploader.upload_stream(uploadOptions, uploadCallback);
        writeAsyncIterableToWritable(bufferToAsyncIterable(buffer), uploadStream)
          .catch(reject);
      }
    })();
  });

  return uploadPromise;
};

export const deleteCloudinaryAsset = (public_id: string, resourceType: string = "image") => {
  const destroyOptions = {
    type: "private",
    resource_type: resourceType,
  };
  cldInstance.api.delete_resources([public_id], destroyOptions);
}
