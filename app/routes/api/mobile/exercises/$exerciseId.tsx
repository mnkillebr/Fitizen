import { LoaderFunctionArgs } from "@remix-run/node";
import { getExercise } from "~/models/exercise.server";
import { generateMuxThumbnailToken, generateMuxVideoToken } from "~/mux-tokens.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const exerciseId = params.exerciseId as string;
  const exercise = await getExercise(exerciseId)
  const videoToken = generateMuxVideoToken(exercise.muxPlaybackId)
  const thumbnailToken = generateMuxThumbnailToken(exercise.muxPlaybackId, undefined, undefined)
  const videoMappedExercise = {
      ...exercise,
      videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${exercise.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
    }
  return videoMappedExercise;
};