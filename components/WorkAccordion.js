"use client"
import { useState, useId } from "react";
import { myGreen, myPurp } from "@/src/theme";

export default function WorkAccordion({name, impact, features, challenges, architecture}){
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  return(
    <div>
      <button onClick={() => setOpen(prev => !prev)} aria-expanded={open} aria-controls={detailsId} className="w-full text-left cursor-pointer">
        <div className="flex items-center text-title font-bold" style={{color: myGreen}}>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="w-4 h-4 mr-1 shrink-0 transition-transform motion-reduce:transition-none" style={{transform: open ? 'rotate(90deg)' : 'none'}}>
            <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{name}</span>
        </div>
        <p className="text-secondary text-pretty ml-5 mt-1">
          {impact}
          <span aria-hidden="true" className="ml-1 whitespace-nowrap hover:underline" style={{color: myGreen}}>{open ? "less" : "...more"}</span>
        </p>
      </button>
      {/* grid-rows 0fr -> 1fr animates to the content's natural height, so the page grows/shrinks smoothly instead of jumping */}
      <div
        id={detailsId}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{gridTemplateRows: open ? '1fr' : '0fr'}}
        inert={!open}
      >
        <div className="overflow-hidden min-h-0">
        <div className="text-secondary text-pretty ml-5 mt-3 pl-3 text-zinc-300" style={{borderLeft: `1px solid ${myPurp}`}}>
          <div className="font-bold mb-1" style={{color: myPurp}}>features</div>
          <ul className="list-disc ml-4 mb-2">
            {features.map((feature, i) => <li key={i}>{feature}</li>)}
          </ul>
          <div className="font-bold mb-1" style={{color: myPurp}}>architecture</div>
          <ul className="mb-2">
            {architecture.map((tech, i) => (
              <li key={i}><span className="font-bold text-cream">{tech.name}</span>: {tech.desc}</li>
            ))}
          </ul>
          <div className="font-bold mb-1" style={{color: myPurp}}>challenges</div>
          <p>{challenges}</p>
        </div>
        </div>
      </div>
    </div>
  )
}
