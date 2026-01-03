"use client"

import { useState, useEffect, useRef } from 'react'
import { useIsMobile } from "@/hooks/useIsMobile";

const PlayerShipSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <polygon points="20,5 35,35 5,35" fill="#A882DD" stroke="#45CB85" strokeWidth="2"/>
  </svg>
);

const TankyEnemySVG = () => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <rect x="10" y="10" width="30" height="30" fill="#00ff00" stroke="#ffffff" strokeWidth="2"/>
    <rect x="5" y="20" width="10" height="10" fill="#00ff00" stroke="#ffffff" strokeWidth="1"/>
    <rect x="35" y="20" width="10" height="10" fill="#00ff00" stroke="#ffffff" strokeWidth="1"/>
  </svg>
);

const FastEnemySVG = () => (
  <svg width="30" height="30" viewBox="0 0 30 30">
    <polygon points="15,5 25,15 15,25 5,15" fill="#ff0000" stroke="#ffffff" strokeWidth="2"/>
  </svg>
);

const ShootyEnemySVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <polygon points="20,10 30,20 25,30 15,30 10,20" fill="#0088ff" stroke="#ffffff" strokeWidth="2"/>
    <circle cx="20" cy="20" r="4" fill="#ffffff"/>
  </svg>
);

const VolleyIconSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <g fill="#A882DD" stroke="#9575CD" strokeWidth="1.5">
      <polygon points="24,8 26,18 22,18" />
      <polygon points="16,14 19,23 13,21" />
      <polygon points="32,14 35,21 29,23" />
      <polygon points="10,22 14,30 8,29" />
      <polygon points="38,22 40,29 34,30" />
    </g>
    <circle cx="24" cy="36" r="6" fill="#A882DD" stroke="#9575CD" strokeWidth="2"/>
  </svg>
);

const ShieldIconSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <path
      d="M24,6 L38,12 L38,24 C38,32 32,38 24,42 C16,38 10,32 10,24 L10,12 Z"
      fill="#4A90E2"
      stroke="#6BB6FF"
      strokeWidth="2"
    />
    <path
      d="M24,12 L32,16 L32,24 C32,28 28,32 24,36 C20,32 16,28 16,24 L16,16 Z"
      fill="#6BB6FF"
      opacity="0.5"
    />
  </svg>
);

const PulseIconSVG = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="18" fill="none" stroke="#45CB85" strokeWidth="2" opacity="0.3"/>
    <circle cx="24" cy="24" r="12" fill="none" stroke="#45CB85" strokeWidth="2.5" opacity="0.6"/>
    <circle cx="24" cy="24" r="6" fill="#45CB85" stroke="#6FD9A8" strokeWidth="2"/>
    <g stroke="#45CB85" strokeWidth="2" strokeLinecap="round">
      <line x1="24" y1="12" x2="24" y2="8" />
      <line x1="24" y1="40" x2="24" y2="36" />
      <line x1="12" y1="24" x2="8" y2="24" />
      <line x1="40" y1="24" x2="36" y2="24" />
    </g>
  </svg>
);

