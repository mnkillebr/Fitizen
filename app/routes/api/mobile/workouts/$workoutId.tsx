import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getWorkout } from "~/models/workout.server";
import { generateMuxGifToken, generateMuxThumbnailToken, generateMuxVideoToken } from "~/mux-tokens.server";
import { exerciseDetailsMap } from "~/routes/app/workouts/$workoutId";

export async function loader({ params }: LoaderFunctionArgs) {
  const workoutId = params.workoutId as string;
  const workout = await getWorkout(workoutId)
  const tokenMappedExercises = workout?.exercises.map(ex_item => {
    const smartCrop = () => {
      let crop = ["Lateral Lunge", "Band Assisted Leg Lowering", "Ankle Mobility", "Kettlebell Swing", "Half Kneel Kettlebell Press"]
      if (crop.includes(ex_item.exercise.name)) {
        return "smartcrop"
      } else {
        return undefined
      }
    }
    const heightAdjust = () => {
      let adjustments = ["Pushup", "Kettlebell Swing", "Kettlebell Renegade Row", "Half Kneel Kettlebell Press"]
      let expand = ["Lateral Bound", "Mini Band Walks"]
      if (adjustments.includes(ex_item.exercise.name)) {
        return "481"
      } else if (expand.includes(ex_item.exercise.name)) {
        return "1369"
      } else {
        return undefined
      }
    }
    const thumbnailToken = generateMuxThumbnailToken(ex_item.exercise.muxPlaybackId, smartCrop(), heightAdjust())
    const gifToken = generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")
    const videoToken = generateMuxVideoToken(ex_item.exercise.muxPlaybackId)
    return {
      ...ex_item,
      ...ex_item.exercise,
      videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
      gif: gifToken ? `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${gifToken}` : undefined
    }
  }) ?? []

  const exerciseDetails = exerciseDetailsMap(workout?.exercises, tokenMappedExercises)
  return json({
    workout,
    exerciseDetails,
  });
};