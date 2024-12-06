// app/routes/verify-email.tsx
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useSignUp, useSignIn } from "@clerk/remix";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";
import { Label } from "~/components/ui/label";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const authType = url.searchParams.get("type");
  return json({ email, authType })
}


const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6, "Verification code should be 6 characters long"),
  type: z.string().min(6, "Missing verification type"),
})

type verifyActionType = {
  code: string;
  email: string;
  type: string;
  errors?: {
    [key: string]: string;
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return validateForm(
    formData,
    verifySchema,
    async ({ code, email, type }) => {
      return json({ code, email, type })
    },
    (errors) => json(
      { errors },
      { status: 400 }
    )
  )
}

export default function VerifyEmail() {
  const { email, authType } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<verifyActionType>();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  if (!isSignUpLoaded || !isSignInLoaded) return null;

  async function handleVerification(code: string) {
    try {
      if (authType === "signup") {
        await signUp?.attemptEmailAddressVerification({ code });
        return navigate(`/auth/callback?type=signup`);
      } else {
        await signIn?.attemptFirstFactor({ 
          strategy: "email_code",
          code 
        });
        return navigate(`/auth/callback?type=signin`);
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (actionData?.code) {
    handleVerification(actionData.code);
  }

  const handleResendCode = async () => {
    try {
      if (authType === "signup") {
        await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      } else {
        await signIn?.create({
          strategy: "email_code",
          identifier: email || "",
        });
      }
    } catch (err) {
      console.error("Error resending code:", err);
    }
  };

  return (
    <div className="text-center mt-32 text-foreground flex justify-center">
      <div className="flex flex-col gap-y-3 border dark:border-border-muted rounded-md p-6 w-full max-w-2xl">
        <h1 className="font-bold text-3xl mb-5">Verify Your Email</h1>
        <p className="">Enter the verification code sent to {email}</p>
      
        <Form method="post" className="space-y-4">
          <input type="hidden" name="email" value={email || ""} />
          <input type="hidden" name="type" value={authType || ""} />
          <Label className="text-muted-foreground">Enter verification code</Label>
          <div className="place-self-center">
            <InputOTP
              maxLength={6}
              name="code"
              required
              autoComplete="off"
            >
              <InputOTPGroup className="*:border-border-muted -mt-3">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {actionData?.errors && (
            <Alert variant="destructive" className="text-left">
              {Object.keys(actionData.errors).map(errorKey => <AlertDescription key={errorKey}>{actionData.errors ? actionData.errors[errorKey] : ""}</AlertDescription>)}
            </Alert>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full">
              Verify Email
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              className="w-full"
            >
              Resend Code
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}