import { Exercise, ExerciseTarget, LoadUnit, Prisma, ProgramExerciseLog } from "@prisma/client";
import db from "~/db.server";
import { getAllExercises } from "./exercise.server";

interface ProgramExerciseLogType extends ProgramExerciseLog {
  set: string;
  actualReps?: string;
  load?: number;
  notes?: string;
  unit: LoadUnit,
}

export async function createIntroProgram() {
  try {
    const exercises = await getAllExercises(null)
    const createMovementPrep = await db.movementPrep.create({
      data: {
        name: "Adult Intro Movement Prep",
        description: "Standard MFR, breathing and activation",
        foamRolling: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Cw5cmTFxPI01b3JnpKoJfqC5zbMHFswUhiw9RRiRwYFc")?.id as string, // glute
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Y13TPfdmBJfGuTMMiSfGGb9jSYJTw8fKs01YryBsPgYs")?.id as string, // hamstring
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rFdQoRqApDggajrJow9I5k00M029hrefKh7VVMbBHM1WE")?.id as string, // calves
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "lq2ZVeykjOh45SUNWoiwM00tu02qcajnInczgDo4rGdSg")?.id as string, // upper back
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "eVXOea01MfF3J4Zt1wGzu7y1uJy01byZO7NMnMIaYBy6I")?.id as string, // hip flexor
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "QQF00WuozkKsLX8hseLcK67p5bmfnNYgqGQ6TitusMVA")?.id as string, // quads
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GQa5WWwzNCwfamKzjMDcyJY1Z3bT29BoArujL4YPTjs")?.id as string, // adductors
              reps: 5,
            },
          ],
        },
        mobility: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "00D40000iYKRrC8HVKs501wQbddgiQXp01WehdItlacgmLag")?.id as string, // ankle mobility
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "VBGBVJn4Cq6LbhY8eDrWhHSf5TQIjzQoAh01YvdZPnbA")?.id as string, // split squat hold
              reps: 5,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "AlWsecKmWNVgzMQs47AahMUffH5O9yczvcv015FqsFZo")?.id as string, // Lateral Lunge
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // sldl
              reps: 5,
            },
          ],
        },
        activation: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "V7Dn1nXOTZ8EpkXguAY5ts00ZbKaKDKT02MngV2GwYK2o")?.id as string,     // supine breathing
              reps: 5,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Ep00hFh29GqHiP00r00pMFSRlCOfJAdddgdDiAENY01i6qI")?.id as string,     // adductor rock
              reps: 10,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "NXwfuEWW3QL1xqXC97b87xVhyAcoWCuikh971VbWXK8")?.id as string,     // floorslide
              reps: 8,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "N602azha2Y3XjCw4QkJcbrGH6TzIYS02ZE2PegWcsvN00g")?.id as string,     // band assisted leg lowering
              reps: 8,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "afK1OG5pBpn02mYeC5W5YMQKFeeFPzgd8gxGYbtmj7s4")?.id as string,     // glute bridge
              reps: 8,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "5a5ziapKMdlI01rLQqzA3f93Fo1xrpHIkR02g8GCGq1008")?.id as string,     // v stance t spine
              reps: 5,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "vBU0063pFAXYUcfeQiPWJokcLFaC4jh8KU8PFtrQsiYI")?.id as string,     // 90/90 er/ir
              reps: 5,
              time: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "2hfDY4jzZeTRi7unQ117qNVstu89TMABMMlxe4X6mhE")?.id as string,     // spiderman stretch
              reps: 5,
              time: 5,
            },
          ],
        },
      }
    });
    console.log("create movement prep done ...")
    const createWarmup1 = await db.warmup.create({
      data: {
        name: "Adult Intro Warmup Drills",
        description: "Active warm-up, ladder drills, plyometrics",
        dynamic: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "JZaigadq02A3tlHu1o01dpfM2t52dGdkc01P003iu013FfEE")?.id as string, // knee to chest
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "KOq1C4Ja7A918fGQ2YQkRTiMSfFzwFzJWmAnQUtsVR8")?.id as string, // leg cradle
              reps: 10,
            },
          ],
        },
        power: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "01SmwwKgzv6RNkCqQ9D01VnYS00cxd01AD5XtX5022pgh82Q")?.id as string,     // standing side toss
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "02avXkiqQduLZs002VXCTWyXUNv9KwcLDzGT9i001bpt2c")?.id as string,     // box jump
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GZVFaJSzhPVIG400nJnqtvWG02AtUqhaU35wqq6IuuG2w")?.id as string,     // mini band er/ir
              reps: 8,
            },
          ],
        },
      }
    });
    console.log("create warmup 1 done ...")
    const createWarmup2 = await db.warmup.create({
      data: {
        name: "Adult Intro Warmup Drills",
        description: "Active warm-up, ladder drills, plyometrics",
        dynamic: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "JZaigadq02A3tlHu1o01dpfM2t52dGdkc01P003iu013FfEE")?.id as string, // knee to chest
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "KOq1C4Ja7A918fGQ2YQkRTiMSfFzwFzJWmAnQUtsVR8")?.id as string, // leg cradle
              reps: 10,
            },
          ],
        },
        power: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "h01LmuQbT3mgLVdWSLIaXfcIP7NoYP5Yo8pHP1CFMpNw")?.id as string,     // standing chest pass
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "EMkDMJBy8ByKJJgXdCV7zHn8BIJ7OcxtKA00nRar7tjk")?.id as string,     // lateral bound
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "S8xXg01R01RxbX2H2exILoA2mhlUJRaLekbkwyznhFUyw")?.id as string,     // mini band walk
              reps: 8,
            },
          ],
        },
      }
    });
    console.log("create warmup 2 done ...")
    const createWarmup3 = await db.warmup.create({
      data: {
        name: "Adult Intro Warmup Drills",
        description: "Active warm-up, ladder drills, plyometrics",
        dynamic: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "JZaigadq02A3tlHu1o01dpfM2t52dGdkc01P003iu013FfEE")?.id as string, // knee to chest
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "KOq1C4Ja7A918fGQ2YQkRTiMSfFzwFzJWmAnQUtsVR8")?.id as string, // leg cradle
              reps: 10,
            },
          ],
        },
        power: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "01SmwwKgzv6RNkCqQ9D01VnYS00cxd01AD5XtX5022pgh82Q")?.id as string,     // standing side toss
              reps: 10,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "02avXkiqQduLZs002VXCTWyXUNv9KwcLDzGT9i001bpt2c")?.id as string,     // box jump
              reps: 5,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "RAQQsSCA61EIepOENElDW01gC8i9nZssUo7001UhvthmA")?.id as string,     // oh ball slam
              reps: 8,
            },
          ],
        },
      }
    });
    console.log("create warmup 3 done ...")
    const createCooldown = await db.cooldown.create({
      data: {
        name: "Intro Bike Conditioning",
        exercises: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "43ECbGKiNUdiLf3TTuRCRBAqmCgQOdcYH6GQaB66g9g")?.id as string,     // bike conditioning
              time: 60,
            }
          ]
        }
      },
    });
    console.log("create cooldown done ...")
    const createProgram = await db.program.create({
      data: {
        name: "Intro Athletic Conditioning",
        description: "An introductory sports conditioning program suitable for adults. This program assumes you have no current injuries or contraindications to exercise. It focuses on building baseline core strength and movement patterns for the entire body. Upon completion, athletes can expect greater mobility, strength and endurance.",
        isFree: true,
        s3ImageKey: "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/qihappk1bjsgt7wvyec6",
        weeks: {
          create: [
            {
              weekNumber: 1,
              days: {
                create: [
                  {
                    dayNumber: 1,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup1.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "ieS02o8ylL00mb23Yu15II968S675LKwD7xzjBTfw3wOo")?.id as string, // goblet squat
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GTy01N9EDc023ZE02QRVUPaF7eDaiurrnyO5z2W6oo8VTo")?.id as string, // x pulldown
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rVEb9AaVBs3nVgWYTgAU01YFUGbQ8z7Y022XbntnEXyV4")?.id as string, // standing static chop
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA")?.id as string, // tall kneel pallof
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "nepxkswcJlH82X26jnzEKAeol2qbTlTAM9FWdytsseE")?.id as string, // pushup
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 2,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup2.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "mCd01PET6JsK1Fj00N0000xxFaoMR3oAjYPPuLX02FxlbI2U")?.id as string, // kb dead
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "sFaVdiBlu01J6HwfpFo83ukkfV29mKGUrlYIVCC5oEi8")?.id as string, // tall kneel anti rot hold
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "VBGBVJn4Cq6LbhY8eDrWhHSf5TQIjzQoAh01YvdZPnbA")?.id as string, // split squat hold
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J3UeencZvHDF9hhnA44IPY00xLrx00ybVcfeEON02be4z4")?.id as string, // standing static lift
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J01ugm7CbJuuP9uBXu2DIkKKAXbnhY4gKgaOseP00ccKc")?.id as string, // db bench
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo")?.id as string, // reaching lateral lunge
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 5,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "G02qub2Qj013kbp44UaNK2WdSBDqdOGTA01Wu01ipBPBHRI")?.id as string, // suitcase carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 3,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup3.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM")?.id as string, // goblet split squat
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "AbyDWdldxxJG72KnkGTTk74Xolx4Hf84GyMnhEz200TM")?.id as string, // w pulldown
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rzI8edfeiH3kFAKcaqJOvezk1Z02fQapq1DvcfDQuAFI")?.id as string, // half kneel inline row
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "BZ3n1EIPqDDY5FXE9psTpZCerOLA2cmQhCPRa5jBGUE")?.id as string, // incline db bench
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "afK1OG5pBpn02mYeC5W5YMQKFeeFPzgd8gxGYbtmj7s4")?.id as string, // hip lift
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "17ZQ1BvMNv011z5hmmyC00RzPhQhn2l1EclwJUMgKoEJQ")?.id as string, // sled push
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              weekNumber: 2,
              days: {
                create: [
                  {
                    dayNumber: 1,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup1.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "ieS02o8ylL00mb23Yu15II968S675LKwD7xzjBTfw3wOo")?.id as string, // goblet squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GTy01N9EDc023ZE02QRVUPaF7eDaiurrnyO5z2W6oo8VTo")?.id as string, // x pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rVEb9AaVBs3nVgWYTgAU01YFUGbQ8z7Y022XbntnEXyV4")?.id as string, // standing static chop
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA")?.id as string, // tall kneel pallof
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "nepxkswcJlH82X26jnzEKAeol2qbTlTAM9FWdytsseE")?.id as string, // pushup
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 2,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup2.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "mCd01PET6JsK1Fj00N0000xxFaoMR3oAjYPPuLX02FxlbI2U")?.id as string, // kb dead
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "sFaVdiBlu01J6HwfpFo83ukkfV29mKGUrlYIVCC5oEi8")?.id as string, // tall kneel anti rot hold
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 20,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "VBGBVJn4Cq6LbhY8eDrWhHSf5TQIjzQoAh01YvdZPnbA")?.id as string, // split squat hold
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J3UeencZvHDF9hhnA44IPY00xLrx00ybVcfeEON02be4z4")?.id as string, // standing static lift
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J01ugm7CbJuuP9uBXu2DIkKKAXbnhY4gKgaOseP00ccKc")?.id as string, // db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo")?.id as string, // reaching lateral lunge
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 5,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "G02qub2Qj013kbp44UaNK2WdSBDqdOGTA01Wu01ipBPBHRI")?.id as string, // suitcase carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 3,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup3.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM")?.id as string, // goblet split squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "AbyDWdldxxJG72KnkGTTk74Xolx4Hf84GyMnhEz200TM")?.id as string, // w pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 15,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rzI8edfeiH3kFAKcaqJOvezk1Z02fQapq1DvcfDQuAFI")?.id as string, // half kneel inline row
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "BZ3n1EIPqDDY5FXE9psTpZCerOLA2cmQhCPRa5jBGUE")?.id as string, // incline db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "afK1OG5pBpn02mYeC5W5YMQKFeeFPzgd8gxGYbtmj7s4")?.id as string, // hip lift
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "17ZQ1BvMNv011z5hmmyC00RzPhQhn2l1EclwJUMgKoEJQ")?.id as string, // sled push
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              weekNumber: 3,
              days: {
                create: [
                  {
                    dayNumber: 1,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup1.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "ieS02o8ylL00mb23Yu15II968S675LKwD7xzjBTfw3wOo")?.id as string, // goblet squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GTy01N9EDc023ZE02QRVUPaF7eDaiurrnyO5z2W6oo8VTo")?.id as string, // x pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 20,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rVEb9AaVBs3nVgWYTgAU01YFUGbQ8z7Y022XbntnEXyV4")?.id as string, // standing static chop
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA")?.id as string, // tall kneel pallof
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "nepxkswcJlH82X26jnzEKAeol2qbTlTAM9FWdytsseE")?.id as string, // pushup
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 2,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup2.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "mCd01PET6JsK1Fj00N0000xxFaoMR3oAjYPPuLX02FxlbI2U")?.id as string, // kb dead
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "sFaVdiBlu01J6HwfpFo83ukkfV29mKGUrlYIVCC5oEi8")?.id as string, // tall kneel anti rot hold
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 20,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "VBGBVJn4Cq6LbhY8eDrWhHSf5TQIjzQoAh01YvdZPnbA")?.id as string, // split squat hold
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 20,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J3UeencZvHDF9hhnA44IPY00xLrx00ybVcfeEON02be4z4")?.id as string, // standing static lift
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J01ugm7CbJuuP9uBXu2DIkKKAXbnhY4gKgaOseP00ccKc")?.id as string, // db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo")?.id as string, // reaching lateral lunge
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "G02qub2Qj013kbp44UaNK2WdSBDqdOGTA01Wu01ipBPBHRI")?.id as string, // suitcase carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 3,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup3.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM")?.id as string, // goblet split squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "AbyDWdldxxJG72KnkGTTk74Xolx4Hf84GyMnhEz200TM")?.id as string, // w pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 20,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rzI8edfeiH3kFAKcaqJOvezk1Z02fQapq1DvcfDQuAFI")?.id as string, // half kneel inline row
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "BZ3n1EIPqDDY5FXE9psTpZCerOLA2cmQhCPRa5jBGUE")?.id as string, // incline db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "afK1OG5pBpn02mYeC5W5YMQKFeeFPzgd8gxGYbtmj7s4")?.id as string, // hip lift
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "17ZQ1BvMNv011z5hmmyC00RzPhQhn2l1EclwJUMgKoEJQ")?.id as string, // sled push
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              weekNumber: 4,
              days: {
                create: [
                  {
                    dayNumber: 1,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup1.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "ieS02o8ylL00mb23Yu15II968S675LKwD7xzjBTfw3wOo")?.id as string, // goblet squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "GTy01N9EDc023ZE02QRVUPaF7eDaiurrnyO5z2W6oo8VTo")?.id as string, // x pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 25,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rVEb9AaVBs3nVgWYTgAU01YFUGbQ8z7Y022XbntnEXyV4")?.id as string, // standing static chop
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA")?.id as string, // tall kneel pallof
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "nepxkswcJlH82X26jnzEKAeol2qbTlTAM9FWdytsseE")?.id as string, // pushup
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 2,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup2.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "mCd01PET6JsK1Fj00N0000xxFaoMR3oAjYPPuLX02FxlbI2U")?.id as string, // kb dead
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "sFaVdiBlu01J6HwfpFo83ukkfV29mKGUrlYIVCC5oEi8")?.id as string, // tall kneel anti rot hold
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 25,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "VBGBVJn4Cq6LbhY8eDrWhHSf5TQIjzQoAh01YvdZPnbA")?.id as string, // split squat hold
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J3UeencZvHDF9hhnA44IPY00xLrx00ybVcfeEON02be4z4")?.id as string, // standing static lift
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "J01ugm7CbJuuP9uBXu2DIkKKAXbnhY4gKgaOseP00ccKc")?.id as string, // db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension row
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo")?.id as string, // reaching lateral lunge
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "G02qub2Qj013kbp44UaNK2WdSBDqdOGTA01Wu01ipBPBHRI")?.id as string, // suitcase carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    }
                  },
                  {
                    dayNumber: 3,
                    movementPrepId: createMovementPrep.id,
                    warmupId: createWarmup3.id,
                    cooldownId: createCooldown.id,
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM")?.id as string, // goblet split squat
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "AbyDWdldxxJG72KnkGTTk74Xolx4Hf84GyMnhEz200TM")?.id as string, // w pulldown
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "Mjj9s00w01WexyvKV1Aia5IMmcXxWSn1WQzGjbBrF7kow")?.id as string, // front plank
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 25,
                              }
                            ]
                          }
                        },
                        {
                          blockNumber: 2,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // reaching sldl
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "rzI8edfeiH3kFAKcaqJOvezk1Z02fQapq1DvcfDQuAFI")?.id as string, // half kneel inline row
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "BZ3n1EIPqDDY5FXE9psTpZCerOLA2cmQhCPRa5jBGUE")?.id as string, // incline db bench
                                orderInBlock: 3,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                            ]
                          }
                        },
                        {
                          blockNumber: 3,
                          exercises: {
                            create: [
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "afK1OG5pBpn02mYeC5W5YMQKFeeFPzgd8gxGYbtmj7s4")?.id as string, // hip lift
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "17ZQ1BvMNv011z5hmmyC00RzPhQhn2l1EclwJUMgKoEJQ")?.id as string, // sled push
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 10,
                              },
                              {
                                exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4")?.id as string, // farmers carry
                                orderInBlock: 3,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                            ]
                          }
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }
      },
      include: {
        weeks: true,
      }
    });
    console.log("create program complete ...")
    return createProgram;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export function getAllPrograms(query: string | null) {
  return db.program.findMany({
    where: {
      name: {
        contains: query || "",
        mode: "insensitive",
      },
    },
    orderBy: [
      {
        name: "desc",
      }
    ],
  });
};

