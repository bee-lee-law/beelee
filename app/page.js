"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import delta_flyer_img from "@/public/delta_flyer_img.png";
import route_safety_img from "@/public/route_safety_img.png";
import githubMark from '@/public/github-mark.svg';
import linkedInMark from '@/public/InBug-White.png';
import instaMark from '@/public/Instagram_Glyph_White.svg';
import logoCube from '@/public/beeleelogo.svg'
import Link from "next/link";



/* Get rid of usestate/useeffect and use client when deploying, if possible */

  const myGreen = "#45CB85";
  const myPurp = "#A882DD";

  const deltaFlyerDesc = `
    I lean more toward building than polishing, but I still love front-end work. Here's a small rogue-like shooter
    I built in React for fun
  `

  const routeSafetyDesc = `
    Analyzing and visualizing geographic data in a realm close to my home and my heart- bike safety in Grand Rapids.
    Get route safety ratings based on city infrastructure and traffic collision data
  `

  const recentWork = [
    {
      name: "print server",
      impact: `Every printer connection and document template in one place, so troubleshooting is quick and new printing
        workflows are easy to add`,
      features: [
        "One home for printer connections and templates",
        "Custom UI for filling in warehouse documents",
        "Print anything to any warehouse printer, even non-network ones, from the UI or straight from the ERP",
        "Detailed logging",
      ],
      architecture: [
        {name: "MSSQL", desc: "print jobs and logs"},
        {name: "node.js / express", desc: "back-end"},
        {name: "React", desc: "front-end"},
      ],
      challenges: "Printers are finicky. Things only run smoothly when IT keeps the machines up to date",
    },
    {
      name: "wms data integration",
      impact: `Queries that took tens of minutes now take milliseconds, which opens the door to custom dashboards and tools`,
      features: [
        "Syncs WMS data to an on-prem database in near real-time",
        "Keeps data fresh, including catching deleted records",
        "Two separate refresh algorithms, because reliability comes first",
      ],
      architecture: [
        {name: "MSSQL", desc: "synced WMS data"},
        {name: "node.js / express", desc: "sync server"},
      ],
      challenges: "Tuning queries and indexes so the database stays fast",
    },
    {
      name: "carrier invoice reconciliation",
      impact: `Automates a tedious finance task, so shipping costs get tracked and accounted for with real data`,
      features: [
        "Pulls in invoices from USPS, UPS, FedEx, and DHL",
        "Flattens them into one standard format",
        "Checks invoices against business data to generate reconciliation and accrual charges",
      ],
      architecture: [
        {name: "MSSQL", desc: "database"},
        {name: "node.js", desc: "back-end"},
        {name: "React", desc: "front-end"},
      ],
      challenges: `Every carrier invoices differently and has its own quirks, so getting them all into one schema is the hard part`,
    },
  ]

export default function Home() {
  const [debug, setDebug] = useState(false);
  const iconStyle = {width: 25, height: 25}
  const enableDebug = false;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' && enableDebug) {
        setDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex-column items-center justify-center px-6 w-5/6 m-auto mb-4" style={{border: debug ? '1px solid red' : 'none'}}>

      <main className="max-w-2xl w-full ml-auto mr-auto mt-20" style={{border: debug ? '1px solid white' : 'none'}}>
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Logo /> {/* <div className="ml-4" style={{fontSize: '48px'}}>bee lee</div>  */}
          </div> 
          <p className="text-sm">
            My name is <MyName />. I'm a business analyst and back-end developer specializing in data and automation solutions.
            I have a strong background in mathematics, logistics, and management, giving me a valuable perspective when it comes
            to systematic and interpersonal connections
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>projects&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <div className="text-sm">Small slices of my skills and personality</div>
          <div className="flex flex-col items-center justify-around gap-8 mt-4">
            <Project img={route_safety_img} name={"bike route safety"} desc={routeSafetyDesc} link={"maps"} tags={["data", "API", "geography", "GIS"]} />
            <Project img={delta_flyer_img} name={"delta flyer"} desc={deltaFlyerDesc} link={"game"} tags={["React", "javascript", "game"]} />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>recent work&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p className="text-sm">
            Generalist by nature, specialist in warehousing and fulfillment. These are in-house tools I've scoped, built,
            and shipped, so no demos, but here's the gist
          </p>
          <p className="text-sm mt-2">
            Recently worked with{" "}
            <Company name="GrowthSpoke" href="https://growthspoke.com/" />,{" "}
            <Company name="DGRI" href="https://downtowngr.org/" />, and{" "}
            <Company name="Ganzo" href="https://ganzo.co/" />
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {recentWork.map((work) => <WorkAccordion key={work.name} {...work} />)}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>contact&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p className="text-sm">
            Contact me at <a href="mailto:info@beeleelaw.com" style={{color: myGreen}}>info@beeleelaw.com</a> for freelance or hiring inquiries. Resume available on request
          </p>
        </section>
      <footer className="w-full h-14 flex items-center justify-between" style={{border: debug ? '1px solid white' : 'none'}} >
        <hr className="flex-1" style={{color: myPurp}} />
        <div className="flex gap-2 ml-4 mr-2">
          <a href="https://github.com/bee-lee-law/" target="_blank"><Image src={githubMark} alt={'test'} style={iconStyle} /></a>
          <a href="https://www.linkedin.com/in/beelaw/" target="_blank"><Image src={linkedInMark} alt={'test'} style={iconStyle} /></a>
          <a href="https://www.instagram.com/les_reves_dun_bee" target="_blank"><Image src={instaMark} alt={'test'} style={iconStyle} /></a>
        </div>
        <hr className="flex-1" style={{color: myPurp}} />
      </footer>
      </main>


    </div>
  );
}

