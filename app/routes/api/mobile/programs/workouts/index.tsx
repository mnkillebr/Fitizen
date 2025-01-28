import { data, LoaderFunctionArgs } from "@remix-run/node";
import db from "~/db.server";
import { getProgramById, getUserProgramLogsByProgramId } from "~/models/program.server";
import { generateMuxGifToken } from "~/mux-tokens.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const url = new URL(request.url);
  const programId = url.searchParams.get("id") as string;
  const program = await getProgramById(programId)
  if (program !== null && program.isFree === false) {
    throw data("You do not have access to this program", { status: 401 })
  }
  if (!program) {
    throw data(
      { message: "The program you are attempting to log does not exist"},
      { status: 404, statusText: "Program Not Found" }
    )
  }
  const userCurrentProgramLogs = await getUserProgramLogsByProgramId(user.id, program.id)
  const programLength = program.weeks.length * program.weeks[0].days.length
  const programDay = ((userCurrentProgramLogs.length) % (programLength) % (program.weeks[0].days.length)) + 1
  const programWeek = Math.ceil(((userCurrentProgramLogs.length) % (programLength) + 1) / program.weeks[0].days.length)
  const currentProgramWorkout = program.weeks[programWeek-1].days[programDay-1]
  const movementPrep = await db.movementPrep.findUnique({
    where: {
      id: currentProgramWorkout.movementPrepId,
    },
    include: {
      foamRolling: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      mobility: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      activation: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedMovementPrep = {
    ...movementPrep,
    foamRolling: {
      type: "Foam Rolling",
      order: 1,
      exercises: movementPrep?.foamRolling.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    },
    mobility: {
      type: "Mobility",
      order: 2,
      exercises: movementPrep?.mobility.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    },
    activation: {
      type: "Activation",
      order: 3,
      exercises: movementPrep?.activation.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    }
  }
  const warmup = await db.warmup.findUnique({
    where: {
      id: currentProgramWorkout.warmupId,
    },
    include: {
      dynamic: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      ladder: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      power: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedWarmup = {
    ...warmup,
    dynamic: {
      type: "Dynamic Drills",
      order: 1,
      exercises: warmup?.dynamic.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    },
    ladder: {
      type: "Ladder Drills",
      order: 2,
      exercises: warmup?.ladder.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    },
    power: {
      type: "Power",
      order: 3,
      exercises: warmup?.power.map(ex_item => ({
        ...ex_item,
        exercise: {
          ...ex_item.exercise,
          gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
        }
      })),
    }
  }
  const cooldown = await db.cooldown.findUnique({
    where: {
      id: currentProgramWorkout.cooldownId,
    },
    include: {
      exercises: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedCooldown = {
    ...cooldown,
    exercises: cooldown?.exercises.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        gif: `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(ex_item.exercise.muxPlaybackId, "640")}`
      }
    })),
  }
  const tokenMappedProgramWorkout = {
    ...currentProgramWorkout,
    blocks: currentProgramWorkout.blocks.map(block => ({
      ...block,
      exercises: block.exercises.map(block_ex_item => ({
        ...block_ex_item,
        exercise: {
          ...block_ex_item.exercise,
          gif: `https://image.mux.com/${block_ex_item.exercise.muxPlaybackId}/animated.gif?token=${generateMuxGifToken(block_ex_item.exercise.muxPlaybackId, "640")}`
        }
      }))
    }))
  }
  return {
    program,
    programLength,
    programDay,
    programWeek,
    currentProgramWorkout: tokenMappedProgramWorkout,
    movementPrep: tokenMappedMovementPrep,
    warmup: tokenMappedWarmup,
    cooldown: tokenMappedCooldown,
  }
}