import { Exercise as ExerciseType } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { hash } from "~/cryptography.server";
import { getAllExercisesPaginated } from "~/models/exercise.server";
import { generateMuxThumbnailToken, generateMuxVideoToken } from "~/mux-tokens.server";
import { EXERCISE_ITEMS_PER_PAGE_MOBILE } from "~/utils/magicNumbers";

export async function loader({ request }: LoaderFunctionArgs) {
  // const user = await requireLoggedInUser(request);
  // const role = user.role;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? `${EXERCISE_ITEMS_PER_PAGE_MOBILE}`)

  const skip = (page - 1) * limit;
  const pageExercises = await getAllExercisesPaginated(query, skip, limit) as { exercises: ExerciseType[]; count: number }
  const totalPages = Math.ceil(pageExercises.count / limit);
  const tokenMappedExercises = pageExercises ? pageExercises.exercises.map(ex_item => {
    const smartCrop = () => {
      let crop = ["Lateral Lunge", "Band Assisted Leg Lowering", "Ankle Mobility", "Kettlebell Swing", "Half Kneel Kettlebell Press"]
      if (crop.includes(ex_item.name)) {
        return "smartcrop"
      } else {
        return undefined
      }
    }
    const heightAdjust = () => {
      let adjustments = ["Pushup", "Kettlebell Swing", "Kettlebell Renegade Row", "Half Kneel Kettlebell Press"]
      let expand = ["Lateral Bound", "Mini Band Walks"]
      if (adjustments.includes(ex_item.name)) {
        return "481"
      } else if (expand.includes(ex_item.name)) {
        return "1369"
      } else {
        return undefined
      }
    }
    const videoToken = generateMuxVideoToken(ex_item.muxPlaybackId)
    const thumbnailToken = generateMuxThumbnailToken(ex_item.muxPlaybackId, smartCrop(), heightAdjust())
    return {
      ...ex_item,
      videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${ex_item.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
    }
  }) : []
  const exercisesMobileEtag = hash(JSON.stringify(tokenMappedExercises))
  return json(
    {
      exercises: tokenMappedExercises,
      exercisesCount: pageExercises.count,
      page,
      totalPages,
      hasMore: skip + tokenMappedExercises.length < pageExercises.count,
    },
    {
      headers: {
        exercisesMobileEtag,
        "Cache-control": "max-age=3300, stale-while-revalidate=3600"
      }
    })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST":
      // Handle exercise creation
      break;
    case "PUT":
      // Handle exercise update
      break;
    case "DELETE":
      // Handle exercise deletion
      break;
    default:
      return json({ error: "Method not allowed" }, { status: 405 });
  }
};