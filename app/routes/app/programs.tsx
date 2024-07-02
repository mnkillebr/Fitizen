import boxDude from "images/metin-ozer-S1kp1toFK0A-unsplash.jpg"
import squatGirl from "images/sven-mieke-jO6vBWX9h9Y-unsplash.jpg"

export default function Programs() {
  return (
    <div className="flex flex-col h-full gap-x-6 gap-y-4 snap-y snap-mandatory overflow-y-auto px-2 pb-4">
      <div
        className="relative flex-1 shadow-md cursor-pointer rounded-lg hover:shadow-accent transition duration-150 bg-cover bg-center snap-start text-center"
        style={{backgroundImage: `url(${boxDude})`}}
      >
        <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
          <div className="font-bold">Box Dude Program</div>
          <div className="italic">Difficulty: Advanced</div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
          <div className="content-center select-none bg-accent text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
        </div>
      </div>
      <div
        className="relative flex-1 shadow-md cursor-pointer rounded-lg hover:shadow-accent transition duration-150 bg-cover bg-center snap-start bg-slate-50 text-center"
        style={{backgroundImage: `url(${squatGirl})`}}
      >
        <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
          <div className="font-bold">Squat Girl Program</div>
          <div className="flex gap-2">
            <div>Difficulty:</div>
            <div className="italic">Beginner</div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
          <div className="content-center select-none bg-accent text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
        </div>
      </div>
    </div>
  )
}