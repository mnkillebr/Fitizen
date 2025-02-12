import { HeightUnit, LoadUnit, Role } from "@prisma/client";
import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import db from "~/db.server";
import { createUser, createUserWithProvider, getUserByEmail, getUserByProvider, updateUserFitnessProfile } from "~/models/user.server";
import { generateToken, requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return Response.error()
  }
  const existingUser = await getUserByEmail(email)
  return existingUser
}

export async function action({ request }: ActionFunctionArgs) {
  const jsonData = await request.json();
  const method = request.method;

  switch (method) {
    case "POST": {
      const { action, ...rest } = jsonData
      switch (action) {
        case "checkExistingOAuthUser": {
          const { provider_email, provider_user_id } = rest
          try {
            const existingUser = await getUserByProvider(provider_email, provider_user_id)
            return Response.json({ user: existingUser })
          } catch (error) {
            return data({ errors: { error: "Failed to retrieve user" } }, { status: 500 });
          }
        }
        case "checkExistingEmailUser": {
          const { magic_link_email } = rest
          try {
            const existingUser = await getUserByEmail(magic_link_email)
            if (existingUser) {
              const token = generateToken(existingUser);
              return Response.json({ user: existingUser, token })
            } else {
              return Response.json({ user: null })
            }
          } catch (error) {
            return data({ errors: { error: "Failed to retrieve user" } }, { status: 500 });
          }
        }
        case "createUser": {
          const { firstName, lastName, email, provider, provider_user_id } = rest
          try {
            let user
            if (provider && provider_user_id) {
              user = await createUserWithProvider(email, firstName, lastName, provider, provider_user_id);
            }
            user = await createUser(email, firstName, lastName)
            const token = generateToken(user);
            return Response.json({ user, token })
          } catch (error) {
            return data({ errors: { error: "Failed to create user" } }, { status: 500 });
          }
        }
        case "updateUserProfile": {
          const user = await requireAuth(request);
          const fitnessProfileObj = {
            height: rest.height ? parseInt(rest.height) : null,
            heightUnit: rest.heightUnit === "in" ? HeightUnit.inches : HeightUnit.centimeters,
            unit: rest.unit === "lbs" ? LoadUnit.pound : LoadUnit.kilogram,
            currentWeight: rest.currentWeight ? parseInt(rest.currentWeight) : null,
            targetWeight: rest.targetWeight ? parseInt(rest.targetWeight) : null,
            goal_fatLoss: rest["fat-loss"] ? true : null,
            goal_endurance: rest.endurance ? true : null,
            goal_buildMuscle: rest["build-muscle"] ? true : null,
            goal_loseWeight: rest["lose-weight"] ? true : null,
            goal_improveBalance: rest["improve-balance"] ? true : null,
            goal_improveFlexibility: rest["improve-flexibility"] ? true : null,
            goal_learnNewSkills: rest["learn-new-skills"] ? true : null,
            parq_heartCondition: rest["heart-condition"] ? true : rest["heart-condition"] === false ? false : null,
            parq_chestPainActivity: rest["chest-pain-activity"] ? true : rest["chest-pain-activity"] === false ? false : null,
            parq_chestPainNoActivity: rest["chest-pain-no-activity"] ? true : rest["chest-pain-no-activity"] === false ? false : null,
            parq_balanceConsciousness: rest["balance-consciousness"] ? true : rest["balance-consciousness"] === false ? false : null,
            parq_boneJoint: rest["bone-joint"] ? true : rest["bone-joint"] === false ? false : null,
            parq_bloodPressureMeds: rest["blood-pressure-meds"] ? true : rest["blood-pressure-meds"] === false ? false : null,
            parq_otherReasons: rest["other-reasons"] ? true : rest["other-reasons"] === false ? false : null,
            operational_occupation: rest.occupation ?? null,
            operational_extendedSitting: rest["extended-sitting"] ? true : rest["extended-sitting"] === false ? false : null,
            operational_repetitiveMovements: rest["repetitive-movements"] ? true : rest["repetitive-movements"] === false ? false : null,
            operational_explanation_repetitiveMovements: rest["explanation_repetitive-movements"] ?? null,
            operational_heelShoes: rest["heel-shoes"] ? true : rest["heel-shoes"] === false ? false : null,
            operational_mentalStress: rest["mental-stress"] ? true : rest["mental-stress"] === false ? false : null,
            recreational_physicalActivities: rest["physical-activities"] ? true : rest["physical-activities"] === false ? false : null,
            recreational_explanation_physicalActivities: rest["explanation_physical-activities"] ?? null,
            recreational_hobbies: rest.hobbies ? true : rest.hobbies === false ? false : null,
            recreational_explanation_hobbies: rest.explanation_hobbies ?? null,
            medical_injuriesPain: rest["injuries-pain"] ? true : rest["injuries-pain"] === false ? false : null,
            medical_explanation_injuriesPain: rest["explanation_injuries-pain"] ?? null,
            medical_surgeries: rest.surgeries ? true : rest.surgeries === false ? false : null,
            medical_explanation_surgeries: rest.explanation_surgeries ?? null,
            medical_chronicDisease: rest["chronic-disease"] ? true : rest["chronic-disease"] === false ? false : null,
            medical_explanation_chronicDisease: rest["explanation_chronic-disease"] ?? null,
            medical_medications: rest.medications ? true : rest.medications === false ? false : null,
            medical_explanation_medications: rest.explanation_medications ?? null,
          }
          try {
            const userWithProfile = await updateUserFitnessProfile(user.id, fitnessProfileObj)
            const userProfile = userWithProfile.fitnessProfile
            return Response.json(userProfile)
          } catch (error) {
            return data({ errors: { error: "Failed to update user profile" } }, { status: 500 });
          }
        }
        default: {
          return Response.json({})
        }
      }
      // const { magic_link_email, provider_email, provider_user_id } = jsonData
      // if (magic_link_email) {
      //   const existingUser = await getUserByEmail(magic_link_email)
      //   return existingUser
      // }
      // const existingUser = await getUserByProvider(provider_email, provider_user_id)
      // return existingUser
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