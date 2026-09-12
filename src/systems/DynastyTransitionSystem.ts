import { jobById } from '../data/jobs';
import type { GameState, Npc } from '../types/game';
import type { EstateHeirPreview, EstatePreview } from './EstateSystem';
import { npcNetWorth } from './NpcAssetSystem';
import { previewEstate } from './EstateSystem';

export interface DynastySuccessorPreview {
  npcId: string;
  name: string;
  age: number;
  city: string;
  countryId: string;
  lifeStage: 'minor' | 'adult';
  education: string;
  career: string;
  relationshipStatus: string;
  partnerName?: string;
  children: number;
  health: number;
  happiness: number;
  fame: number;
  reputation: number;
  liquidWealth: number;
  debt: number;
  ownNetWorth: number;
  ownProperties: Array<{ id:string; name:string; value:number; mortgageBalance:number }>;
  ownBusinesses: Array<{ id:string; name:string; value:number }>;
  projectedInheritance: number;
  projectedCash: number;
  projectedInvestmentValue: number;
  projectedProperties: EstateHeirPreview['properties'];
  projectedBusinesses: EstateHeirPreview['businesses'];
  projectedCollectibles: EstateHeirPreview['collectibles'];
  inheritanceHeldUntilAge?: number;
  projectedStartingNetWorth: number;
}

export interface DynastyTransitionReview {
  estate: EstatePreview;
  successors: DynastySuccessorPreview[];
  writtenPlan: boolean;
  generation: number;
  nextGeneration: number;
}

function currentEducation(npc:Npc){
  const records=npc.life?.education.records??[];
  const active=[...records].reverse().find(record=>record.endAge===undefined);
  const latest=active??records.at(-1);
  if(latest){
    const credential=latest.credential?` · ${latest.credential}`:'';
    return `${latest.institution} · ${latest.stage}${latest.graduated?' · graduated':''}${credential}`;
  }
  if(npc.age<5)return 'Early childhood';
  if(npc.age<18)return 'School-age education';
  return npc.life?.education.credential??'No current education program';
}

function currentCareer(npc:Npc){
  if(npc.life?.career.retired)return 'Retired';
  const job=npc.careerId?jobById[npc.careerId]:undefined;
  if(job)return job.title;
  if(npc.age<18)return 'Not yet in the workforce';
  return 'No current career';
}

function relationshipSummary(npc:Npc){
  switch(npc.maritalStatus){
    case 'married': return 'Married';
    case 'engaged': return 'Engaged';
    case 'dating': return 'Dating';
    case 'divorced': return 'Divorced';
    case 'widowed': return 'Widowed';
    default: return 'Single';
  }
}

function successorFromNpc(state:GameState,npc:Npc,heir?:EstateHeirPreview):DynastySuccessorPreview {
  const properties=(npc.assetPortfolio?.properties??[]).map(property=>({
    id:property.id,
    name:property.name,
    value:Math.max(0,property.marketValue-property.mortgageBalance),
    mortgageBalance:Math.max(0,property.mortgageBalance),
  }));
  const businesses=(npc.assetPortfolio?.businesses??[]).filter(business=>business.active).map(business=>({id:business.id,name:business.name,value:Math.max(0,business.valuation)}));
  const partner=npc.partnerId?state.npcs[npc.partnerId]:undefined;
  const projectedInheritance=heir?.inheritanceValue??0;
  return {
    npcId:npc.id,
    name:`${npc.firstName} ${npc.lastName}`,
    age:npc.age,
    city:npc.city,
    countryId:npc.countryId,
    lifeStage:npc.age<18?'minor':'adult',
    education:currentEducation(npc),
    career:currentCareer(npc),
    relationshipStatus:relationshipSummary(npc),
    ...(partner?.alive?{partnerName:`${partner.firstName} ${partner.lastName}`}:{ }),
    children:npc.childIds.filter(id=>state.npcs[id]?.alive).length,
    health:npc.health,
    happiness:npc.happiness,
    fame:npc.life?.publicLife.fame??(npc.famous?50:0),
    reputation:npc.life?.publicLife.reputation??50,
    liquidWealth:Math.max(0,npc.wealth),
    debt:Math.max(0,npc.life?.finance.debt??0),
    ownNetWorth:npcNetWorth(npc),
    ownProperties:properties,
    ownBusinesses:businesses,
    projectedInheritance,
    projectedCash:heir?.cash??0,
    projectedInvestmentValue:heir?.investmentValue??0,
    projectedProperties:heir?.properties.map(item=>({...item}))??[],
    projectedBusinesses:heir?.businesses.map(item=>({...item}))??[],
    projectedCollectibles:heir?.collectibles.map(item=>({...item}))??[],
    ...(heir?.heldUntilAge?{inheritanceHeldUntilAge:heir.heldUntilAge}:{}),
    projectedStartingNetWorth:Math.max(0,npcNetWorth(npc)+projectedInheritance),
  };
}

/**
 * Read-only projection for the death -> estate -> successor decision flow.
 * It deliberately delegates all inheritance math to EstateSystem so the UI
 * never develops a second settlement authority.
 */
export function buildDynastyTransitionReview(state:GameState):DynastyTransitionReview {
  const estate=previewEstate(state);
  const heirByNpc=new Map(estate.heirs.map(heir=>[heir.npcId,heir] as const));
  const successors=state.relationships
    .filter(rel=>rel.type==='child'&&!rel.estranged&&state.npcs[rel.npcId]?.alive)
    .map(rel=>state.npcs[rel.npcId]!)
    .sort((a,b)=>b.age-a.age||a.id.localeCompare(b.id))
    .map(npc=>successorFromNpc(state,npc,heirByNpc.get(npc.id)));
  const writtenPlan=Boolean((state.inheritance.will?.length??0)||(state.inheritance.assetBequests?.length??0)||!state.inheritance.inheritProperties||!state.inheritance.inheritBusinesses);
  return{estate,successors,writtenPlan,generation:state.legacy.generation,nextGeneration:state.legacy.generation+1};
}
