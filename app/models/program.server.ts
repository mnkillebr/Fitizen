import { ExerciseTarget, LoadUnit, Prisma, ProgramExerciseLog } from "@prisma/client";
import db from "~/db.server";

interface ProgramExerciseLogType extends ProgramExerciseLog {
  set: string;
  actualReps?: string;
  load?: number;
  notes?: string;
  unit: LoadUnit,
}

export async function createIntroProgram() {
  try {
    // const createMovementPrep = await db.movementPrep.create({
    //   data: {
    //     name: "Adult Intro Movement Prep",
    //     description: "Standard MFR, breathing and activation",
    //     foamRolling: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2itj001113mc2n79v6u8", // glute
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2itp001b13mcu6280q4g", // hamstring
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iq2000313mcp6z50xjg", // calves
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iq3000513mcarx2n97f", // upper back
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2ipf000113mcnj7ehhdm", // hip flexor
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2it3000m13mcy1cuu1el", // quads
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iqe000a13mcz68oro6e", // quads
    //           reps: 5,
    //         },
    //       ],
    //     },
    //     mobility: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2iq2000413mch3q3ov4u", // ankle mobility
    //           reps: 10,
    //         },
    //         {
    //           exerciseId: "cm2nl2itf000u13mcwyjcosdh", // split squat hold
    //           reps: 5,
    //           time: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2ito001713mc4uphyxap", // Lateral Lunge
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iqh000d13mcelrwogst", // sldl
    //           reps: 5,
    //         },
    //       ],
    //     },
    //     activation: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2iqx000g13mc6nms2ss0",     // supine breathing
    //           reps: 5,
    //           time: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2io8000013mcormvqwdw",     // adductor rock
    //           reps: 10,
    //         },
    //         {
    //           exerciseId: "cm2nl2ita000q13mc88u9t7wl",     // floorslide
    //           reps: 8,
    //         },
    //         {
    //           exerciseId: "cm2nl2ipp000213mcmn6uqj1l",     // band assisted leg lowering
    //           reps: 8,
    //         },
    //         {
    //           exerciseId: "cm2nl2iqp000f13mctlf60v4h",     // glute bridge
    //           reps: 8,
    //         },
    //         {
    //           exerciseId: "cm2nl2itk001313mc9798pl3i",     // v stance t spine
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iqi000e13mc13qp0m4o",     // 90/90 er/ir
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2iti000x13mcbkpds40y",     // spiderman stretch
    //           reps: 5,
    //         },
    //       ],
    //     },
    //   }
    // });
    // const createWarmup = await db.warmup.create({
    //   data: {
    //     name: "Adult Intro Warmup Drills",
    //     description: "Active warm-up, ladder drills, plyometrics",
    //     dynamic: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2it2000k13mcaiea55eh", // knee to chest
    //           reps: 10,
    //         },
    //         {
    //           exerciseId: "cm2nl2itp001a13mcf0ob4ug4", // leg cradle
    //           reps: 10,
    //         },
    //       ],
    //     },
    //     power: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2iqe000913mcjrqws98d",     // standing side toss
    //           reps: 10,
    //         },
    //         {
    //           exerciseId: "cm2nl2iqf000c13mcdzwar1tf",     // box jump
    //           reps: 5,
    //         },
    //         {
    //           exerciseId: "cm2nl2it3000l13mccxht1p8n",     // mini band er/ir
    //           reps: 8,
    //         },
    //       ],
    //     },
    //   }
    // });
    // const createCooldown = await db.cooldown.create({
    //   data: {
    //     name: "Intro Bike Conditioning",
    //     exercises: {
    //       create: [
    //         {
    //           exerciseId: "cm2nl2iri000i13mcfg520fs0",     // bike conditioning
    //           time: 60,
    //         }
    //       ]
    //     }
    //   },
    // });
    const createProgram = await db.program.create({
      data: {
        name: "Intro Athletic Conditioning",
        description: "An introductory sports conditioning program suitable for adults. This program assumes you have no current injuries or contraindications to exercise. It focuses on building baseline core strength and movement patterns for the entire body. Upon completion, athletes can expect greater mobility, strength and endurance.",
        isFree: true,
        weeks: {
          create: [
            {
              weekNumber: 1,
              days: {
                create: [
                  {
                    dayNumber: 1,
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itp001c13mcu4xpk1gr",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001813mciqz47sfl",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj000z13mc86raf8of",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj001013mckmpuzvqe",
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
                                exerciseId: "cm2nye5az0000r9pm91ts81yt",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itg000v13mcgg24ejw5",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itk001213mcbvgnaxua",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000u13mcwyjcosdh",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: "cm2nl2iti000y13mcj16vwdsc",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq8000813mc9d9ozgkm",
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
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ita000p13mci3mnbzwu",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 5,
                              },
                              {
                                exerciseId: "cm2nl2ira000h13mcmzliuhho",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2iqe000b13mcjjzidmvb",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itn001613mc5gicx9im",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001913mcu5mhdyhz",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2isz000j13mcur1s4lxu",
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
                                exerciseId: "cm2nl2iqp000f13mctlf60v4h",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itd000s13mc883orbg8",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 5,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itp001c13mcu4xpk1gr",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001813mciqz47sfl",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj000z13mc86raf8of",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj001013mckmpuzvqe",
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
                                exerciseId: "cm2nye5az0000r9pm91ts81yt",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itg000v13mcgg24ejw5",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itk001213mcbvgnaxua",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 20,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000u13mcwyjcosdh",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 15,
                              },
                              {
                                exerciseId: "cm2nl2iti000y13mcj16vwdsc",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq8000813mc9d9ozgkm",
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
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2ita000p13mci3mnbzwu",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 5,
                              },
                              {
                                exerciseId: "cm2nl2ira000h13mcmzliuhho",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2iqe000b13mcjjzidmvb",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itn001613mc5gicx9im",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001913mcu5mhdyhz",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2isz000j13mcur1s4lxu",
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
                                exerciseId: "cm2nl2iqp000f13mctlf60v4h",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itd000s13mc883orbg8",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 5,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itp001c13mcu4xpk1gr",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2ito001813mciqz47sfl",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj000z13mc86raf8of",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2itj001013mckmpuzvqe",
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
                                exerciseId: "cm2nye5az0000r9pm91ts81yt",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itg000v13mcgg24ejw5",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2itk001213mcbvgnaxua",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000u13mcwyjcosdh",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 20,
                              },
                              {
                                exerciseId: "cm2nl2iti000y13mcj16vwdsc",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2iq8000813mc9d9ozgkm",
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
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2ita000p13mci3mnbzwu",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ira000h13mcmzliuhho",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2iqe000b13mcjjzidmvb",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itn001613mc5gicx9im",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001913mcu5mhdyhz",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2isz000j13mcur1s4lxu",
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
                                exerciseId: "cm2nl2iqp000f13mctlf60v4h",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2itd000s13mc883orbg8",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 5,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itp001c13mcu4xpk1gr",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2ito001813mciqz47sfl",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itj000z13mc86raf8of",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2itj001013mckmpuzvqe",
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
                                exerciseId: "cm2nye5az0000r9pm91ts81yt",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2itg000v13mcgg24ejw5",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2itk001213mcbvgnaxua",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000u13mcwyjcosdh",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.time,
                                time: 25,
                              },
                              {
                                exerciseId: "cm2nl2iti000y13mcj16vwdsc",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2iq8000813mc9d9ozgkm",
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
                                exerciseId: "cm2nl2itk001413mcna0ghv5e",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2ita000p13mci3mnbzwu",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ira000h13mcmzliuhho",
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
                    movementPrepId: "cm2nwklgc000062vbjzpal5ds",
                    warmupId: "cm2nwklj0000162vbaa6wwwnv",
                    cooldownId: "cm2nwkljm000262vb6ux7eggf",
                    blocks: {
                      create: [
                        {
                          blockNumber: 1,
                          exercises: {
                            create: [
                              {
                                exerciseId: "cm2nl2iqe000b13mcjjzidmvb",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2itn001613mc5gicx9im",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2iq3000613mczi2wpf08",
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
                                exerciseId: "cm2nl2itf000t13mcpac1pha8",
                                orderInBlock: 1,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 8,
                              },
                              {
                                exerciseId: "cm2nl2ito001913mcu5mhdyhz",
                                orderInBlock: 2,
                                sets: 3,
                                target: ExerciseTarget.reps,
                                reps: 12,
                              },
                              {
                                exerciseId: "cm2nl2isz000j13mcur1s4lxu",
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
                                exerciseId: "cm2nl2iqp000f13mctlf60v4h",
                                orderInBlock: 1,
                                sets: 2,
                                target: ExerciseTarget.reps,
                                reps: 10,
                              },
                              {
                                exerciseId: "cm2nl2itd000s13mc883orbg8",
                                orderInBlock: 2,
                                sets: 2,
                                target: ExerciseTarget.time,
                                time: 5,
                              },
                              {
                                exerciseId: "cm2nl2itm001513mcoj3r64pi",
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
