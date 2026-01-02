"use client"

import { useState, useEffect, useRef } from 'react'
import { useIsMobile } from "@/hooks/useIsMobile";

const enemyBP = {
    id: 1,
    x: 0,
    y: 0,
    type: 'tanky',
    health: 1,
    tier: 1
}
const bulletBP = {
    id: 1,
    x: 0,
    y: 0,
    damage: 1,
    hostile: false
}

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
    const isMobile = useIsMobile();
    const screenSizeRef = useRef({ width: 600, height: 700, radius: 20 });

    useEffect(() => {
    screenSizeRef.current = {
        width: isMobile ? 375 : 600,
        height: isMobile ? 667 : 700,
        radius: isMobile ? 5: 20
    };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 ">
        <main className="max-w-2xl w-full">
            <GameContainer screen={screenSizeRef} />
        </main>
        </div>
    );
}


function GameContainer(props){

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
        damage: 10,
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

    // Game state
    const [player, setPlayer] = useState({ x: 400, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 40 });
    const playerRef = useRef({ x: 400, y: 540, width: 40, height: 40, health: 100, speed: 6, atkSpeed: 0, damage: 40 })
    const [enemies, setEnemies] = useState([]);
    const enemiesRef = useRef([]);
    const [playerBullets, setPlayerBullets] = useState([]);
    const playerBulletsRef = useRef([]);
    const [enemyBullets, setEnemyBullets] = useState([]);
    const enemyBulletsRef = useRef([]);
    const [score, setScore] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing');
    const [wave, setWave] = useState(1);
    const waveRef = useRef(1);
    const [enemiesSpawnedThisWave, setEnemiesSpawnedThisWave] = useState(0);
    const keysPressed = useKeyPress();
    const keysPressedRef = useRef({});

    useEffect(() => {
        keysPressedRef.current = keysPressed;
        playerRef.current = player;
        waveRef.current = wave;
        enemiesRef.current = enemies;
        playerBulletsRef.current = playerBullets;
        enemyBulletsRef.current = enemyBullets;
    }, [keysPressed, player, wave, enemies, playerBullets, enemyBullets]);

    
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
        const screenWidth = props.screen.current.width;

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
        const leftkey = (keys['ArrowLeft'] || keys['a']);
        const rightkey = (keys['ArrowRight'] || keys['d']);
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
                newX = Math.min(props.screen.current.width-playerRef.current.width, newX+playerMove);
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
    const updatePlayerBullets = (addPlayerShot, currentTime, playerBulletDelete=[]) => {
        //console.log(currentTime);
        if(addPlayerShot){
            setPlayerBullets(prev =>
            prev
                .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
                .filter(bullet => bullet.y > 0 && playerBulletDelete.indexOf(bullet.id) == -1) // Remove bullets off screen
                .concat([{
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
            );
        }
    }

    const checkCollisions = () => {
        // Initialize arrays
        let enemyHealthUpdates = [];
        let playerHealthUpdates = [];
        let playerBulletDelete = [];
        let enemyBulletDelete = [];

        // Check player bullet collisions with enemies
        playerBulletsRef.current.forEach((bullet) => {
            enemiesRef.current.forEach((enemy) => {
                if(isColliding(bullet, enemy)){
                    enemyHealthUpdates.push({id: enemy.id, val: player.damage});
                    playerBulletDelete.push(bullet.id);
                }
            })
        });

        // Check enemy bullet collisions with player
        enemyBulletsRef.current.forEach((bullet) => {
            if(isColliding(bullet, playerRef.current)){
                playerHealthUpdates.push(bullet.damage);
                enemyBulletDelete.push(bullet.id);
            }
        });

        // Check enemy collisions with player
        enemies.forEach((enemy) => {
            if(isColliding(enemy, player)){
                playerHealthUpdates.push(enemy.damage);
                enemyHealthUpdates.push({id: enemy.id, val: 10000});
            }
        });

        return {
            enemyHealthUpdates: enemyHealthUpdates,
            enemyBulletDelete: enemyBulletDelete,
            playerHealthUpdates: playerHealthUpdates,
            playerBulletDelete: playerBulletDelete,
        }
    }

    const updateEnemies = (currentTime, enemyHealthUpdates) => {
        let newBullets = [];
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
                if(enemy.stopy){
                    let newPos = enemy.x + (enemy.direction*enemy.speed);
                    if (newPos < 0 || newPos > props.screen.current.width-enemy.width){ // When hitting wall, switch direction and drop, accellerate
                        enemy.direction *= -1;
                        enemy.speed = Math.min(enemy.speed*1.1, 10);
                        enemy.y += enemy.speed;
                    }
                    return { ...enemy, x: newPos, health: newHealth }
                }
                else{
                    return { ...enemy, y: enemy.y + enemy.speed, health: newHealth }
                }

            })
            .filter(enemy => enemy.y < 570 && enemy.health >= 0) // Remove enemies off screen or dead
        );
        return newBullets;
    }

    const updateEnemyBullets = (enemyBulletDelete, newBullets) => {
        setEnemyBullets(prev =>
        prev
            .map(bullet => ({ ...bullet, y: bullet.y + bullet.speed }))
            .filter(bullet => bullet.y < 600 && enemyBulletDelete.indexOf(bullet.id) == -1)
            .concat(newBullets)
        );
    }

    useEffect(() => {
        if (gameStatus !== 'playing') return;
        const gameLoop = (currentTime) => {
            const deltaTime = currentTime - lastFrameTime.current;
            lastFrameTime.current = currentTime;

            const keys = keysPressedRef.current;
            let playerMove = 0;
            let addPlayerShot;

            // 0. Check collisions for update values
            let {enemyHealthUpdates, enemyBulletDelete, playerHealthUpdates, playerBulletDelete} = checkCollisions();

            // 1. Handle player movement
            playerMove = handlePlayerMove(keys);
            
            // 2. Handle player shooting
            addPlayerShot = handlePlayerShot(currentTime);

            // 3. Update player bullets
            updatePlayerBullets(addPlayerShot, currentTime, playerBulletDelete)

            // 4. Update enemies
            let newBullets = updateEnemies(currentTime, enemyHealthUpdates);

            // 5. Update enemy bullets
            updateEnemyBullets(enemyBulletDelete, newBullets);

            // 6. Update player
            updatePlayer(playerMove, playerHealthUpdates);

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
        //console.log(enemies);
        return () => clearInterval(checkWaveComplete);
    }, [enemies.length, enemiesSpawnedThisWave, gameStatus]);

    // Enemy bullets vs player
    /*
    setEnemyBullets(prev => {
        const remainingBullets = prev.filter(bullet => {
        if (isColliding(bullet, player)) {
            setPlayer(p => ({ ...p, health: p.health - 10 }));
            return false;
        }
        return true;
        });
        return remainingBullets;
    });
    
    // Enemies vs player (collision damage)
    setEnemies(prev => {
        return prev.filter(enemy => {
        if (isColliding(
            { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.width },
            { x: player.x, y: player.y, width: 40, height: 40 }
        )) {
            setPlayer(p => ({ ...p, health: Math.max(0, p.health - 20) })); // More damage from collision
            return false; // Remove enemy
        }
        return true;
        });
    });
    */

    // Simple AABB collision detection
    const isColliding = (obj1, obj2) => {
    const margin = 0;
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

    const containerStyle = {
        position: 'relative',
        border: '1px solid black',
        width: props.screen.current.width,
        height: props.screen.current.height,
        background: '#1a1a1a',
        borderRadius: props.screen.current.radius
    }

    const handleKeyDown = (e) => {
        //if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault(); // Prevents page scrolling
        //}
        //setKeysPressed(prev => ({ ...prev, [e.key]: true }));
    };

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
                backgroundColor: '#ff0000', // Red enemy bullets
                borderRadius: '50%'
                }}
            />
            ))}

            <GameUI screen={props.screen} player={player} score={score} wave={wave} />
        </div>
    )
}

function GameUI(props){
    const uiStyle = {
        position: 'absolute',
        width: '100%',
        height: '110px',
        borderRadius: props.screen.current.radius,
        background: '#b96025ff',
        top: props.screen.current.height - 110,
        border: '4px solid #8d4c21ff'
    }
    return(
        <div className="flex items-center justify-center gap-6" style={uiStyle}>
            <div>Wave: {props.wave}</div>
            <div>Score: {props.score}</div>
            <div>Health: {props.player.health}</div>
        </div>
    )
}
