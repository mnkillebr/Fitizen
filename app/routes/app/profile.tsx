import { ActionFunctionArgs, json, LoaderFunctionArgs, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { requireLoggedInUser } from "~/utils/auth.server";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { validateForm } from "~/utils/validation";
import { z } from "zod";
import { updateUserProfile, updateUserProfilePhoto } from "~/models/user.server";
import { toast } from "sonner";
import { CloudinaryUploadResult, deleteCloudinaryAsset, uploadToCloudinary } from "~/utils/cloudinary.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  return json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhotoUrl: user.profilePhotoUrl,
      email: user.email,
    } 
  })
}

interface avatarFetcherType extends ActionFunctionArgs{
  error?: string;
  success?: boolean;
  url?: string;
  filename: string;
}

interface profileFormType extends ActionFunctionArgs{
  updatedAt?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
}

const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, "First Name is required")
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Name cannot be only spaces"),
  lastName: z.string()
    .min(1, "Last Name is required")
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Name cannot be only spaces"),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform(val => val.trim())
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);

  if (request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    const uploadHandler = unstable_composeUploadHandlers(
      uploadToCloudinary,
      unstable_createMemoryUploadHandler()
    );
    const avatarFormData = await unstable_parseMultipartFormData(request, uploadHandler);
    const resultString = avatarFormData.get("file") as string | null;
    if (!resultString) {
      return json({ error: "Upload failed" }, { status: 500 });
    }
    try {
      const result = JSON.parse(resultString) as CloudinaryUploadResult;
      const currentPublicId = user.profilePhotoId
      const updatedProfilePhoto = await updateUserProfilePhoto(user.id, result.url, result.public_id)
      if (updatedProfilePhoto && currentPublicId) {
        deleteCloudinaryAsset(currentPublicId)
      }
      return json({ success: true, url: result.url, filename: result.filename });
    } catch (error) {
      return json({ error: "Failed to process upload result" }, { status: 500 });
    }
  }

  const formData = await request.formData();
  if (formData.get("_action") === "updateProfile") {
    return validateForm(
      formData,
      updateProfileSchema,
      (data) => updateUserProfile(user.id, data.email, data.firstName, data.lastName),
      (errors) => json({ errors }, { status: 400 })
    )
  }
  
  return null
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const avatarFetcher = useFetcher<avatarFetcherType>();
  const actionData = useActionData<profileFormType>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const isUpdatingProfile = navigation.state === "submitting";
  const isUploadingImage = avatarFetcher.state === "submitting";

  const currentProfileUrl = avatarFetcher.data?.url || user.profilePhotoUrl;
  useEffect(() => {
    if (actionData) {
      if (actionData.errors) {
        toast.error("Uh oh. The request failed")
      } else if (actionData.updatedAt) {
        toast.success("Profile updated.")
      }
    }
  }, [actionData])

  useEffect(() => {
    if (avatarFetcher.data) {
      if (avatarFetcher.data?.error) {
        toast.error(avatarFetcher.data.error)
      } else if (avatarFetcher.data.success) {
        toast.success("Profile photo uploaded")
      }
    }
  }, [avatarFetcher])
  // Check if form values are different from initial data
  const hasChanges = 
    formData.firstName.trim() !== user.firstName ||
    formData.lastName.trim() !== user.lastName ||
    formData.email.trim() !== user.email;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  };

  const handleImageUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    avatarFetcher.submit(formData, { method: "post", encType: "multipart/form-data" });
    
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-y-3 h-full select-none lg:w-3/4 xl:w-2/3 bg-background text-foreground">
      <div>Manage your account settings and profile information.</div>
      <div className="flex flex-col items-center space-y-4 lg:w-3/4 xl:w-2/3">
          <Avatar
            className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={triggerFileInput}
          >
          <AvatarImage
            src={previewImage || currentProfileUrl || undefined} 
            alt={user.firstName} 
          />
          <AvatarFallback>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <Label 
            htmlFor="avatar"
            className="cursor-pointer flex items-center gap-2 text-sm font-medium"
            onClick={triggerFileInput}
          >
            <Camera className="h-4 w-4" />
            {selectedFile || currentProfileUrl ? "Change Profile Photo" : "Choose Profile Photo"}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={isUploadingImage}
            />
          </Label>
          {selectedFile && (
            <Button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploadingImage}
              className="mt-2 w-fit self-center"
            >
              {isUploadingImage ? "Uploading..." : "Upload Image"}
            </Button>
          )}
        </div>
      </div>
      <Form
        method="post"
        className="flex flex-col gap-y-3 lg:w-3/4 xl:w-2/3"
      >
        <div className="">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            className="bg-background-muted dark:border-border-muted"
            defaultValue={user.firstName}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              firstName: e.target.value 
            }))}
            required
            disabled={isUpdatingProfile}
          />
          {actionData?.errors?.firstName ? <span className="text-red-500 text-xs">{actionData?.errors.firstName}</span> : null}
        </div>

        <div className="">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            className="bg-background-muted dark:border-border-muted"
            defaultValue={user.lastName}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              lastName: e.target.value
            }))}
            required
            disabled={isUpdatingProfile}
          />
          {actionData?.errors?.lastName ? <span className="text-red-500 text-xs">{actionData?.errors.lastName}</span> : null}
        </div>

        <div className="">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="bg-background-muted dark:border-border-muted"
            defaultValue={user.email}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              email: e.target.value
            }))}
            required
            disabled={isUpdatingProfile}
          />
          {actionData?.errors?.email ? <span className="text-red-500 text-xs">{actionData?.errors.email}</span> : null}
        </div>
      
        <Button
          type="submit" 
          disabled={isUpdatingProfile || !hasChanges}
          className="w-fit"
          name="_action"
          value="updateProfile"
        >
          {isUpdatingProfile ? "Saving..." : "Save changes"}
        </Button>
      </Form>
    </div>
  )
}