function Logo(){
  return <Image src={logoCube} alt={'logo'} style={{width: '256px', height: 'auto'}} />
}

function MyName(){
  return(
    <span style={{color: myGreen}}><span className="font-bold">B</span>randon <span className="font-bold">Lee</span> <span className="font-bold">Law</span>rence</span>
  )
}

function Project({img, name, desc, link, tags}){
  return(
    <Link href={link} target="_blank">
      <div className="bg-zinc-700 px-2 py-2 rounded w-5/6 mr-auto ml-auto">
        <div className="flex-row gap-2 mb-1">
          <div className="flex items-center mb-2 font-bold" style={{color: myGreen}}>
            <hr className="flex-1" style={{color: myGreen}} />
            <span className="ml-2 mr-2 ml-2 mr-2">{name}</span>
            <hr className="flex-1" style={{color: myGreen}} />
          </div>
          <Image
            src={img}
            alt={name}
            className="h-full w-auto sm:h-[196px] rounded ml-auto mr-auto mb-4"
            style={{border: `1px solid ${myGreen}`}}
          />
          <div>
            <p className="mt-1 text-xs text-pretty mb-4 ml-4 mr-4">{desc}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {tags.map((tag, i)=><Tag key={i} name={tag}/>)}
        </div>
      </div>
    </Link>
  )
}

function WorkAccordion({name, impact, features, challenges, architecture}){
  const [open, setOpen] = useState(false);
  return(
    <div>
      <button onClick={() => setOpen(prev => !prev)} aria-expanded={open} className="w-full text-left cursor-pointer">
        <div className="flex items-center font-bold" style={{color: myGreen}}>
          <span className="inline-block w-4 text-xs transition-transform" style={{transform: open ? 'rotate(90deg)' : 'none'}}>▸</span>
          <span>{name}</span>
        </div>
        <p className="text-xs text-pretty ml-4 mt-1">
          {impact}
          <span className="ml-1 whitespace-nowrap hover:underline" style={{color: myGreen}}>{open ? "less" : "...more"}</span>
        </p>
      </button>
      {/* grid-rows 0fr -> 1fr animates to the content's natural height, so the page grows/shrinks smoothly instead of jumping */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{gridTemplateRows: open ? '1fr' : '0fr'}}
        inert={!open}
      >
        <div className="overflow-hidden min-h-0">
        <div className="text-xs text-pretty ml-4 mt-3 pl-3 text-zinc-300" style={{borderLeft: `1px solid ${myGreen}`}}>
          <div className="font-bold mb-1" style={{color: myGreen}}>features</div>
          <ul className="list-disc ml-4 mb-2">
            {features.map((feature, i) => <li key={i}>{feature}</li>)}
          </ul>
          <div className="font-bold mb-1" style={{color: myGreen}}>architecture</div>
          <ul className="mb-2">
            {architecture.map((tech, i) => (
              <li key={i}><span className="font-bold" style={{color: myPurp}}>{tech.name}</span> — {tech.desc}</li>
            ))}
          </ul>
          <div className="font-bold mb-1" style={{color: myGreen}}>challenges</div>
          <p>{challenges}</p>
        </div>
        </div>
      </div>
    </div>
  )
}

function Company({name, href}){
  return <a href={href} target="_blank" style={{color: myGreen}}>{name}</a>
}

function Tag({name}){
  return(
    <div className="text-xs rounded-sm px-0.75 py-0.25" style={{color: '#fffef0', background: myPurp}}>
      {name}
    </div>
  )
}