const LeftChevronSVG = () => (
  <svg width="40" height="100%" viewBox="0 0 40 120" preserveAspectRatio="none">
    <path
      d="M 30 20 L 10 60 L 30 100"
      fill="none"
      stroke="#fff5e4"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RightChevronSVG = () => (
  <svg width="40" height="100%" viewBox="0 0 40 120" preserveAspectRatio="none">
    <path
      d="M 10 20 L 30 60 L 10 100"
      fill="none"
      stroke="#fff5e4"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const useKeyPress = () => {
    const [keysPressed, setKeysPressed] = useState({});

    useEffect(() => {
    const handleKeyDown = (e) => {
        if(e.repeat){return;}
        setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e) => {
        setKeysPressed(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
    }, []);

    return keysPressed;
};




export default function Home() {


    return (
        <div className="min-h-screen flex items-center justify-center px-6 ">
        <main className="max-w-2xl w-full">
            <GameContainer /*screen={screenSizeRef}*/ />
        </main>
        </div>
    );
}


function GameContainer(props){
    const { isMobile, mounted } = useIsMobile();
    const screenSizeRef = useRef({ width: 600, height: 700, radius: 20, loaded: false });

    useEffect(() => {
        if (!mounted) return; // Wait until mounted to initialize

        screenSizeRef.current = {
            width: isMobile ? 375 : 600,
            height: isMobile ? 700 : 700,
            radius: isMobile ? 5: 20,
            loaded: true
        };
        initializeValues(isMobile);
    }, [isMobile, mounted]);

    const enemyTypes = {
    fast: {
        health: 20,
        speed: 3,
        width: 30,
        height: 30,
        score: 50,
        damage: 10,
    },
    tanky: {
        health: 100,
        speed: 1,
        width: 50,
        height: 50,
        score: 150,
        damage: 30,
    },
    shooty: {
        health: 50,
        speed: 1.5,
        width: 40,
        height: 40,
        score: 100,
        damage: 10,
        shootInterval: 2000 // Shoots every 2 seconds
    }
    };

    // Ability cooldowns (in milliseconds)
    const abilityCooldowns = {
        volley: 4000,   // 4 seconds
        shield: 12000,  // 12 seconds
        pulse: 10000    // 10 seconds
    };

    // Game state
    const [player, setPlayer] = useState({ x: 200, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 10 });
    const playerRef = useRef({ x: 200, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 10 })
    const [enemies, setEnemies] = useState([]);
    const enemiesRef = useRef([]);
    const [playerBullets, setPlayerBullets] = useState([]);
    const playerBulletsRef = useRef([]);
    const [enemyBullets, setEnemyBullets] = useState([]);
    const enemyBulletsRef = useRef([]);
    const [hitNotes, setHitNotes] = useState([]);
    const hitNotesRef = useRef([]);
    const [statusMessage, setStatusMessage] = useState({});
    const statusMessageRef = useRef({});
    const [pulseEffects, setPulseEffects] = useState([]);
    const pulseEffectsRef = useRef([]);
    const [shieldEffect, setShieldEffect] = useState(null);
    const shieldEffectRef = useRef(null);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [wave, setWave] = useState(1);
    const waveRef = useRef(1);
    const [enemiesSpawnedThisWave, setEnemiesSpawnedThisWave] = useState(0);
    const keysPressed = useKeyPress();
    const keysPressedRef = useRef({});
    const [pointer, setPointer] = useState({});
    const pointerRef = useRef({});

    const handlePointerAction = (e) => {
        e.preventDefault(); // Prevent default touch behavior
        const id = e.currentTarget.id;
        if(e.type === 'pointerdown'){
            setPointer(prev => ({...prev, [id]: true}));
        }
        else if(e.type === 'pointerup' || e.type === 'pointercancel'){
            setPointer(prev => ({...prev, [id]: false}));
        }
    }
    

    // Track last use time for each ability
    const abilityLastUsedRef = useRef({
        volley: -Infinity,  // -Infinity allows immediate first use
        shield: -Infinity,
        pulse: -Infinity
    });

    const initializeValues = (isMobile) => {
        console.log('initializing');
        if(isMobile){
            setPlayer({ x: 187, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 10 });
        }
        else{
            setPlayer({ x: 300, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 10 });
        }
        return;
    }

    useEffect(() => {
        keysPressedRef.current = keysPressed;
        pointerRef.current = pointer;
        playerRef.current = player;
        waveRef.current = wave;
        enemiesRef.current = enemies;
        playerBulletsRef.current = playerBullets;
        enemyBulletsRef.current = enemyBullets;
        hitNotesRef.current = hitNotes;
        statusMessageRef.current = statusMessage;
        pulseEffectsRef.current = pulseEffects;
        shieldEffectRef.current = shieldEffect;
        scoreRef.current = score;
    }, [keysPressed, pointer, player, wave, enemies, playerBullets, enemyBullets, hitNotes, statusMessage, pulseEffects, shieldEffect, score]);


    // TODO notes:
    //  -Feedback when damage taken by p or e
    //  -Flash/brief color change, red (-{dmg}) float+fade
    
    const lastShotTime = useRef(0);
    const lastFrameTime = useRef(performance.now());

    // Determine tier based on wave number
    const getTierForWave = (wave) => {
        if (wave <= 5) return 1;
        if (wave <= 10) return Math.random() < 0.7 ? 1 : 2; // 70% tier 1, 30% tier 2
        if (wave <= 15) return Math.random() < 0.5 ? 2 : 3; // 50/50 tier 2 and 3
        return Math.random() < 0.3 ? 2 : 3; // Mostly tier 3
    };

    const getEnemyStats = (type, tier) => {
        const base = enemyTypes[type];
        const multiplier = tier; // Tier 2 = 2x health, Tier 3 = 3x health

        return {
            ...base,
            health: base.health * multiplier,
            speed: base.speed * (1 + (tier - 1) * 0.2) // Slight speed increase per tier
        };
    };

    // Spawn a single enemy
    const spawnEnemy = (type, tier) => {
        const stats = getEnemyStats(type, tier);
        const screenWidth = screenSizeRef.current.width;

        const newEnemy = {
            id: Date.now() + Math.random(),
            type: type,
            tier: tier,
            x: Math.random() * (screenWidth - stats.width),
            y: -stats.width, // Spawn above screen
            health: stats.health,
            maxHealth: stats.health,
            speed: stats.speed,
            width: stats.width,
            height: stats.height,
            score: stats.score,
            damage: stats.damage,
            lastShotTime: 0, // For shooty enemies
            direction: null, // For shooty enemies, lateral movement direction
            stopy: false // For shooty enemies, when they stop
        };

        setEnemies(prev => [...prev, newEnemy]);
        setEnemiesSpawnedThisWave(prev => prev + 1);
    };

    // Determine enemy composition for wave
    const getWaveComposition = (waveNumber) => {
        const enemyCount = Math.min(3 + Math.floor(waveNumber / 2), 15); // Start with 3, max 15

        const composition = [];

        // Early waves: mostly fast enemies
        if (waveNumber <= 2) {
            for (let i = 0; i < enemyCount; i++) {
                composition.push({ type: 'fast', tier: getTierForWave(waveNumber) });
            }
        }
        // Mid waves: mix of all types
        else if (waveNumber <= 10) {
            const fastCount = Math.floor(enemyCount * 0.5);
            const shootyCount = Math.floor(enemyCount * 0.3);
            const tankyCount = enemyCount - fastCount - shootyCount;

            for (let i = 0; i < fastCount; i++) composition.push({ type: 'fast', tier: getTierForWave(waveNumber) });
            for (let i = 0; i < shootyCount; i++) composition.push({ type: 'shooty', tier: getTierForWave(waveNumber) });
            for (let i = 0; i < tankyCount; i++) composition.push({ type: 'tanky', tier: getTierForWave(waveNumber) });
        }
        // Late waves: more tankies and shooties
        else {
            const fastCount = Math.floor(enemyCount * 0.3);
            const shootyCount = Math.floor(enemyCount * 0.4);
            const tankyCount = enemyCount - fastCount - shootyCount;

            for (let i = 0; i < fastCount; i++) composition.push({ type: 'fast', tier: getTierForWave(waveNumber) });
            for (let i = 0; i < shootyCount; i++) composition.push({ type: 'shooty', tier: getTierForWave(waveNumber) });
            for (let i = 0; i < tankyCount; i++) composition.push({ type: 'tanky', tier: getTierForWave(waveNumber) });
        }

        // Shuffle array
        return composition.sort(() => Math.random() - 0.5);
    };

    const handlePlayerMove = (keys) => {
        const speed = playerRef.current.speed;
        let val;
        const leftkey = (keys['ArrowLeft'] || keys['a'] || pointerRef.current['moveLeft']);
        const rightkey = (keys['ArrowRight'] || keys['d'] || pointerRef.current['moveRight']);
        if(leftkey) val = -1*speed;
        if(rightkey) val = speed;
        if(val) return val
        return false;
    }
    const updatePlayer = (playerMove, playerHealthUpdates) => {
        setPlayer(prev => {
            let newX = prev.x;
            let damageTaken = 0;
            playerHealthUpdates.forEach((update)=>damageTaken += update);
            if(playerMove < 0){
                newX = Math.max(0, newX+playerMove);
            }
            else if(playerMove > 0){
                newX = Math.min(screenSizeRef.current.width-playerRef.current.width, newX+playerMove);
            }
            return {...prev, x:newX, health: prev.health-damageTaken}
        })
    }
    
    const handlePlayerShot = (currentTime) => {
        const atkSpeed = player.atkSpeed;
        if (currentTime - lastShotTime.current > 50 - atkSpeed) {
            lastShotTime.current = currentTime;
            return true;
        }
        return false;
    }
    const updatePlayerBullets = (addPlayerShot, currentTime, playerBulletDelete=[], volley) => {
        const volleyCount = 18;
        const spacing = Math.floor(screenSizeRef.current.width/volleyCount)-1;
        const midVolley = Math.floor(volleyCount/2);
        const verticalAdjust = 20;
        let volleyShots = [];
        if(volley){
            for(let i=0; i<volleyCount; i++){
                // Calculate distance from center for V formation
                const distanceFromCenter = i < midVolley ? midVolley - i : i - midVolley + 1;
                volleyShots.push({
                    id: currentTime + Math.random(),
                    x: 25 + (spacing*i),
                    y: playerRef.current.y + verticalAdjust + (distanceFromCenter * 30),
                    speed: 15,
                    width: 20,
                    height: 20
                })
            }
        }
        if(addPlayerShot){
            setPlayerBullets(prev =>
            prev
                .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
                .filter(bullet => bullet.y > 0 && playerBulletDelete.indexOf(bullet.id) == -1) // Remove bullets off screen
                .concat([...volleyShots, {
                    id: currentTime,
                    x: playerRef.current.x + 17, // Center of ship
                    y: player.y - 5,
                    speed: 10,
                    width:  20,
                    height: 20
                }])
            );
        }
        else{
            setPlayerBullets(prev =>
            prev
                .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
                .filter(bullet => bullet.y > 0 && playerBulletDelete.indexOf(bullet.id) == -1)
                .concat(volleyShots)
            );
        }
    }

    const checkCollisions = (currentTime) => {
        // Initialize arrays
        let enemyHealthUpdates = [];
        let playerHealthUpdates = [];
        let playerBulletDelete = [];
        let enemyBulletDelete = [];
        let hitNotesToAdd = [];

        // Position variance calc
        const posVary = (coord) => {
            const margin = 2;
            let vary = ((Math.random()*2) - 0.5)*margin;
            return coord+vary;
        }

        // Check player bullet collisions with enemies
        playerBulletsRef.current.forEach((bullet) => {
            enemiesRef.current.forEach((enemy) => {
                if(isColliding(bullet, enemy)){
                    enemyHealthUpdates.push({id: enemy.id, val: player.damage});
                    playerBulletDelete.push(bullet.id);
                    hitNotesToAdd.push({
                        id: currentTime + Math.random(),
                        x: posVary(bullet.x),
                        y: bullet.y - 5,
                        yStart: bullet.y - 5,
                        val: player.damage,
                        opacity: 1,
                        bold: false
                    })
                }
            })
        });

        // Check enemy bullet collisions with player
        enemyBulletsRef.current.forEach((bullet) => {
            if(isColliding(bullet, playerRef.current)){
                playerHealthUpdates.push(bullet.damage);
                enemyBulletDelete.push(bullet.id);
                hitNotesToAdd.push({
                    id: currentTime + Math.random(),
                    x: posVary(bullet.x),
                    y: bullet.y + 5,
                    yStart: bullet.y + 5,
                    val: bullet.damage,
                    opacity: 1,
                    bold: true
                })
            }
        });

        // Check enemy collisions with player
        enemiesRef.current.forEach((enemy) => {
            if(isColliding(enemy, playerRef.current)){
                playerHealthUpdates.push(enemy.damage);
                enemyHealthUpdates.push({id: enemy.id, val: 10000});
                hitNotesToAdd.push({
                    id: currentTime + Math.random(),
                    x: posVary(enemy.x),
                    y: enemy.y + 5,
                    yStart: enemy.y + 5,
                    val: enemy.damage,
                    opacity: 1,
                    bold: true
                })
            }
        });

        return {
            enemyHealthUpdates: enemyHealthUpdates,
            enemyBulletDelete: enemyBulletDelete,
            playerHealthUpdates: playerHealthUpdates,
            playerBulletDelete: playerBulletDelete,
            hitNotesToAdd: hitNotesToAdd
        }
    }

    const updateEnemies = (currentTime, enemyHealthUpdates, enemyPushUpdates = []) => {
        let newBullets = [];
        let scoreToAdd = 0;
        
        // Check which enemies are dead, update scoreToAdd
        enemiesRef.current.forEach((enemy)=>{
            let healthMatches = enemyHealthUpdates.filter(update => update.id === enemy.id);
            let damageSum = healthMatches.reduce((acc, val)=> acc + val.val, 0);
            if(damageSum >= enemy.health)scoreToAdd += enemy.score;
        })

        setEnemies(prev =>
        prev
            .map((enemy) => {
                if(enemy.type == 'shooty'){
                    if(enemy.y > 300){
                        // Should enemy stop? chance gets higher as it approaches threshold
                        if(Math.random() >  enemy.y/1000) enemy.stopy = true;
                        if(!enemy.direction)enemy.direction = Math.random() < 0.5 ? 1 : -1
                    }
                    // Shoot Logic
                    const shootInterval = 2000; // 2 seconds between shots
                    const timeSinceLastShot = currentTime - (enemy.lastShotTime || 0);
                    if (timeSinceLastShot > shootInterval) {
                        newBullets.push(shootEnemyBullet(enemy));
                        enemy.lastShotTime = currentTime;
                    }
                }
                // Actual updates
                let newHealth = enemy.health;
                let healthMatches = enemyHealthUpdates.filter(update => update.id === enemy.id);
                healthMatches.forEach((match)=> newHealth -= match.val );

                // Apply pulse push
                let pushX = 0;
                let pushY = 0;
                let pushMatch = enemyPushUpdates.find(update => update.id === enemy.id);
                if (pushMatch) {
                    pushX = pushMatch.pushX;
                    pushY = pushMatch.pushY;
                }

                if(enemy.stopy){
                    let newPos = enemy.x + (enemy.direction*enemy.speed) + pushX;
                    if (newPos < 0 || newPos > screenSizeRef.current.width-enemy.width){ // When hitting wall, switch direction and drop, accellerate
                        enemy.direction *= -1;
                        enemy.speed = Math.min(enemy.speed*1.1, 10);
                        enemy.y += enemy.speed;
                    }
                    return { ...enemy, x: newPos, y: enemy.y + pushY, health: newHealth }
                }
                else{
                    return { ...enemy, x: enemy.x + pushX, y: enemy.y + enemy.speed + pushY, health: newHealth }
                }

            })
            .filter(enemy => enemy.health > 0 && enemy.y < 570 && enemy.x + enemy.width > 0 && enemy.x + (enemy.width/2) < screenSizeRef.current.width)
        )

        //console.log('scoreToAdd at return:', scoreToAdd);
        return {newBullets: newBullets, scoreToAdd: scoreToAdd};
    }

    const updateEnemyBullets = (enemyBulletDelete, newBullets) => {
        setEnemyBullets(prev =>
        prev
            .map(bullet => ({ ...bullet, y: bullet.y + bullet.speed }))
            .filter(bullet => bullet.y < 600 && enemyBulletDelete.indexOf(bullet.id) == -1)
            .concat(newBullets)
        );
    }

    const updateHitNotes = (hitNotesToAdd) => {
        // Move all hitNotes
        // Remove old hitnotes
        // Add new hitnotes
        const speed = 2;
        const lifeSpan = 40;
        const getOpacity = (yStart, y) => {
            return (1-(yStart-y)/lifeSpan);
        }

        setHitNotes(prev => {
            const result = prev
                .map(hitNote => ({...hitNote, y: hitNote.y-speed, opacity: getOpacity(hitNote.yStart, hitNote.y)}))
                .filter(hitNote=> hitNote.yStart-hitNote.y < lifeSpan)
                .concat(hitNotesToAdd);
            return result;
        });     
    }

    const handlePlayerKeys = (keys) => {
        if(keys['1'] || pointerRef.current['volley'])return 1;
        if(keys['2'] || pointerRef.current['shield'])return 2;
        if(keys['3'] || pointerRef.current['pulse'])return 3;

        return false;
    }

    const handlePlayerAbilities = (currentTime, playerKeys) => {
        let pulsesToAdd = null;
        let shieldToAdd = null;
        let volley = false;

        // Check Pulse (key 3)
        if (playerKeys === 3) {
            const timeSinceLastPulse = currentTime - abilityLastUsedRef.current.pulse;
            if (timeSinceLastPulse >= abilityCooldowns.pulse) {
                pulsesToAdd = triggerPulse(currentTime);
                abilityLastUsedRef.current.pulse = currentTime;
            }
        }

        // Check Shield (key 2)
        if (playerKeys === 2) {
            const timeSinceLastShield = currentTime - abilityLastUsedRef.current.shield;
            if (timeSinceLastShield >= abilityCooldowns.shield) {
                shieldToAdd = triggerShield(currentTime);
                abilityLastUsedRef.current.shield = currentTime;
            }
        }

        // Check Volley (key 1)
        if (playerKeys === 1) {
            const timeSinceLastVolley = currentTime - abilityLastUsedRef.current.volley;
            if (timeSinceLastVolley >= abilityCooldowns.volley) {
                volley = true;
                abilityLastUsedRef.current.volley = currentTime;
            }
        }

        return {pulsesToAdd, shieldToAdd, volley};
    }

    const updateStatusMessage = (currentTime, pulsesToAdd, shieldToAdd, volley) => {
        // Add status message to text
        // Fade
        // Delete old message
        let newMessage;
        const lifeSpan = 1000;
        const getOpacity = (start, end) => {
            //console.log((1-(end-start)/lifeSpan));
            return (1-(end-start)/lifeSpan);
        }
        //console.log(currentTime);
        if(volley){
            newMessage = {id: currentTime + Math.random(), message: '!! -- VOLLEY -- !!', start: currentTime, opacity: 1}
        }
        if(shieldToAdd){
            newMessage = {id: currentTime + Math.random(), message: '!! -- SHIELD -- !!', start: currentTime, opacity: 1}
        }
        if(pulsesToAdd){
            newMessage = {id: currentTime + Math.random(), message: '!! -- PULSE -- !!', start: currentTime, opacity: 1}
        }
        if(newMessage)setStatusMessage(newMessage);
        else if(statusMessageRef.current && statusMessageRef.current.start && statusMessageRef.current.start + lifeSpan < currentTime)setStatusMessage({message: '', opacity: 0});
        else setStatusMessage({...statusMessageRef.current, opacity: getOpacity(statusMessageRef.current.start, currentTime) })
    }

    const triggerPulse = (currentTime) => {
        return {
            id: currentTime + Math.random(),
            x: playerRef.current.x + playerRef.current.width / 2,
            y: playerRef.current.y + playerRef.current.height / 2,
            radius: 0,
            maxRadius: 200,
            opacity: 1
        };
    }

    const triggerShield = (currentTime) => {
        return {
            id: currentTime + Math.random(),
            startTime: currentTime,
            duration: 3000, // 3 seconds
            radius: 60,
            opacity: 0.8
        };
    }

    const updateShieldEffect = (shieldToAdd) => {
        const currentTime = performance.now();

        if (shieldToAdd) {
            setShieldEffect(shieldToAdd);
        } else if (shieldEffectRef.current) {
            const elapsed = currentTime - shieldEffectRef.current.startTime;
            const timeRemaining = shieldEffectRef.current.duration - elapsed;

            if (timeRemaining <= 0) {
                setShieldEffect(null);
            } else {
                // Fade out in the last 500ms
                const fadeStartTime = shieldEffectRef.current.duration - 500;
                let opacity = 0.8;
                if (elapsed > fadeStartTime) {
                    opacity = 0.8 * (timeRemaining / 500);
                }
                setShieldEffect({
                    ...shieldEffectRef.current,
                    opacity: opacity
                });
            }
        }
    }

    const checkShieldEffects = () => {
        if (!shieldEffectRef.current) {
            return { enemyBulletDeleteFromShield: [], playerDamageBlocked: false };
        }

        const shield = shieldEffectRef.current;
        const playerCenterX = playerRef.current.x + playerRef.current.width / 2;
        const playerCenterY = playerRef.current.y + playerRef.current.height / 2;

        // Check if object is within shield radius
        const isInShield = (obj) => {
            const objCenterX = obj.x + (obj.width || 0) / 2;
            const objCenterY = obj.y + (obj.height || 0) / 2;
            const distance = Math.sqrt(
                Math.pow(objCenterX - playerCenterX, 2) +
                Math.pow(objCenterY - playerCenterY, 2)
            );
            return distance <= shield.radius;
        };

        let enemyBulletDeleteFromShield = [];
        let playerDamageBlocked = false;

        // Check enemy bullets hitting shield
        enemyBulletsRef.current.forEach(bullet => {
            if (isInShield(bullet)) {
                enemyBulletDeleteFromShield.push(bullet.id);
            }
        });

        // Check if any enemy is touching the shield (block collision damage)
        enemiesRef.current.forEach(enemy => {
            if (isInShield(enemy)) {
                playerDamageBlocked = true;
            }
        });

        return { enemyBulletDeleteFromShield, playerDamageBlocked };
    }

    const checkPulseEffects = () => {
        if (pulseEffectsRef.current.length === 0) {
            return { enemyBulletDeleteFromPulse: [], enemyPushUpdates: [] };
        }

        // Check if object is within pulse radius
        const isInPulse = (obj, pulse) => {
            const objCenterX = obj.x + (obj.width || 0) / 2;
            const objCenterY = obj.y + (obj.height || 0) / 2;
            const distance = Math.sqrt(
                Math.pow(objCenterX - pulse.x, 2) +
                Math.pow(objCenterY - pulse.y, 2)
            );
            return distance <= pulse.radius;
        };

        let enemyBulletDeleteFromPulse = [];
        let enemyPushUpdates = [];

        // Find enemy bullets to delete
        enemyBulletsRef.current.forEach(bullet => {
            pulseEffectsRef.current.forEach(pulse => {
                if (isInPulse(bullet, pulse)) {
                    enemyBulletDeleteFromPulse.push(bullet.id);
                }
            });
        });

        // Calculate enemy push updates
        enemiesRef.current.forEach(enemy => {
            let totalPushX = 0;
            let totalPushY = 0;

            pulseEffectsRef.current.forEach(pulse => {
                if (isInPulse(enemy, pulse)) {
                    const enemyCenterX = enemy.x + enemy.width / 2;
                    const enemyCenterY = enemy.y + enemy.height / 2;
                    const angle = Math.atan2(enemyCenterY - pulse.y, enemyCenterX - pulse.x);

                    const pushForce = 15;
                    totalPushX += Math.cos(angle) * pushForce;
                    totalPushY += Math.sin(angle) * pushForce;
                }
            });

            if (totalPushX !== 0 || totalPushY !== 0) {
                enemyPushUpdates.push({
                    id: enemy.id,
                    pushX: totalPushX,
                    pushY: totalPushY
                });
            }
        });

        return { enemyBulletDeleteFromPulse, enemyPushUpdates };
    }

    const updatePulseEffects = (pulsesToAdd) => {
        const expandSpeed = 8;
        const fadeSpeed = 0.05;
        if(pulsesToAdd){
            setPulseEffects(prev =>
                prev
                    .map(pulse => ({
                        ...pulse,
                        radius: pulse.radius + expandSpeed,
                        opacity: pulse.opacity - fadeSpeed
                    }))
                    .filter(pulse => pulse.radius < pulse.maxRadius && pulse.opacity > 0)
                    .concat([pulsesToAdd])
            );
        }
        else{
            setPulseEffects(prev =>
                prev
                    .map(pulse => ({
                        ...pulse,
                        radius: pulse.radius + expandSpeed,
                        opacity: pulse.opacity - fadeSpeed
                    }))
                    .filter(pulse => pulse.radius < pulse.maxRadius && pulse.opacity > 0)
            );
        }
    }

    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - lastFrameTime.current;
            lastFrameTime.current = currentTime;

            const keys = keysPressedRef.current;
            let playerMove = 0;
            let addPlayerShot;
            let playerKeys;

            // Check collisions for update values
            let {enemyHealthUpdates, enemyBulletDelete, playerHealthUpdates, playerBulletDelete, hitNotesToAdd} = checkCollisions(currentTime);

            // Check pulse effects
            let {enemyBulletDeleteFromPulse, enemyPushUpdates} = checkPulseEffects();

            // Check shield effects
            let {enemyBulletDeleteFromShield, playerDamageBlocked} = checkShieldEffects();

            // Block player damage if shield is active
            let filteredPlayerHealthUpdates = playerDamageBlocked ? [] : playerHealthUpdates;

            // Check player movement
            playerMove = handlePlayerMove(keys);

            // Check player keys
            playerKeys = handlePlayerKeys(keys);

            // Check player shooting
            addPlayerShot = handlePlayerShot(currentTime);

            // Check player abilities
            let {pulsesToAdd, shieldToAdd, volley} = handlePlayerAbilities(currentTime, playerKeys);

            // Update player bullets
            updatePlayerBullets(addPlayerShot, currentTime, playerBulletDelete, volley)

            // Update enemies
            let {newBullets, scoreToAdd} = updateEnemies(currentTime, enemyHealthUpdates, enemyPushUpdates);

            // Update enemy bullets (merge all deletes from pulse, shield, and collisions)
            let allEnemyBulletDeletes = [...enemyBulletDelete, ...enemyBulletDeleteFromPulse, ...enemyBulletDeleteFromShield];
            updateEnemyBullets(allEnemyBulletDeletes, newBullets);

            // Update hit notes
            updateHitNotes(hitNotesToAdd);

            // Update player
            updatePlayer(playerMove, filteredPlayerHealthUpdates);

            // Update status message
            updateStatusMessage(currentTime, pulsesToAdd, shieldToAdd, volley);

            // Update pulse effects
            updatePulseEffects(pulsesToAdd);

            // Update shield effect
            updateShieldEffect(shieldToAdd);

            // Update score
            if (scoreToAdd > 0) {
                setScore(prev => prev + scoreToAdd);
            }

            // Continue loop
            requestAnimationFrame(gameLoop);
        };

        const animationId = requestAnimationFrame(gameLoop);

        // Cleanup
        return () => cancelAnimationFrame(animationId);
    }, [gameStatus]);

    // Enemy spawning loop
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const waveComposition = getWaveComposition(wave);
        const spawnDelay = Math.max(500, 2000 - wave * 50); // Faster spawning as waves progress

        let spawnIndex = 0;

        const spawnInterval = setInterval(() => {
            if (spawnIndex < waveComposition.length) {
                const { type, tier } = waveComposition[spawnIndex];
                spawnEnemy(type, tier);
                spawnIndex++;
            } else {
                clearInterval(spawnInterval);
            }
        }, spawnDelay);

        return () => clearInterval(spawnInterval);
    }, [wave, gameStatus]);

    // Check if wave is complete and advance to next wave
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const checkWaveComplete = setInterval(() => {
            // Wave complete when all enemies spawned and all enemies defeated
            const waveComposition = getWaveComposition(waveRef.current);

            if (enemiesSpawnedThisWave >= waveComposition.length && enemies.length === 0) {
                setWave(prev => prev + 1);
                setEnemiesSpawnedThisWave(0);
            }
        }, 100);
        return () => clearInterval(checkWaveComplete);
    }, [enemies.length, enemiesSpawnedThisWave, gameStatus]);


    // Simple AABB collision detection
    const isColliding = (obj1, obj2, margin=0) => {
    return (
        obj1.x <= obj2.x + obj2.width + margin &&
        obj1.x + obj1.width + margin >= obj2.x &&
        obj1.y <= obj2.y + obj2.height + margin &&
        obj1.y + obj1.height + margin >= obj2.y
    );
    };

    const shootEnemyBullet = (enemy) => {
        const bulletSpeed = 5;
        const bulletWidth = 8;

        return {
            id: Date.now() + Math.random(),
            x: enemy.x + (enemy.width / 2) - (bulletWidth / 2), // Center of enemy
            y: enemy.y + enemy.width, // Bottom of enemy
            speed: bulletSpeed,
            width: bulletWidth,
            height: bulletWidth,
            damage: enemy.damage
        }
    };

    const handleKeyDown = (e) => {
        //if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault(); // Prevents page scrolling
        //}
        //setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

    const calculateAbilityCooldowns = (currentTime) => {
        const calculatePercent = (abilityName) => {
            const timeSinceLastUse = currentTime - abilityLastUsedRef.current[abilityName];
            const cooldownDuration = abilityCooldowns[abilityName];

            if (timeSinceLastUse >= cooldownDuration) {
                return 0; // Ready
            }

            // Calculate percentage remaining (100 = just used, 0 = ready)
            const percentComplete = (timeSinceLastUse / cooldownDuration) * 100;
            return 100 - percentComplete;
        };

        return {
            volley: calculatePercent('volley'),
            shield: calculatePercent('shield'),
            pulse: calculatePercent('pulse')
        };
    };

    // Don't render game until screen size is determined
    if (!mounted) {
        return (
            <div style={{
                width: '600px',
                height: '700px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a1a',
                color: '#fff5e4',
                borderRadius: '20px'
            }}>
                Loading...
            </div>
        );
    }

        const containerStyle = {
        position: 'relative',
        border: '1px solid black',
        width: screenSizeRef.current.width,
        height: screenSizeRef.current.height,
        background: '#1a1a1a',
        borderRadius: screenSizeRef.current.radius,
        overflow: 'hidden',
        userSelect: 'none',
    }

    return(
        <div className="flex-none" style={containerStyle} onKeyDown={handleKeyDown}>
            {/* Player */}
            <div style={{ position: 'absolute', left: player.x, top: player.y }}>
                <PlayerShipSVG />
            </div>

            {/* Player Bullets */}
            {playerBullets.map(bullet => (
            <div key={bullet.id} style={{ position: 'absolute', left: bullet.x, top: bullet.y }}>
                •
            </div>
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
            <div key={enemy.id} style={{ position: 'absolute', left: enemy.x, top: enemy.y }}>
                {
                    enemy.type == 'fast' ?
                        <FastEnemySVG tier={enemy.tier} />
                    : enemy.type == 'shooty' ?
                        <ShootyEnemySVG tier={enemy.tier} />
                    : <TankyEnemySVG tier={enemy.tier} />
                }

            </div>
            ))}

            {/* Enemy Bullets */}
            {enemyBullets.map(bullet => (
            <div
                key={bullet.id}
                style={{
                position: 'absolute',
                left: bullet.x,
                top: bullet.y,
                width: bullet.width,
                height: bullet.height,
                backgroundColor: '#ffee00ff',
                borderRadius: '50%'
                }}
            />
            ))}

            {/* Hit Notes */}
            {hitNotes.map(hitNote => {
            return(
            <div
                key={hitNote.id}
                style={{
                    position: 'absolute',
                    left: hitNote.x,
                    top: hitNote.y,
                    color: 'red',
                    opacity: hitNote.opacity,
                    fontWeight: hitNote.bold ? 'bold' : 'initial',
                    fontSize: hitNote.bold ? '1.2em' : '0.8em'
                }}
            >
                {hitNote.val}
            </div>
            )})}

            {/* Pulse Effects */}
            {pulseEffects.map(pulse => (
                <div
                    key={pulse.id}
                    style={{
                        position: 'absolute',
                        left: pulse.x - pulse.radius,
                        top: pulse.y - pulse.radius,
                        width: pulse.radius * 2,
                        height: pulse.radius * 2,
                        borderRadius: '50%',
                        border: '4px solid #45CB85',
                        opacity: pulse.opacity,
                        pointerEvents: 'none',
                        boxShadow: `0 0 20px rgba(69, 203, 133, ${pulse.opacity * 0.8})`
                    }}
                />
            ))}

            {/* Shield Effect */}
            {shieldEffect && (
                <div
                    style={{
                        position: 'absolute',
                        left: player.x + player.width / 2 - shieldEffect.radius,
                        top: player.y + player.height / 2 - shieldEffect.radius,
                        width: shieldEffect.radius * 2,
                        height: shieldEffect.radius * 2,
                        borderRadius: '50%',
                        border: '4px solid #4A90E2',
                        background: 'radial-gradient(circle, rgba(74, 144, 226, 0.3) 0%, rgba(74, 144, 226, 0.1) 70%, transparent 100%)',
                        opacity: shieldEffect.opacity,
                        pointerEvents: 'none',
                        boxShadow: `0 0 30px rgba(74, 144, 226, ${shieldEffect.opacity * 0.8}), inset 0 0 20px rgba(74, 144, 226, 0.3)`
                    }}
                />
            )}

            {/* Status Message */}
            { statusMessage && statusMessage.message ?
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                    opacity: statusMessage.opacity,
                    fontSize: '2em',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}
            >
                {statusMessage.message}
            </div>
            : <></>
            }

            <GameUI
                screenSizeRef={screenSizeRef}
                player={player}
                score={score}
                wave={wave}
                handlePointerAction={handlePointerAction}
                abilities={(() => {
                    const cooldowns = calculateAbilityCooldowns(performance.now());
                    return {
                        volley: {
                            cooldownPercent: cooldowns.volley,
                            isLocked: false,
                            isActive: false
                        },
                        shield: {
                            cooldownPercent: cooldowns.shield,
                            isLocked: false,
                            isActive: shieldEffect !== null
                        },
                        pulse: {
                            cooldownPercent: cooldowns.pulse,
                            isLocked: false,
                            isActive: pulseEffects.length > 0
                        }
                    };
                })()}
            />
        </div>
    )
}

