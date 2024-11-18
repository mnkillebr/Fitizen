import MuxPlayer from "@mux/mux-player-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type ExerciseDialogProps = {
  exercise: {
    muxPlaybackId: string | null;
    videoToken?: string;
    cues: string[];
  }
}

export function ExerciseDialog ({ exercise }: ExerciseDialogProps) {
  return (
    <div className="flex flex-col md:flex-row gap-x-4">
      <Tabs className="w-full md:hidden" defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="cues">Cues</TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="">
          <MuxPlayer
            streamType="on-demand"
            playbackId={exercise.muxPlaybackId ? exercise.muxPlaybackId : undefined}
            tokens={{ playback: exercise.videoToken, thumbnail: exercise.videoToken }}
            metadataVideoTitle="Placeholder (optional)"
            metadataViewerUserId="Placeholder (optional)"
            primaryColor="#FFFFFF"
            secondaryColor="#000000"
            style={{
              aspectRatio: 9/16,
              width: "100%",
              height: "100%",
              maxHeight: 640,
              maxWidth: 360,
            }}
          />
        </TabsContent>
        <TabsContent value="cues" className="">
          <div className="flex-1 flex flex-col gap-y-2 overflow-y-auto">
            {exercise.cues.map((cue: string, cue_idx: number) => (
              <div key={cue_idx} className="flex w-full border border-border-muted rounded p-2">
                {/* <div className="flex-none w-5">{cue_idx+1}.</div> */}
                <div className="flex-1">{cue}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="hidden md:flex md:flex-col w-full">
        <div className="font-bold mb-2 text-muted-foreground">Video</div>
        <MuxPlayer
          streamType="on-demand"
          playbackId={exercise.muxPlaybackId ? exercise.muxPlaybackId : undefined}
          tokens={{ playback: exercise.videoToken, thumbnail: exercise.videoToken }}
          metadataVideoTitle="Placeholder (optional)"
          metadataViewerUserId="Placeholder (optional)"
          primaryColor="#FFFFFF"
          secondaryColor="#000000"
          style={{
            aspectRatio: 9/16,
            width: "100%",
            height: "100%",
            maxHeight: 640,
            maxWidth: 360,
          }}
        />
      </div>
      <div className="hidden md:flex md:flex-col w-full">
        <div className="font-bold mb-2 text-muted-foreground">Cues</div>
        <div className="flex-1 flex flex-col gap-y-2 overflow-y-auto">
          {exercise.cues.map((cue: string, cue_idx: number) => (
            <div key={cue_idx} className="flex w-full border border-border-muted rounded p-2">
              {/* <div className="flex-none w-5">{cue_idx+1}.</div> */}
              <div className="flex-1">{cue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const exerciseDialogOptions = (title: string) => ({
  title: {
    text: title,
    className: "text-foreground",
  },
  closeButton: {
    show: true,
  },
  panelClassName: ""
})