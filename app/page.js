import Image from "next/image";
import delta_flyer_img from "@/public/delta_flyer_img.png";
import route_safety_img from "@/public/route_safety_img.png";
import githubMark from '@/public/github-mark.svg';
import linkedInMark from '@/public/InBug-White.png';
import instaMark from '@/public/Instagram_Glyph_White.svg';
import logoCube from '@/public/beeleelogo.svg'
import Link from "next/link";
import WorkAccordion from "@/components/WorkAccordion";
import { myGreen, myPurp } from "@/src/theme";

  const deltaFlyerDesc = `
    A small rogue-like shooter I built in React for fun. I lean more toward building than polishing, but I still
    love front-end work
  `

  const routeSafetyDesc = `
    Pick two places in Grand Rapids and get a safety rating for the bike route between them, based on city
    infrastructure and traffic collision data. A cause close to my home and my heart
  `

  const recentWork = [
    {
      name: "wms data integration",
      impact: <><strong className="font-bold">Queries that took tens of minutes now take milliseconds</strong>, which opens the door to custom dashboards and tools</>,
      features: [
        "Syncs data from the warehouse management system (WMS) to an on-prem database in near real-time",
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
  const iconStyle = {width: 25, height: 25}

  return (
    <div className="min-h-screen px-4 sm:px-6 mb-4">

      <main className="max-w-xl w-full ml-auto mr-auto mt-12 sm:mt-20">
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <h1><Logo /></h1>
          </div>
          <p className="text-heading mb-4">
            data and automation for businesses that run on logistics
          </p>
          <p>
            My name is <MyName />. I'm a business analyst and back-end developer.
            My background in mathematics, logistics, and management means I build for the systems and for the people
            who use them
          </p>
          <p className="mt-4">
            Open to freelance work and full-time roles. Say hi at <EmailLink />
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center">
            <h2 className="text-heading mb-1 font-bold" style={{color: myPurp}}>recent work&nbsp;</h2>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p>
            Generalist by nature, specialist in warehousing and fulfillment. These are in-house tools I scoped, built,
            and shipped. They live behind company walls, so here's the rundown
          </p>
          <p className="mt-2">
            Recently worked with{" "}
            <Company name="GrowthSpoke" href="https://growthspoke.com/" />,{" "}
            <Company name="DGRI" href="https://downtowngr.org/" />, and{" "}
            <Company name="Ganzo" href="https://ganzo.co/" />
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {recentWork.map((work) => <WorkAccordion key={work.name} {...work} />)}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center">
            <h2 className="text-heading mb-1 font-bold" style={{color: myPurp}}>projects&nbsp;</h2>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p>Side projects you can try in your browser</p>
          <div className="flex flex-col items-center justify-around gap-8 mt-4">
            <Project img={route_safety_img} name={"bike route safety"} desc={routeSafetyDesc} link={"maps"} tags={["data", "API", "geography", "GIS"]} note="Map data can take up to a minute to load" />
            <Project img={delta_flyer_img} name={"delta flyer"} desc={deltaFlyerDesc} link={"game"} tags={["React", "javascript", "game"]} />
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center">
            <h2 className="text-heading mb-1 font-bold" style={{color: myPurp}}>contact&nbsp;</h2>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p>
            Have a project or a role in mind? Say hi
          </p>
          <p className="text-heading font-bold mt-1">
            <EmailLink />
          </p>
          <p className="mt-1">
            For freelance or hiring inquiries. Resume available on request
          </p>
        </section>
      </main>

      <footer className="max-w-xl w-full ml-auto mr-auto h-14 flex items-center justify-between">
        <hr className="flex-1" style={{color: myPurp}} />
        <div className="flex ml-1.5">
          <a href="https://github.com/bee-lee-law/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded"><Image src={githubMark} alt="GitHub (opens in new tab)" style={iconStyle} /></a>
          <a href="https://www.linkedin.com/in/beelaw/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded"><Image src={linkedInMark} alt="LinkedIn (opens in new tab)" style={iconStyle} /></a>
          <a href="https://www.instagram.com/les_reves_dun_bee" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded"><Image src={instaMark} alt="Instagram (opens in new tab)" style={iconStyle} /></a>
        </div>
        <hr className="flex-1" style={{color: myPurp}} />
      </footer>
    </div>
  );
}

function Logo(){
  return <Image src={logoCube} alt="bee lee" style={{width: '256px', height: 'auto'}} />
}

function MyName(){
  return(
    <span style={{color: myGreen}}><span className="font-bold">B</span>randon <span className="font-bold">Lee</span> <span className="font-bold">Law</span>rence</span>
  )
}

function Project({img, name, desc, link, tags, note}){
  return(
    <Link href={link} target="_blank" rel="noopener noreferrer" className="block rounded w-full sm:w-5/6 mr-auto ml-auto">
      <div className="bg-zinc-700 ring-1 ring-transparent hover:ring-brand-green active:ring-brand-green transition-shadow px-2 py-2 rounded">
        <div className="mb-1">
          <div className="flex items-center mb-2 text-card font-bold" style={{color: myPurp}}>
            <hr className="flex-1" style={{color: myPurp}} />
            <span className="ml-2 mr-2">{name}<span className="sr-only"> (opens in new tab)</span></span>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <Image
            src={img}
            alt=""
            className="h-auto w-auto max-w-full sm:h-[196px] rounded ml-auto mr-auto mb-4"
            style={{border: `1px solid ${myPurp}`}}
          />
          <div>
            <p className="mt-1 text-secondary text-pretty mb-4 mx-2 sm:mx-4">{desc}</p>
            {note && <p className="text-meta text-zinc-300 -mt-2 mb-4 mx-2 sm:mx-4">{note}</p>}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {tags.map((tag, i)=><Tag key={i} name={tag}/>)}
        </div>
      </div>
    </Link>
  )
}

function EmailLink(){
  return <a href="mailto:info@beeleelaw.com" className="underline underline-offset-3 decoration-1 decoration-brand-green/50 hover:decoration-brand-green" style={{color: myGreen}}>info@beeleelaw.com</a>
}

function Company({name, href}){
  return <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-3 decoration-1 decoration-brand-green/50 hover:decoration-brand-green" style={{color: myGreen}}>{name}<span className="sr-only"> (opens in new tab)</span></a>
}

function Tag({name}){
  return(
    <div className="text-meta text-zinc-300 rounded-sm px-1 py-0.25" style={{border: `1px solid ${myPurp}`}}>
      {name}
    </div>
  )
}