import { useMemo, useState } from 'react';
import { Badge, Button, Progress, SegmentedControl, TextInput } from '@mantine/core';
import { calculateComboScore } from '../domain/scoring';

type Phase = 'lobby' | 'dress' | 'reveal' | 'results';
type Look = { name: string; title: string; top: number; accessory: number; skin: number; body: number; hair: number; headwear: number; audio: number; phrase: string; score: number };

const tones = ['#f5c7a3', '#d8916a', '#9d5d43', '#5c302a'];
const bodies = ['Compact', 'Average', 'Built'];
const hairstyles = ['Buzz', 'Fade', 'Curls', 'Locs', 'Bob', 'Bun'];
const headwear = ['None', 'Cap', 'Beanie'];
const audioGear = ['None', 'AirPods', 'Headphones'];
const tops = ['Quarter-zip fleece', 'Startup tee', 'Black hoodie', 'Conference blazer'];
const topTags = ['Q-ZIP', 'SHIP IT', 'DARK MODE', 'KEYNOTE'];
const accessories = ['Blue-light glasses', 'Mechanical keyboard', 'Tiny laptop', 'Cold brew'];
const accessoryTags = ['FOCUS', 'CLACK', 'MOBILE', 'CAFFEINE'];
const phrases = ['Ship it!', 'Let’s circle back.', 'Big energy.', 'It’s giving scale.'];
const competitors: Look[] = [
  { name: 'JULES', title: 'The 10x Developer', top: 2, accessory: 1, skin: 2, body: 0, hair: 3, headwear: 2, audio: 2, phrase: 'Works on my machine.', score: 86 },
  { name: 'KAI', title: 'The Visionary Founder', top: 3, accessory: 3, skin: 0, body: 2, hair: 5, headwear: 1, audio: 1, phrase: 'We’re pre-revenue.', score: 91 },
];

function Avatar({ look, compact = false }: { look: Pick<Look, 'top' | 'accessory' | 'skin' | 'body' | 'hair' | 'headwear' | 'audio' | 'phrase'>; compact?: boolean }) {
  const idleDelay = -((look.skin * 0.37) + (look.body * 0.23) + (look.hair * 0.11));
  return <div className={`avatar-scene ${compact ? 'compact' : ''}`}>
    <div className="scene-orb one"/><div className="scene-orb two"/>
    <div className={`avatar body-shape-${look.body}`} style={{ '--skin': tones[look.skin], '--idle-delay': `${idleDelay}s` } as React.CSSProperties}>
      <div className="head"><div className={`hair hair-${look.hair}`}><i/><i/><i/></div>{look.headwear > 0 && <div className={`headwear headwear-${look.headwear}`}/>}<div className="face"><i className="eye left"/><i className="eye right"/><span className="smirk"/></div>{look.audio > 0 && <div className={`audio-gear audio-${look.audio}`}><i/><i/></div>}<div className="neck"/></div>
      <div className={`torso top-${look.top}`}><span className="logo">{'{ }'}</span><div className="zip"/></div>
      <div className="arm arm-left"/><div className="arm arm-right"/><div className="legs"><span/><span/></div><div className="shoe shoe-left"/><div className="shoe shoe-right"/>
      <div className="prop">{look.accessory === 1 ? '⌨' : look.accessory === 2 ? '▣' : look.accessory === 3 ? '🥤' : '◉'}</div>
    </div>
    <div className="desk"><span className="monitor"/><span className="plant">✳</span><span className="mug">◒</span></div>
    {!compact && <div className="speech">“{look.phrase}”</div>}
  </div>;
}

function Header({ phase }: { phase: Phase }) {
  const steps: Phase[] = ['lobby', 'dress', 'reveal', 'results'];
  return <header className="topbar">
    <button className="brand" onClick={() => location.reload()}><span className="brand-mark">✦</span>DRESS THE <i>TECH BRO</i></button>
    <nav className="phase-nav" aria-label="Game progress">{steps.map((step, index) => <span key={step} className={steps.indexOf(phase) >= index ? 'active' : ''}>{String(index + 1).padStart(2, '0')} {step}</span>)}</nav>
    <Badge color="teal" variant="light" leftSection={<span className="live-dot"/>}>DEMO ROOM</Badge>
  </header>;
}