export function getProgramById(programId: string) {
  return db.program.findUnique({
    where: { id: programId },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              blocks: {
                include: {
                  exercises: {
                    select: {
                      programBlockId: true,
                      exercise: {
                        select: {
                          id: true,
                          name: true,
                          muxPlaybackId: true,
                          cues: true,
                        },
                      },
                      orderInBlock: true,
                      sets: true,
                      reps: true,
                      time: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getUserProgramLogsByProgramId(userId: string, programId: string) {
  try {
    const userProgramLogs = await db.programLog.findMany({
      where: {
        userId,
        programId,
      },
    })
    return userProgramLogs
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function saveUserProgramLog(userId: string, programId: string, programWeek: number, programDay: number, duration: string, exerciseLogs: Array<ProgramExerciseLogType>) {
  try {
    const createUserWorkoutLog = await db.programLog.create({
      data: {
        userId,
        programId,
        programWeek,
        programDay,
        duration,
        exerciseLogs: {
          create: exerciseLogs.map(log => ({
            programBlockId: log.programBlockId,
            exerciseId: log.exerciseId,
            sets: {
              create: [
                {
                  set: log.set,
                  actualReps: log.actualReps,
                  load: log.load,
                  notes: log.notes,
                  unit: log.unit,
                },
              ],
            },
          })),
        },
      },
      include: {
        exerciseLogs: true
      },
    })
    return createUserWorkoutLog;
  } catch (error) {
    console.error('Error creating WorkoutLog with exercise logs:', error);
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   return error.message
    // }
    throw error
  };
}