function AbilityIcon({ Icon, hotkey, cooldownPercent = 0, isLocked = false, isActive = false, color, id, handlePointerAction }) {
    const size = 52;
    const iconStyle = {
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        background: 'rgba(0, 0, 0, 0.3)',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive ? `0 0 20px ${color}` : 'none',
        transition: 'box-shadow 0.2s',
    };

    const hotkeyStyle = {
        position: 'absolute',
        top: '4px',
        right: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
        pointerEvents: 'none'
    };

    const lockOverlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        pointerEvents: 'none'
    };

    // Circular progress overlay
    const radius = (size - 8) / 2; // Account for border and stroke
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (cooldownPercent / 100);

    return (
        <div id={id} style={iconStyle} onPointerDown={handlePointerAction} onPointerUp={handlePointerAction} onPointerCancel={handlePointerAction}>
            <Icon />
            <div style={hotkeyStyle}>{hotkey}</div>

            {/* Circular cooldown progress */}
            {cooldownPercent > 0 && (
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        transform: 'rotate(-90deg)'
                    }}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
            )}

            {/* Lock overlay */}
            {isLocked && (
                <div style={lockOverlayStyle}>
                    🔒
                </div>
            )}
        </div>
    );
}

function GameUI(props){
    const uiStyle = {
        position: 'absolute',
        width: '100%',
        height: '120px',
        borderRadius: props.screenSizeRef.current.radius,
        background: '#b96025ff',
        top: props.screenSizeRef.current.height - 120,
        border: '4px solid #8d4c21ff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0',
        overflow: 'hidden'
    }

    const centerContentStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flex: 1
    }

    const statsRowStyle = {
        display: 'flex',
        gap: '24px',
        fontSize: '14px'
    }

    const abilitiesRowStyle = {
        display: 'flex',
        gap: '12px'
    }

    const chevronStyle = {
        height: '100%',
        width: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        userSelect: 'none'
    }

    return(
        <div style={uiStyle}>
            {/* Left Chevron */}
            <div
                id="moveLeft"
                style={chevronStyle}
                onPointerDown={props.handlePointerAction}
                onPointerUp={props.handlePointerAction}
                onPointerCancel={props.handlePointerAction}
            >
                <LeftChevronSVG />
            </div>

            {/* Center Content */}
            <div style={centerContentStyle}>
                {/* Stats Row */}
                <div style={statsRowStyle}>
                    <div>Wave: {props.wave}</div>
                    <div>Score: {props.score}</div>
                    <div>Health: {props.player.health}</div>
                </div>

                {/* Abilities Row */}
                <div style={abilitiesRowStyle}>
                    <AbilityIcon
                        Icon={VolleyIconSVG}
                        hotkey={1}
                        cooldownPercent={props.abilities?.volley?.cooldownPercent || 0}
                        isLocked={props.abilities?.volley?.isLocked || false}
                        isActive={props.abilities?.volley?.isActive || false}
                        color="#A882DD"
                        id={"volley"}
                        handlePointerAction={props.handlePointerAction}
                    />
                    <AbilityIcon
                        Icon={ShieldIconSVG}
                        hotkey={2}
                        cooldownPercent={props.abilities?.shield?.cooldownPercent || 0}
                        isLocked={props.abilities?.shield?.isLocked || false}
                        isActive={props.abilities?.shield?.isActive || false}
                        color="#4A90E2"
                        id={"shield"}
                        handlePointerAction={props.handlePointerAction}
                    />
                    <AbilityIcon
                        Icon={PulseIconSVG}
                        hotkey={3}
                        cooldownPercent={props.abilities?.pulse?.cooldownPercent || 0}
                        isLocked={props.abilities?.pulse?.isLocked || false}
                        isActive={props.abilities?.pulse?.isActive || false}
                        color="#45CB85"
                        id={"pulse"}
                        handlePointerAction={props.handlePointerAction}
                    />
                </div>
            </div>

            {/* Right Chevron */}
            <div
                id="moveRight"
                style={chevronStyle}
                onPointerDown={props.handlePointerAction}
                onPointerUp={props.handlePointerAction}
                onPointerCancel={props.handlePointerAction}
            >
                <RightChevronSVG />
            </div>
        </div>
    )
}