export function App() {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [name, setName] = useState('ALEX');
  const [identity, setIdentity] = useState('NON-B'), [skin, setSkin] = useState(1), [body, setBody] = useState(1), [hair, setHair] = useState(2), [hat, setHat] = useState(0), [audio, setAudio] = useState(0);
  const [top, setTop] = useState(0), [accessory, setAccessory] = useState(0), [phrase, setPhrase] = useState(0), [locked, setLocked] = useState(false);
  const [vote, setVote] = useState<string | null>(null);
  const score = useMemo(() => calculateComboScore({ top, accessory, body, phrase }), [top, accessory, body, phrase]);
  const player: Look = { name: name.trim().toUpperCase() || 'ALEX', title: ['The Founder', 'The Hacker', 'The PM', 'The VC Whisperer'][top], top, accessory, skin, body, hair, headwear: hat, audio, phrase: phrases[phrase], score };
  const looks = [player, ...competitors];
  const rankings = [...looks].map(look => ({ ...look, score: look.score + (vote === look.name ? 7 : 0) })).sort((a, b) => b.score - a.score);
  const update = (setter: (value: number) => void, value: number) => { setter(value); setLocked(false); };
  const randomize = () => { setTop(Math.floor(Math.random() * 4)); setAccessory(Math.floor(Math.random() * 4)); setPhrase(Math.floor(Math.random() * 4)); setLocked(false); };
  const speak = (text: string) => { if ('speechSynthesis' in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } };

  return <main className="shell"><Header phase={phase}/>
    {phase === 'lobby' && <section className="lobby-screen">
      <div className="lobby-copy"><p className="eyebrow">A 3-PLAYER STYLE BATTLE</p><h1>Outfit the office.<br/><em>Out-bro the room.</em></h1><p className="lede">Build the funniest tech stereotype, stage their workspace, and sell the whole look with one perfectly questionable catchphrase.</p>
        <div className="rules-grid"><div><b>01</b><span>DRESS</span><p>Build a look for the round’s prompt.</p></div><div><b>02</b><span>PITCH</span><p>Hear every player’s signature phrase.</p></div><div><b>03</b><span>VOTE</span><p>Pick the combo that understood the assignment.</p></div></div>
        <div className="join-row"><TextInput label="YOUR DISPLAY NAME" value={name} onChange={e => setName(e.currentTarget.value)} maxLength={14}/><Button color="orange" size="lg" onClick={() => setPhase('dress')} disabled={!name.trim()}>ENTER ROOM <span>→</span></Button></div>
        <p className="demo-note"><span>●</span> Demo mode includes two simulated players so the full round is playable solo.</p>
      </div>
      <div className="lobby-art"><div className="prompt-ticket"><span>ROUND PROMPT</span><strong>First day<br/>at a startup</strong><small>BUSINESS CASUAL IS A STATE OF MIND</small></div><Avatar look={competitors[1]}/><span className="sticker sticker-one">NO<br/>MEETINGS</span><span className="sticker sticker-two">v1.0</span></div>
    </section>}

    {phase === 'dress' && <><section className="hero"><div><p className="eyebrow">ROUND 01 / FIRST DAY AT A STARTUP</p><h1>Build your <em>best bro.</em></h1><p className="subhead">Dress for the stereotype. Commit to the bit. Impress the room.</p></div><div className="countdown"><span>TIME LEFT</span><strong>00:42</strong><Progress value={66} color="orange" size="xs"/></div></section>
      <section className="game-grid"><aside className="panel controls"><div className="panel-head"><span>01 / YOUR AVATAR</span><span className="status">{locked ? 'LOCKED' : 'EDITING'}</span></div><h2>Make it <em>you.</em></h2>
        <label className="control-label">IDENTITY</label><SegmentedControl fullWidth size="xs" value={identity} onChange={setIdentity} data={['FEM', 'MALE', 'NON-B']}/>
        <label className="control-label">SKIN TONE</label><div className="swatches">{tones.map((tone, i) => <button key={tone} className={`swatch ${skin === i ? 'selected' : ''}`} style={{ '--swatch': tone } as React.CSSProperties} onClick={() => update(setSkin, i)} aria-label={`Skin tone ${i + 1}`}/>)}</div>
        <label className="control-label">BODY TYPE</label><div className="body-picker">{bodies.map((label, i) => <button key={label} className={`body-option ${body === i ? 'selected' : ''}`} onClick={() => update(setBody, i)}><span className={`body-icon body-${i}`}/><small>{label}</small></button>)}</div>
        <label className="control-label">HAIRSTYLE <span className="cosmetic-note">STYLE ONLY · NO POINTS</span></label><div className="hair-picker">{hairstyles.map((label, i) => <button key={label} className={`hair-option ${hair === i ? 'selected' : ''}`} onClick={() => update(setHair, i)}><span className={`hair-swatch preview-hair-${i}`}><i/><i/><i/></span><small>{label}</small></button>)}</div>
        <label className="control-label">HEADWEAR <span className="cosmetic-note">NO POINTS</span></label><div className="cosmetic-picker">{headwear.map((label, i) => <button key={label} className={hat === i ? 'selected' : ''} onClick={() => update(setHat, i)}><span>{i === 0 ? '—' : i === 1 ? '▱' : '⌒'}</span><small>{label}</small></button>)}</div>
        <label className="control-label">AUDIO GEAR <span className="cosmetic-note">NO POINTS</span></label><div className="cosmetic-picker">{audioGear.map((label, i) => <button key={label} className={audio === i ? 'selected' : ''} onClick={() => update(setAudio, i)}><span>{i === 0 ? '—' : i === 1 ? '••' : '◖◗'}</span><small>{label}</small></button>)}</div>
        <div className="control-divider"/><label className="control-label">SIGNATURE PHRASE</label><button className="voice-select" onClick={() => { setPhrase((phrase + 1) % phrases.length); setLocked(false); }}><span className="speaker">◖))</span> “{phrases[phrase]}” <span>⌄</span></button><button className="hear-it" onClick={() => speak(phrases[phrase])}>▶ HEAR THE PITCH</button>
      </aside>
      <section className="stage"><div className="stage-label"><span>THE LOOK</span><Badge color="yellow" variant="filled">{player.title}</Badge></div><Avatar look={player}/><div className="score-row"><div><span>COMBO SCORE</span><strong>{score}<small>/100</small></strong></div><Progress value={score} color="orange" size="sm" className="score-progress"/><button className="shuffle" onClick={randomize}>⤨ RANDOMIZE</button></div></section>
      <aside className="panel closet"><div className="panel-head"><span>02 / THE CLOSET</span><span className="count">8 ITEMS</span></div><h2>Curate the <em>vibe.</em></h2><label className="control-label">TOP LAYER</label><div className="item-grid">{tops.map((label, i) => <button key={label} className={`item ${top === i ? 'selected' : ''}`} onClick={() => update(setTop, i)}><span className={`item-art art-top-${i}`}/><small>{label}</small><b>{topTags[i]}</b></button>)}</div><label className="control-label">ESSENTIAL ACCESSORY</label><div className="item-grid">{accessories.map((label, i) => <button key={label} className={`item ${accessory === i ? 'selected' : ''}`} onClick={() => update(setAccessory, i)}><span className="item-art">{['◉','⌨','▣','🥤'][i]}</span><small>{label}</small><b>{accessoryTags[i]}</b></button>)}</div></aside></section>
      <footer className="footer"><div className="players"><span className="player-avatar p1">{player.name[0]}</span><span className="player-avatar p2">J</span><span className="player-avatar p3">K</span><span className="add">3 / 3 CONNECTED</span></div><p>BEST COMBO WINS <span>•</span> VOTE AFTER THE ROUND</p>{locked ? <Button color="dark" onClick={() => setPhase('reveal')}>START THE RUNWAY →</Button> : <Button color="orange" onClick={() => setLocked(true)}>LOCK IN LOOK →</Button>}</footer></>}

    {phase === 'reveal' && <section className="reveal-screen"><div className="round-heading"><p className="eyebrow">THE RUNWAY / ROUND 01</p><h1>Who understood <em>the assignment?</em></h1><p>Play each pitch, inspect the combo, then cast one vote. Your own look is shown for context but cannot receive your vote.</p></div><div className="runway-grid">{looks.map((look, i) => <article key={look.name} className={`runway-card ${i === 0 ? 'your-look' : ''} ${vote === look.name ? 'voted' : ''}`}><div className="card-top"><span>{i === 0 ? 'YOUR LOOK' : `PLAYER 0${i + 1}`}</span><Badge color={i === 0 ? 'gray' : 'orange'} variant="light">{look.title}</Badge></div><Avatar look={look} compact/><div className="look-meta"><h2>{look.name}</h2><p>“{look.phrase}”</p><div className="combo-tags"><span>{topTags[look.top]}</span><span>{accessoryTags[look.accessory]}</span></div><Button variant="light" color="dark" fullWidth onClick={() => speak(look.phrase)}>▶ PLAY PITCH</Button>{i === 0 ? <Button fullWidth disabled>THAT’S YOU</Button> : <Button fullWidth color={vote === look.name ? 'teal' : 'orange'} onClick={() => setVote(look.name)}>{vote === look.name ? 'VOTE CAST ✓' : 'VOTE FOR THIS LOOK'}</Button>}</div></article>)}</div><div className="reveal-actions"><span>{vote ? `Your vote is locked for ${vote}.` : 'Choose one competitor to continue.'}</span><Button color="dark" size="lg" disabled={!vote} onClick={() => setPhase('results')}>REVEAL THE WINNER →</Button></div></section>}

    {phase === 'results' && <section className="results-screen"><div className="confetti" aria-hidden="true">✦ &nbsp; ◼ &nbsp; ● &nbsp; ✦ &nbsp; ▲ &nbsp; ● &nbsp; ✦</div><p className="eyebrow">ROUND 01 / FINAL RESULTS</p><h1>The office has <em>spoken.</em></h1><div className="winner-layout"><div className="winner-visual"><div className="winner-burst">WINNER</div><Avatar look={rankings[0]}/></div><div className="winner-copy"><span className="place">01 / TOP BRO</span><h2>{rankings[0].name}</h2><h3>{rankings[0].title}</h3><blockquote>“{rankings[0].phrase}”</blockquote><div className="final-score"><strong>{rankings[0].score}</strong><span>FINAL<br/>COMBO SCORE</span></div><p>The judges loved the commitment to the bit, the workspace chemistry, and the confidence of someone who has definitely said “disrupt” in a coffee shop.</p><Button color="orange" size="lg" onClick={() => { setPhase('lobby'); setVote(null); setLocked(false); }}>PLAY ANOTHER ROUND ↻</Button></div></div><div className="leaderboard">{rankings.map((look, i) => <div key={look.name}><b>0{i + 1}</b><span className={`player-avatar p${i + 1}`}>{look.name[0]}</span><strong>{look.name}</strong><small>{look.title}</small><em>{look.score} PTS</em></div>)}</div></section>}
  </main>;
}
