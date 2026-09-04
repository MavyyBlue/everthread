export interface StatefulIdSource {
  seed: string;
  idCounter: number;
}

function seedHash(seed:string){
  let hash=2166136261;
  for(let i=0;i<seed.length;i++){hash^=seed.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(36);
}

export function makeStateId(state:StatefulIdSource,prefix='id'):string{
  state.idCounter=(Number.isFinite(state.idCounter)?state.idCounter:0)+1;
  return `${prefix}-${seedHash(state.seed)}-${state.idCounter.toString(36)}`;
}
