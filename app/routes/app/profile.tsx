import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
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
import { updateUserFitnessProfile, updateUserProfile, updateUserProfilePhoto } from "~/models/user.server";
import { toast } from "sonner";
import { CloudinaryUploadResult, deleteCloudinaryAsset, uploadToCloudinary } from "~/utils/cloudinary.server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FitnessSettings } from "~/components/FitnessSettings";
import { LoadUnit } from "@prisma/client";
import db from "~/db.server";
import { getSession } from "~/sessions";
import { darkModeCookie } from "~/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const userId = session.get("userId")

  const user = await db.user.findUnique({
    where: {
      id: userId
    },
    include: {
      fitnessProfile: true,
    }
  });
  if (user === null) {
    throw redirect("/login");
  }

  return json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhotoUrl: user.profilePhotoUrl,
      email: user.email,
      fitnessProfile: user.fitnessProfile
    } 
  })
}

interface avatarFetcherType extends ActionFunctionArgs{
  error?: string;
  success?: boolean;
  url?: string;
  filename: string;
}

interface userSettingsFormType extends ActionFunctionArgs{
  updatedAt?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
}

interface fitnessProfileFormType extends ActionFunctionArgs{
  updatedAt?: string;
  errors?: {
    [key: string]: any;
  }
}

const updateUserProfileSchema = z.object({
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

const updateFitnessProfileSchema = z.object({
  unit: z.string().optional(),
  currentWeight: z.string().optional(),
  targetWeight: z.string().optional(),
  "fat-loss": z.string().optional(),
  endurance: z.string().optional(),
  "build-muscle": z.string().optional(),
  "lose-weight": z.string().optional(),
  "improve-balance": z.string().optional(),
  "improve-flexibility": z.string().optional(),
  "learn-new-skills": z.string().optional(),
  "heart-condition": z.string().optional(),
  "chest-pain-activity": z.string().optional(),
  "chest-pain-no-activity": z.string().optional(),
  "balance-consciousness": z.string().optional(),
  "bone-joint": z.string().optional(),
  "blood-pressure-meds": z.string().optional(),
  "other-reasons": z.string().optional(),
  occupation: z.string().optional(),
  "extended-sitting": z.string().optional(),
  "repetitive-movements": z.string().optional(),
  "explanation_repetitive-movements": z.string().optional(),
  "heel-shoes": z.string().optional(),
  "mental-stress": z.string().optional(),
  "physical-activities": z.string().optional(),
  "explanation_physical-activities": z.string().optional(),
  hobbies: z.string().optional(),
  explanation_hobbies: z.string().optional(),
  "injuries-pain": z.string().optional(),
  "explanation_injuries-pain": z.string().optional(),
  surgeries: z.string().optional(),
  explanation_surgeries: z.string().optional(),
  "chronic-disease": z.string().optional(),
  "explanation_chronic-disease": z.string().optional(),
  medications: z.string().optional(),
  explanation_medications: z.string().optional(),
})

const themeSchema = z.object({
  darkMode: z.string(),
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
  switch (formData.get("_action")) {
    case "updateUserProfile": {
      return validateForm(
        formData,
        updateUserProfileSchema,
        (data) => updateUserProfile(user.id, data.email, data.firstName, data.lastName),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "updateFitnessProfile": {
      return validateForm(
        formData,
        updateFitnessProfileSchema,
        (data) => {
          const fitnessProfileObj = {
            unit: data.unit === "lbs" ? LoadUnit.pound : LoadUnit.kilogram,
            currentWeight: data.currentWeight ? parseInt(data.currentWeight) : null,
            targetWeight: data.targetWeight ? parseInt(data.targetWeight) : null,
            goal_fatLoss: data["fat-loss"] && data["fat-loss"] === "on" ? true : null,
            goal_endurance: data.endurance && data["endurance"] === "on" ? true : null,
            goal_buildMuscle: data["build-muscle"] && data["build-muscle"] === "on" ? true : null,
            goal_loseWeight: data["lose-weight"] && data["lose-weight"] === "on" ? true : null,
            goal_improveBalance: data["improve-balance"] && data["improve-balance"] === "on" ? true : null,
            goal_improveFlexibility: data["improve-flexibility"] && data["improve-flexibility"] === "on" ? true : null,
            goal_learnNewSkills: data["learn-new-skills"] && data["learn-new-skills"] === "on" ? true : null,
            parq_heartCondition: data["heart-condition"] && data["heart-condition"] === "true" ? true : data["heart-condition"] && data["heart-condition"] === "false" ? false : null,
            parq_chestPainActivity: data["chest-pain-activity"] && data["chest-pain-activity"] === "true" ? true : data["chest-pain-activity"] && data["chest-pain-activity"] === "false" ? false : null,
            parq_chestPainNoActivity: data["chest-pain-no-activity"] && data["chest-pain-no-activity"] === "true" ? true : data["chest-pain-no-activity"] && data["chest-pain-no-activity"] === "false" ? false : null,
            parq_balanceConsciousness: data["balance-consciousness"] && data["balance-consciousness"] === "true" ? true : data["balance-consciousness"] && data["balance-consciousness"] === "false" ? false : null,
            parq_boneJoint: data["bone-joint"] && data["bone-joint"] === "true" ? true : data["bone-joint"] && data["bone-joint"] === "false" ? false : null,
            parq_bloodPressureMeds: data["blood-pressure-meds"] && data["blood-pressure-meds"] === "true" ? true : data["blood-pressure-meds"] && data["blood-pressure-meds"] === "false" ? false : null,
            parq_otherReasons: data["other-reasons"] && data["other-reasons"] === "true" ? true : data["other-reasons"] && data["other-reasons"] === "false" ? false : null,
            operational_occupation: data.occupation ?? null,
            operational_extendedSitting: data["extended-sitting"] && data["extended-sitting"] === "true" ? true : data["extended-sitting"] && data["extended-sitting"] === "false" ? false : null,
            operational_repetitiveMovements: data["repetitive-movements"] && data["repetitive-movements"] === "true" ? true : data["repetitive-movements"] && data["repetitive-movements"] === "false" ? false : null,
            operational_explanation_repetitiveMovements: data["explanation_repetitive-movements"] ?? null,
            operational_heelShoes: data["heel-shoes"] && data["heel-shoes"] === "true" ? true : data["heel-shoes"] && data["heel-shoes"] === "false" ? false : null,
            operational_mentalStress: data["mental-stress"] && data["mental-stress"] === "true" ? true : data["mental-stress"] && data["mental-stress"] === "false" ? false : null,
            recreational_physicalActivities: data["physical-activities"] && data["physical-activities"] === "true" ? true : data["physical-activities"] && data["physical-activities"] === "false" ? false : null,
            recreational_explanation_physicalActivities: data["explanation_physical-activities"] ?? null,
            recreational_hobbies: data.hobbies && data.hobbies === "true" ? true : data.hobbies && data.hobbies === "false" ? false : null,
            recreational_explanation_hobbies: data.explanation_hobbies ?? null,
            medical_injuriesPain: data["injuries-pain"] && data["injuries-pain"] === "true" ? true : data["injuries-pain"] && data["injuries-pain"] === "false" ? false : null,
            medical_explanation_injuriesPain: data["explanation_injuries-pain"] ?? null,
            medical_surgeries: data.surgeries && data.surgeries === "true" ? true : data.surgeries && data.surgeries === "false" ? false : null,
            medical_explanation_surgeries: data.explanation_surgeries ?? null,
            medical_chronicDisease: data["chronic-disease"] && data["chronic-disease"] === "true" ? true : data["chronic-disease"] && data["chronic-disease"] === "false" ? false : null,
            medical_explanation_chronicDisease: data["explanation_chronic-disease"] ?? null,
            medical_medications: data.medications && data.medications === "true" ? true : data.medications && data.medications === "false" ? false : null,
            medical_explanation_medications: data.explanation_medications ?? null,
          }
          return updateUserFitnessProfile(user.id, fitnessProfileObj)
          // return null
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => json("ok", {
          headers: {
            "Set-Cookie": await darkModeCookie.serialize(darkMode),
          }
        }),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const avatarFetcher = useFetcher<avatarFetcherType>();
  const userSettingsFetcher = useFetcher<userSettingsFormType>();
  const fitnessProfileFetcher = useFetcher<fitnessProfileFormType>();
  const actionData = useActionData<userSettingsFormType>();
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
    if (userSettingsFetcher) {
      if (userSettingsFetcher.data?.errors) {
        toast.error("Uh oh. The request failed")
      } else if (userSettingsFetcher.data?.updatedAt) {
        toast.success("Profile updated.")
      }
    }
  }, [userSettingsFetcher])

  useEffect(() => {
    if (avatarFetcher.data) {
      if (avatarFetcher.data?.error) {
        toast.error(avatarFetcher.data.error)
      } else if (avatarFetcher.data.success) {
        toast.success("Profile photo uploaded")
      }
    }
  }, [avatarFetcher])

  useEffect(() => {
    if (fitnessProfileFetcher.data) {
      if (fitnessProfileFetcher.data?.errors) {
        toast.error("Failed to update fitness profile")
      } else if (fitnessProfileFetcher.data) {
        toast.success("Fitness profile saved.")
      }
    }
  }, [fitnessProfileFetcher])
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
    <div className="px-2 md:px-3 flex flex-col h-full select-none lg:w-3/4 xl:w-2/3 bg-background text-foreground">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="fitness">Fitness Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="flex flex-col gap-y-4">
          <div className="text-muted-foreground">Manage your account settings and user information.</div>
          {/* Profile Photo */}
          <div className="flex flex-col space-y-4 lg:w-3/4 xl:w-2/3">
            <Label className="text-lg">Profile Photo</Label>
            <Avatar
              className="size-48 cursor-pointer hover:opacity-80 transition-opacity"
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
          {/* User Settings */}
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>
                Keep your user profile up to date.
              </CardDescription>
            </CardHeader>
            <CardContent>
            <userSettingsFetcher.Form
              method="post"
              className="flex flex-col gap-y-2"
            >
              <>
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
                {userSettingsFetcher.data?.errors?.firstName ? <span className="text-red-500 text-xs">{userSettingsFetcher.data?.errors?.firstName}</span> : null}
              </>

              <>
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
                {userSettingsFetcher.data?.errors?.lastName ? <span className="text-red-500 text-xs">{userSettingsFetcher.data?.errors?.lastName}</span> : null}
              </>

              <>
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
                {userSettingsFetcher.data?.errors?.email ? <span className="text-red-500 text-xs">{userSettingsFetcher.data?.errors?.email}</span> : null}
              </>
            
              <Button
                type="submit" 
                disabled={isUpdatingProfile || !hasChanges}
                className="w-fit self-end"
                name="_action"
                value="updateUserProfile"
              >
                {isUpdatingProfile ? "Saving..." : "Save changes"}
              </Button>
            </userSettingsFetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fitness">
          <fitnessProfileFetcher.Form method="post" className="flex flex-col gap-y-4">
            <div className="text-muted-foreground -mt-2">Keep your fitness profile up to date.</div>
            <ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-12.5rem)]">
              <FitnessSettings fitnessProfile={user.fitnessProfile} />
            </ScrollArea>
            <div className="flex justify-end">
              <Button
                type="submit"
                name="_action"
                value="updateFitnessProfile"
              >
                Save Fitness Profile
              </Button>
            </div>
          </fitnessProfileFetcher.Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}