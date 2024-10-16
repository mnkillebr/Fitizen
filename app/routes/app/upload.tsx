import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  json,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { requireLoggedInUser } from "~/utils/auth.server";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { CloudinaryUploadResult, cldInstance, uploadToCloudinary } from "~/utils/cloudinary.server";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { VideoPlayer } from "~/components/VideoPlayer";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const role = user.role;
  const testImage = cldInstance.utils.private_download_url("1724426838355-npsxq79i62", "jpg", {
    resource_type: "image",
    expires_at: 1726240141,
  })
  const testVideo = cldInstance.video("samples/cld-sample-video", {quality: "auto", controls: true })
  // const testVideoURL = cldInstance.url("samples/dance-2", {resource_type: "video", quality: "auto", controls: true })
  const testVideoURL = cldInstance.utils.private_download_url("samples/dance-2", "mp4", {
    resource_type: "video",
    type: "upload",
    // expires_at: 1726248512,
  })
  // console.log("test image url", testImage, "test video html", testVideo)
  console.log("url", testVideoURL)
  // if (role !== "admin") {
  //   return redirect("/app")
  // }
  return json({ image: testImage, video: testVideo, url: testVideoURL })
}

type uploadActionType = {
  success?: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const uploadHandler = unstable_composeUploadHandlers(
    uploadToCloudinary,
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const resultString = formData.get("file") as string | null;
  // for (const [key, value] of formData.entries()) {
  //   console.log("key", key, "value", JSON.stringify(value))
  // }
  // console.log(JSON.parse(result))
  // console.log(result)
  if (!resultString) {
    return json({ error: "Upload failed" }, { status: 500 });
  }

  try {
    const result = JSON.parse(resultString) as CloudinaryUploadResult;
    console.log("upload result", result)
    return json({ success: true, url: result.url, filename: result.filename });
  } catch (error) {
    console.error("Failed to parse upload result:", error);
    return json({ error: "Failed to process upload result" }, { status: 500 });
  }
  // return json({ success: true, url: result?.url, filename: result?.filename });
};

export default function Upload() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<uploadActionType>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [actionData]);
  // console.log("video", typeof data.video)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Upload</h1>
      <Form ref={formRef} method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Choose a file
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept="image/*,video/*"
            className={clsx(
              "mt-1 block w-full text-sm text-gray-500",
              "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm",
              "file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            )}
          />
        </div>
        <button
          type="submit"
          className={clsx(
            "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md",
            "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            navigation.state === "submitting" ? "animate-pulse" : "",
          )}
          disabled={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" ? "Uploading ..." : "Upload"}
        </button>
      </Form>
      <img src={data?.image} />
      {/* <div dangerouslySetInnerHTML={{ __html: data.video }} /> */}
      {/* <video controls controlsList="nodownload" src={data.url} /> */}
      <VideoPlayer height="540" width="960" />
      {actionData?.success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Successfully uploaded {actionData.filename}
        </div>
      )}
      
      {actionData?.error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {actionData.error}
        </div>
      )}
    </div>
  );
}
