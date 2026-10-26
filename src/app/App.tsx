import { useState } from 'react';
import { LanternwakeBoard } from '../features/constellation/components/LanternwakeBoard';
import { useLanternwakeGame } from '../features/constellation/model/useLanternwakeGame';

export function App() {
  const game = useLanternwakeGame();
  const [showRules, setShowRules] = useState(false);
  return <main className="app-shell">
    <header className="masthead"><div className="sigil">✦</div><div><span className="kicker">THE TIDE REMEMBERS</span><h1>LANTERN<span>WAKE</span></h1></div><button className="help" onClick={() => setShowRules(true)}>HOW TO PLAY</button></header>
    <section className="intro"><div><span className="kicker">COOPERATIVE SIGNAL GAME · ROOM {game.roomCode}</span><h2>Keep the coast<br/><em>awake.</em></h2></div><p>Two wardens guide a living lighthouse through the fog. One sees the tide. One hears the bells. Only your shared memory can bring the lost lights home.</p></section>
    <section className="hud"><div><b>{game.player.name}</b><small>{game.player.role}</small></div><div className="status"><i/> PARTNER LINKED <span>{game.partner.name}</span></div><div className="beacon"><small>BEACONS LIT</small><strong>{game.litCount} / 4</strong><div><i style={{width:`${game.litCount*25}%`}}/></div></div></section>
    <LanternwakeBoard {...game} />
    {showRules && <div className="modal-backdrop" onClick={() => setShowRules(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowRules(false)}>×</button><span className="kicker">WARDEN'S FIELD GUIDE</span><h3>Read the fog together.</h3><p>Astra sees the shoreline. Mica hears the bell pattern. Take turns selecting lanterns, then use the shared clue to find the matching light. Four correct connections wake the coast.</p></div></div>}
  </main>;
}
