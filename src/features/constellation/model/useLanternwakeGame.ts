import { useMemo, useState } from 'react';
export type Lantern = { id:number; glyph:string; color:string; revealed:boolean; lit:boolean };
const colors = ['coral','gold','aqua','violet'];
export function useLanternwakeGame() {
  const [lanterns, setLanterns] = useState<Lantern[]>(() => colors.flatMap((color, pair) => [0,1].map(n => ({id:pair*2+n,glyph:['✦','◈','✧','◇'][pair],color,revealed:false,lit:false}))).sort(()=>Math.random()-.5));
  const [selected, setSelected] = useState<number[]>([]);
  const [litCount, setLitCount] = useState(0);
  const choose = (id:number) => { if(selected.length===2 || lanterns.find(l=>l.id===id)?.lit || selected.includes(id)) return; const next=[...selected,id]; setLanterns(ls=>ls.map(l=>l.id===id?{...l,revealed:true}:l)); setSelected(next); if(next.length===2){const [a,b]=next;const match=lanterns.find(l=>l.id===a)?.color===lanterns.find(l=>l.id===b)?.color;if(match){setLanterns(ls=>ls.map(l=>next.includes(l.id)?{...l,lit:true}:l));setLitCount(c=>c+1)}setTimeout(()=>{setLanterns(ls=>ls.map(l=>next.includes(l.id)&&!l.lit?{...l,revealed:false}:l));setSelected([])},650)}};
  return useMemo(()=>({lanterns,choose,selected,litCount,roomCode:'MIST-24',player:{name:'ASTRA',role:'SHORELINE SEER'},partner:{name:'MICA',role:'BELL KEEPER'}}),[lanterns,selected,litCount]);
}
