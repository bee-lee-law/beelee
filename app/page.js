"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import delta_flyer_img from "@/public/delta_flyer_img.png";
import route_safety_img from "@/public/route_safety_img.png";
import githubMark from '@/public/github-mark.svg';
import linkedInMark from '@/public/InBug-White.png';
import instaMark from '@/public/Instagram_Glyph_White.svg';
import logoCube from '@/public/BeeCube.svg'
import Link from "next/link";



/* Get rid of usestate/useeffect and use client when deploying, if possible */

  const myGreen = "#45CB85";
  const myPurp = "#A882DD";

  const deltaFlyerDesc = `
    I don't have the same eye as my peers when it comes to front-end visual design, but that doesn't mean I can't develop
    front-end applications! Here's a little rogue-like shooter, developed in React, just for fun
  `

  const routeSafetyDesc = `
    Analyzing and visualizing geographic data in a realm close to my home and my heart- bike safety in Grand Rapids.
    Get route safety ratings based on city infrastructure and traffic collision data
  `

export default function Home() {
  const [debug, setDebug] = useState(false);
  const iconStyle = {width: 25, height: 25}

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd') {
        setDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex-column items-center justify-center px-6 w-5/6 m-auto" style={{border: debug ? '1px solid red' : 'none'}}>
      <header className="max-w-2xl w-full flex-column items-center justify-between mt-4 ml-auto mr-auto" style={{border: debug ? '1px solid white' : 'none'}} >
        <div className="flex items-center mb-2 ml-2">
          <Logo /><div className="ml-4" style={{fontSize: '48px'}}>bee lee</div> 
        </div>
      </header>
      <div className="flex items-center justify-center px-8 py-6" style={{border: debug ? '1px solid blue' : 'none'}}>
      <main className="max-w-2xl w-full" style={{border: debug ? '1px solid white' : 'none'}}>
        <section className="mb-12">
          <div className="flex items-center">
            <hr className="flex-1" style={{color: myPurp}} />
            <h1 className="text-base mb-1 ml-4 mr-4" style={{color: myPurp}}><span className="font-bold">B</span>randon <span className="font-bold">Lee</span> <span className="font-bold">Law</span>rence</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div> 
{/*           <div className="flex items-center">

            <h1 className="text-base mb-1 ml-auto mr-auto" style={{color: myPurp}}><span className="font-bold">B</span>randon <span className="font-bold">Lee</span> <span className="font-bold">Law</span>rence</h1>

          </div> */}
          <p className="text-sm">
            Business analyst and back-end developer specializing in data solutions.
          </p>
        </section>

        <section className="mb-12">
          <div className="flex items-center mb-2">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>Projects&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <div className="flex flex-col items-center justify-around gap-8">
            <Project img={delta_flyer_img} name={"Delta Flyer"} desc={deltaFlyerDesc} link={"game"} tags={["React", "javascript", "game"]} />
            <Project img={route_safety_img} name={"Bike Route Safety"} desc={routeSafetyDesc} link={"maps"} tags={["data", "API", "geography", "GIS"]} />
          </div>
        </section>

        <section className="mb-4">
          <div className="flex items-center">
            <h1 className="text-lg mb-1 font-bold" style={{color: myPurp}}>Contact&nbsp;</h1>
            <hr className="flex-1" style={{color: myPurp}} />
          </div>
          <p className="text-sm">
            Contact me at <a href="mailto:info@beeleelaw.com" style={{color: myGreen}}>info@beeleelaw.com</a> for freelance or hiring inquiries. Resume available on request
          </p>
        </section>

      </main>
      </div>
      <footer className="w-full h-14 flex items-center justify-between" style={{border: debug ? '1px solid white' : 'none'}} >
        <hr className="flex-1" style={{color: myPurp}} />
        <div className="flex gap-2 ml-4 mr-2">
          <a href="https://github.com/bee-lee-law/" target="_blank"><Image src={githubMark} alt={'test'} style={iconStyle} /></a>
          <a href="https://www.linkedin.com/in/beelaw/" target="_blank"><Image src={linkedInMark} alt={'test'} style={iconStyle} /></a>
          <a href="https://www.instagram.com/les_reves_dun_bee" target="_blank"><Image src={instaMark} alt={'test'} style={iconStyle} /></a>
        </div>
        <hr className="flex-1" style={{color: myPurp}} />
      </footer>
    </div>
  );
}

function Logo(){
  return <Image src={logoCube} alt={'logo'} style={{width: '64px', height: 'auto'}} />
}

function Project({img, name, desc, link, tags}){
  return(
    <Link href={link} target="_blank">
      <div className="bg-zinc-600 px-2 py-2 rounded w-5/6 mr-auto ml-auto">
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

function Tag({name}){
  return(
    <div className="text-xs rounded-sm px-0.75 py-0.25" style={{color: '#fffef0', background: myPurp}}>
      {name}
    </div>
  )
}

/*
	project component background
	stack projects
	vertical flow to project boxes
	color of tags (contrast)
	center align logos
	try centering section logos
	adjust margins based on screen size
	Bigger, Bold Headers
	

	Play with vertical margins
	better horz margins
	consistency

*/