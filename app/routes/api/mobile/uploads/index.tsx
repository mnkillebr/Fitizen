import { ActionFunctionArgs, data } from '@remix-run/node';
import { hash } from '~/cryptography.server';
import { requireAuth } from '~/utils/auth.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireAuth(request);
  const method = request.method;

  switch (method) {
    case "POST": {
      const jsonData = await request.json();
      const publicId = jsonData['public_id']; // Unique file name
      const timestamp = Math.floor(Date.now() / 1000); // Cloudinary requires a timestamp
      if (!publicId) {
        return data({ error: 'Missing public_id' }, { status: 400 });
      }
    
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
      // Parameters to sign (sorted alphabetically)
      const paramsToSign = `folder=fitizen&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = hash(paramsToSign);
    
      return data({ 
        signature, 
        timestamp, 
        apiKey, 
        cloudName,
        publicId,
      });
    }
    case "PUT":
      // Handle workout update
      break;
    case "DELETE":
      // Handle workout deletion
      break;
    default:
      return data({ error: "Method not allowed" }, { status: 405 });
  }
};