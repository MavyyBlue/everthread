import { getNamePool } from '../data/names';
import { countryById } from '../data/countries';
import { jobs, jobById } from '../data/jobs';
import type { EngineResult, GameState, Npc, Orientation, Relationship, RelationshipType } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { consumeAction } from '../core/actionEconomy';

const interactionEffects: Record<string,{base:number;happiness:number;karma?:number}> = {
  conversation:{base:3,happiness:1}, compliment:{base:5,happiness:2}, insult:{base:-12,happiness:-1,karma:-2}, spend_time:{base:7,happiness:4},
  give_money:{base:8,happiness:1,karma:2}, gift:{base:6,happiness:3}, ask_money:{base:-2,happiness:0}, argue:{base:-9,happiness:-2},
  apologize:{base:7,happiness:1,karma:1}, prank:{base:1,happiness:2}, fight:{base:-20,happiness:-5,karma:-4}, counseling:{base:8,happiness:2}, vacation:{base:11,happiness:6},
};

const FAMILY_RELATION_TYPES = new Set<RelationshipType>(['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew']);
const PLAYER_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);
const NPC_ENTRY_JOBS = jobs.filter(job=>job.experienceRequirement===0 && job.minAge<=18);

function addNpcMemory(state:GameState,npc:Npc,kind:string,sentiment:number,summary:string,permanent=false){
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent});
  if(npc.memories.length>36){
    const permanentMemories=npc.memories.filter(memory=>memory.permanent);
    const recent=npc.memories.filter(memory=>!memory.permanent).slice(-Math.max(0,36-permanentMemories.length));
    npc.memories=[...permanentMemories.slice(-18),...recent].slice(-36);
  }
}

function directRelationship(state:GameState,npcId:string){return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged);}
function isPlayerFamily(state:GameState,npcId:string){const type=directRelationship(state,npcId)?.type;return Boolean(type&&FAMILY_RELATION_TYPES.has(type));}
function hasPlayerRomance(state:GameState,npcId:string){const type=directRelationship(state,npcId)?.type;return Boolean(type&&PLAYER_ROMANTIC_TYPES.has(type));}

function updateNpcCareer(state:GameState,npc:Npc,rng:ReturnType<typeof createRng>){
  if(npc.age<16||npc.imprisoned)return;
  if(!npc.careerId){
    if(npc.age>=18&&rng.chance(npc.traits.includes('ambitious')?.34:.22)){
      const options=NPC_ENTRY_JOBS.length?NPC_ENTRY_JOBS:jobs.filter(job=>job.experienceRequirement===0);
      const job=rng.pick(options);npc.careerId=job.id;
      addNpcMemory(state,npc,'career',4,`Started working as ${job.title}.`);
    }
    return;
  }
  const job=jobById[npc.careerId];
  if(!job){npc.careerId=undefined;return;}
  const jobLossChance=npc.traits.includes('responsible')?.008:npc.traits.includes('reckless')?.028:.015;
  if(rng.chance(jobLossChance)){
    addNpcMemory(state,npc,'job_loss',-8,`Left a job as ${job.title}.`,true);npc.careerId=undefined;npc.happiness=clamp(npc.happiness-7);return;
  }
  if(job.promotionPath&&npc.age>=20){
    const promotionChance=.055+(npc.traits.includes('ambitious')?.035:0)+(npc.traits.includes('responsible')?.02:0);
    if(rng.chance(promotionChance)){const next=jobById[job.promotionPath];if(next){npc.careerId=next.id;addNpcMemory(state,npc,'promotion',7,`Advanced to ${next.title}.`,true);}}
  }
  const current=jobById[npc.careerId]??job;
  const gross=(current.salaryRange[0]+current.salaryRange[1])/2*state.economy.salaryIndex;
  const savingsRate=npc.traits.includes('responsible')?.12:npc.traits.includes('reckless')?.01:.065;
  const annualSavings=gross*savingsRate-(npc.age>18?2500*state.economy.inflationIndex:0);
  npc.wealth=Math.max(0,Math.round(npc.wealth+annualSavings+rng.int(-1800,1800)));
  if(npc.age>=67&&rng.chance(.12)){addNpcMemory(state,npc,'retirement',3,`Retired from work as ${current.title}.`,true);npc.careerId=undefined;}
}

function createAutonomousPartner(state:GameState,npc:Npc,rng:ReturnType<typeof createRng>){
  if(npc.age<18||npc.partnerId||hasPlayerRomance(state,npc.id))return;
  const pool=getNamePool(npc.countryId);const age=Math.max(18,npc.age+rng.int(-5,5));const id=makeStateId(state,'npc');
  const partner:Npc={id,firstName:rng.pick(pool.first),lastName:rng.pick(pool.last),age,alive:true,health:rng.int(55,98),happiness:rng.int(42,94),wealth:rng.int(0,120000),countryId:npc.countryId,city:npc.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian']),fertility:rng.int(20,92),maritalStatus:'dating',traits:rng.shuffle(['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','witty','private']).slice(0,3),hiddenOpinion:0,memories:[],parentIds:[],childIds:[],partnerId:npc.id};
  npc.partnerId=id;npc.maritalStatus='dating';state.npcs[id]=partner;
  addNpcMemory(state,npc,'partner',5,`Began dating ${partner.firstName} ${partner.lastName}.`);
  addNpcMemory(state,partner,'partner',5,`Began dating ${npc.firstName} ${npc.lastName}.`);
  const relation=directRelationship(state,npc.id);
  if(relation?.type==='parent')state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'stepparent',score:rng.int(28,62),attraction:0,compatibility:rng.int(35,75),yearsKnown:0});
}

function advanceNpcPartnership(state:GameState,npc:Npc,rng:ReturnType<typeof createRng>){
  if(!npc.partnerId)return;const partner=state.npcs[npc.partnerId];
  if(!partner?.alive){npc.partnerId=undefined;if(npc.maritalStatus==='married')npc.maritalStatus='widowed';else npc.maritalStatus='single';return;}
  if(hasPlayerRomance(state,npc.id))return;
  if(npc.maritalStatus==='dating'&&partner.maritalStatus==='dating'&&rng.chance(.10)){
    npc.maritalStatus='married';partner.maritalStatus='married';addNpcMemory(state,npc,'marriage',9,`Married ${partner.firstName} ${partner.lastName}.`,true);addNpcMemory(state,partner,'marriage',9,`Married ${npc.firstName} ${npc.lastName}.`,true);
    if(isPlayerFamily(state,npc.id)||isPlayerFamily(state,partner.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`${npc.firstName} married ${partner.firstName} ${partner.lastName}.`,npcIds:[npc.id,partner.id]});
  } else if(npc.maritalStatus==='married'&&partner.maritalStatus==='married'&&rng.chance(npc.traits.includes('loyal')?.006:.012)){
    npc.maritalStatus='divorced';partner.maritalStatus='divorced';npc.partnerId=undefined;partner.partnerId=undefined;addNpcMemory(state,npc,'divorce',-10,`Divorced ${partner.firstName} ${partner.lastName}.`,true);addNpcMemory(state,partner,'divorce',-10,`Divorced ${npc.firstName} ${npc.lastName}.`,true);
    if(isPlayerFamily(state,npc.id)||isPlayerFamily(state,partner.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`${npc.firstName} and ${partner.firstName} divorced.`,npcIds:[npc.id,partner.id]});
  }
}

function childRelationshipType(state:GameState,parentIds:string[]):RelationshipType|undefined{
  const types=parentIds.map(id=>directRelationship(state,id)?.type).filter(Boolean) as RelationshipType[];
  if(types.some(type=>type==='child'))return'grandchild';
  if(types.some(type=>['sibling','half_sibling','stepsibling'].includes(type)))return'niece_nephew';
  if(types.some(type=>type==='parent'))return'half_sibling';
  return undefined;
}

function maybeCreateNpcChild(state:GameState,npc:Npc,processedCouples:Set<string>,rng:ReturnType<typeof createRng>){
  if(!npc.partnerId||npc.maritalStatus!=='married')return;const partner=state.npcs[npc.partnerId];if(!partner?.alive||partner.maritalStatus!=='married')return;
  const coupleKey=[npc.id,partner.id].sort().join('|');if(processedCouples.has(coupleKey))return;processedCouples.add(coupleKey);
  if(!isPlayerFamily(state,npc.id)&&!isPlayerFamily(state,partner.id))return;
  if(npc.age<18||partner.age<18||npc.age>50||partner.age>50)return;
  const existingChildren=new Set([...npc.childIds,...partner.childIds]);if(existingChildren.size>=4)return;
  const fertility=(npc.fertility+partner.fertility)/200;const chance=.035*fertility*(existingChildren.size===0?1.35:Math.max(.4,1-existingChildren.size*.18));if(!rng.chance(chance))return;
  const pool=getNamePool(npc.countryId);const id=makeStateId(state,'npc');const firstName=rng.pick(pool.first);const lastName=rng.chance(.65)?npc.lastName:partner.lastName;
  const child:Npc={id,firstName,lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,96),wealth:0,countryId:npc.countryId,city:npc.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(5,25),memories:[],parentIds:[npc.id,partner.id],childIds:[]};
  state.npcs[id]=child;npc.childIds.push(id);partner.childIds.push(id);state.legacy.familyTreeNpcIds.push(id);
  const relationType=childRelationshipType(state,[npc.id,partner.id]);
  if(relationType)state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:relationType,score:rng.int(42,72),attraction:0,compatibility:rng.int(40,80),yearsKnown:0});
  addNpcMemory(state,npc,'child_birth',10,`${firstName} was born.`,true);addNpcMemory(state,partner,'child_birth',10,`${firstName} was born.`,true);
  if(relationType)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`${firstName} ${lastName} was born into your extended family.`,npcIds:[id,npc.id,partner.id]});
}

function handleNpcDeath(state:GameState,npc:Npc){
  npc.alive=false;npc.imprisoned=false;
  if(npc.partnerId){const partner=state.npcs[npc.partnerId];if(partner?.alive){if(partner.maritalStatus==='married')partner.maritalStatus='widowed';else partner.maritalStatus='single';partner.partnerId=undefined;addNpcMemory(state,partner,'bereavement',-12,`${npc.firstName} ${npc.lastName} died.`,true);}npc.partnerId=undefined;}
  const playerIsChild=npc.childIds.includes(state.character.id)&&state.character.alive;
  const livingChildren=npc.childIds.map(id=>state.npcs[id]).filter((child):child is Npc=>Boolean(child?.alive));
  const heirCount=livingChildren.length+(playerIsChild?1:0);
  if(heirCount&&npc.wealth>0){
    const inheritance=Math.round(npc.wealth*.55/heirCount);
    for(const child of livingChildren)child.wealth+=inheritance;
    if(playerIsChild&&inheritance>0){
      state.finances.cash+=inheritance;
      state.flags.inheritanceReceived=Number(state.flags.inheritanceReceived??0)+inheritance;
      state.flags.lifetimeInheritance=Number(state.flags.lifetimeInheritance??0)+inheritance;
      state.flags.inheritances=Number(state.flags.inheritances??0)+1;
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You inherited ${inheritance.toLocaleString()} from ${npc.firstName} ${npc.lastName}.`,moneyDelta:inheritance,npcIds:[npc.id]});
    }
    npc.wealth=Math.max(0,npc.wealth-inheritance*heirCount);
  }
  for(const rel of state.relationships.filter(r=>r.npcId===npc.id))rel.score=clamp(rel.score-10);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text:`${npc.firstName} ${npc.lastName} died at age ${npc.age}.`,npcIds:[npc.id]});
}

export function ageNpcs(state:GameState,rng=createRng(state.seed,state.rngCounter)){
  const startingNpcs=Object.values(state.npcs);const processedCouples=new Set<string>();
  const directTypes=new Map(state.relationships.map(rel=>[rel.npcId,rel] as const));
  const isMeaningful=(npcId:string)=>{const rel=directTypes.get(npcId);return Boolean(rel&&(['friend','best_friend','enemy','partner','fiance','spouse','ex'].includes(rel.type)||FAMILY_RELATION_TYPES.has(rel.type)||rel.score>=72));};
  for(const npc of startingNpcs){
    if(!npc.alive)continue;npc.age+=1;
    const backgroundSchoolNpc=npc.simulationTier==='background'&&!isMeaningful(npc.id);
    if(backgroundSchoolNpc){
      // Acquaintances still age every year, but expensive stochastic autonomy is batched biennially.
      npc.health=clamp(npc.health-Math.max(0,(npc.age-55)*.08));
      if(npc.age%2!==0)continue;
      npc.health=clamp(npc.health+rng.int(-3,1));npc.happiness=clamp(npc.happiness+rng.int(-3,3));
      if(npc.age%4===0)updateNpcCareer(state,npc,rng);
      if(npc.age>75||npc.health<15){const deathChance=Math.max(.006,(npc.age-70)*.012+(20-npc.health)*.004);if(rng.chance(deathChance))handleNpcDeath(state,npc);}
      continue;
    }
    npc.health=clamp(npc.health-Math.max(0,(npc.age-55)*.11)+rng.int(-2,1));npc.happiness=clamp(npc.happiness+rng.int(-3,3));
    if(npc.imprisoned&&rng.chance(.18))npc.happiness=clamp(npc.happiness-4);
    updateNpcCareer(state,npc,rng);
    if(npc.age>=18&&!npc.partnerId&&!hasPlayerRomance(state,npc.id)&&['single','divorced','widowed'].includes(npc.maritalStatus)&&rng.chance(npc.traits.includes('romantic')?.04:.025))createAutonomousPartner(state,npc,rng);
    advanceNpcPartnership(state,npc,rng);maybeCreateNpcChild(state,npc,processedCouples,rng);
    if(npc.age>75||npc.health<15){const deathChance=Math.max(.003,(npc.age-70)*.006+(20-npc.health)*.002);if(rng.chance(deathChance))handleNpcDeath(state,npc);}
  }
  for(const rel of state.relationships){rel.yearsKnown+=1;const npc=state.npcs[rel.npcId];if(!npc?.alive)continue;const backgroundSchoolRel=npc.simulationTier==='background'&&!isMeaningful(rel.npcId);if(backgroundSchoolRel&&state.character.age%2!==0)continue;const decay=['spouse','child','parent','grandchild','grandparent'].includes(rel.type)?rng.int(-1,1):rng.int(-2,1);rel.score=clamp(rel.score+decay);}
  state.rngCounter=rng.counter();
}

function personalityMultiplier(npc:Npc, action:string) {
  let mod=0;
  if (npc.traits.includes('loyal') && ['spend_time','apologize','conversation'].includes(action)) mod+=3;
  if (npc.traits.includes('generous') && action==='ask_money') mod+=5;
  if (npc.traits.includes('selfish') && action==='ask_money') mod-=6;
  if (npc.traits.includes('aggressive') && ['insult','prank'].includes(action)) mod-=4;
  if (npc.traits.includes('romantic') && ['gift','vacation'].includes(action)) mod+=4;
  if (npc.traits.includes('stubborn') && action==='apologize') mod-=2;
  return mod;
}

export function interactWithNpc(state:GameState,npcId:string,action:string):EngineResult {
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(r=>r.npcId===npcId);
  if (!npc || !rel) return {success:false,messages:[{text:'That relationship no longer exists.'}]};
  if (!npc.alive) return {success:false,messages:[{text:`You cannot interact with ${npc.firstName}; they have died.`}]};
  const spec=interactionEffects[action];
  if (!spec) return {success:false,messages:[{text:'That interaction is not available.'}]};
  if((action==='give_money'||action==='gift')&&state.finances.cash<(action==='give_money'?500:150))return{success:false,messages:[{text:'You do not have enough cash for that.'}]};
  const gate=consumeAction(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:${action}`}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  let delta=spec.base+personalityMultiplier(npc,action)+rng.int(-3,3);
  if (action==='give_money' || action==='gift') {
    const cost=action==='give_money'?500:150;
    state.finances.cash-=cost; npc.wealth+=cost;
  }
  if (action==='ask_money') {
    if (npc.wealth < 250 || !rng.chance(clamp(rel.score+npc.hiddenOpinion,0,180)/200)) delta-=4;
    else { const amount=Math.min(npc.wealth,rng.int(100,1200)); npc.wealth-=amount; state.finances.cash+=amount; }
  }
  rel.score=clamp(rel.score+delta); npc.hiddenOpinion=clamp(npc.hiddenOpinion+delta*.35,-100,100);
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:action,sentiment:delta,summary:`${state.character.firstName} chose to ${action.replace('_',' ')}.`,permanent:Math.abs(delta)>=10});
  state.character.stats.happiness=clamp(state.character.stats.happiness+spec.happiness);
  state.character.secondary.karma+=spec.karma??0;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:Math.abs(delta)>10?2:1,text:`You ${action.replace('_',' ')} with ${npc.firstName}.`,npcIds:[npcId],relationshipDelta:delta});
  state.rngCounter=rng.counter();
  return {success:true,messages:[{text:`${npc.firstName}'s relationship with you ${delta>=0?'improved':'worsened'} (${delta>=0?'+':''}${Math.round(delta)}).`}]};
}

function orientationCompatible(player:GameState['character'],npc:Npc) {
  // Deliberately simplified compatibility model for simulation; identity is not treated as a stat bonus/penalty.
  if (player.orientation==='asexual') return false;
  if (player.orientation==='bisexual' || player.orientation==='pansexual') return true;
  if (npc.sexuality==='bisexual' || npc.sexuality==='pansexual') return true;
  return true; // allows emergent dating without inferring NPC gender from name.
}

export function meetPotentialPartner(state:GameState):EngineResult {
  if (state.character.age<14) return {success:false,messages:[{text:'Dating becomes available in the teen years.'}]};
  const gate=consumeAction(state,{policy:'social.meet'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const pool=getNamePool(state.character.countryId);
  const minPartnerAge=state.character.age>=18?18:14;
  const maxPartnerAge=state.character.age>=18?Math.max(18,state.character.age+4):17;
  const age=Math.max(minPartnerAge,Math.min(maxPartnerAge,state.character.age+rng.int(-4,4)));
  const id=makeStateId(state,'npc');
  const npc:Npc={
    id,firstName:rng.pick(pool.first),lastName:rng.pick(pool.last),age,alive:true,health:rng.int(55,98),happiness:rng.int(40,92),wealth:rng.int(0,180000),
    countryId:state.character.countryId,city:state.character.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian']),fertility:rng.int(20,92),maritalStatus:'single',
    traits:rng.shuffle(['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','witty','private']).slice(0,3),hiddenOpinion:rng.int(0,35),memories:[],parentIds:[],childIds:[]
  };
  state.npcs[id]=npc;
  const rel:Relationship={id:makeStateId(state,'rel'),npcId:id,type:'friend',score:rng.int(20,48),attraction:rng.int(35,95),compatibility:rng.int(25,95),yearsKnown:0};
  state.relationships.push(rel); state.rngCounter=rng.counter();
  const compatible=orientationCompatible(state.character,npc);
  return {success:true,messages:[{text:`You met ${npc.firstName} ${npc.lastName}, age ${age}. Compatibility: ${rel.compatibility}%.${compatible?'':' The spark feels uncertain.'}`}]};
}

export function changeRelationshipType(state:GameState,npcId:string,action:'ask_out'|'propose'|'marry'|'break_up'|'divorce'|'reconcile'):EngineResult {
  const npc=state.npcs[npcId]; const rel=state.relationships.find(r=>r.npcId===npcId);
  if(!npc||!rel||!npc.alive) return {success:false,messages:[{text:'That relationship is unavailable.'}]};
  if(action==='ask_out'||action==='reconcile'){
    if(state.character.age<14||npc.age<14)return{success:false,messages:[{text:'Dating becomes available in the teen years.'}]};
    if(state.character.age<18&&npc.age>=18)return{success:false,messages:[{text:'Teen dating is limited to other teens.'}]};
    if(state.character.age>=18&&npc.age<18)return{success:false,messages:[{text:'Adult dating is limited to adults.'}]};
  }
  if((action==='propose'||action==='marry')&&(state.character.age<18||npc.age<18))return{success:false,messages:[{text:'Engagement and marriage are adult relationship milestones.'}]};
  if(action==='ask_out'&&rel.type!=='friend')return{success:false,messages:[{text:'You can only ask out a current friend.'}]};
  if(action==='propose'&&rel.type!=='partner')return{success:false,messages:[{text:'You need to be dating before proposing.'}]};
  if(action==='marry'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'Marriage is not available in this relationship yet.'}]};
  if(action==='break_up'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'There is no dating relationship to end.'}]};
  if(action==='divorce'&&rel.type!=='spouse')return{success:false,messages:[{text:'You are not married to this person.'}]};
  if(action==='reconcile'&&rel.type!=='ex')return{success:false,messages:[{text:'Only an ex can be reconciled with.'}]};
  if(action==='propose'&&state.relationships.some(r=>r.npcId!==npcId&&['fiance','spouse'].includes(r.type)))return{success:false,messages:[{text:'You are already committed to someone else.'}]};
  if(action==='marry'&&state.relationships.some(r=>r.npcId!==npcId&&r.type==='spouse'))return{success:false,messages:[{text:'You are already married.'}]};
  const gate=consumeAction(state,{policy:'relationship.milestone',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const chance=clamp(rel.score*.55+rel.compatibility*.25+rel.attraction*.2+npc.hiddenOpinion*.15,0,100)/100;
  let success=true; let newType:RelationshipType=rel.type; let text='';
  if(action==='ask_out') { success=rng.chance(chance); newType=success?'partner':rel.type; text=success?`${npc.firstName} agrees to date you.`:`${npc.firstName} would rather stay friends.`; if(success) npc.maritalStatus='dating'; }
  if(action==='propose') {
    const alreadyCommitted=state.relationships.some(r=>r.npcId!==npcId&&['fiance','spouse'].includes(r.type));
    if(rel.type!=='partner'||alreadyCommitted){success=false;text=alreadyCommitted?'You are already committed to someone else.':'You need to be dating before proposing.';}
    else {success=rng.chance(chance+.08);newType=success?'fiance':rel.type;text=success?`${npc.firstName} says yes.`:`${npc.firstName} is not ready to get engaged.`;if(success)npc.maritalStatus='engaged';}
  }
  if(action==='marry') {
    const existingSpouse=state.relationships.some(r=>r.npcId!==npcId&&r.type==='spouse');
    if(!['partner','fiance'].includes(rel.type)||existingSpouse){success=false;text=existingSpouse?'You are already married.':'Marriage is not available in this relationship yet.';}
    else {success=true;newType='spouse';text=`You married ${npc.firstName} ${npc.lastName}.`;npc.maritalStatus='married';}
  }
  if(action==='break_up'||action==='divorce') { if(!['partner','fiance','spouse'].includes(rel.type)) success=false; else {newType='ex';npc.maritalStatus=action==='divorce'?'divorced':'single';rel.score=clamp(rel.score-18);text=`You ${action==='divorce'?'divorced':'broke up with'} ${npc.firstName}.`;} }
  if(action==='reconcile') { if(rel.type!=='ex') success=false; else success=rng.chance(Math.max(.15,chance-.1)); newType=success?'partner':'ex';text=success?`You and ${npc.firstName} decided to try again.`:`${npc.firstName} does not want to reopen the relationship.`; }
  if(!success && !text) text='That relationship step is not available right now.';
  if(success){rel.type=newType;if(action==='marry')state.flags.marriages=Number(state.flags.marriages??0)+1;if(action==='reconcile')state.flags.reconciliations=Number(state.flags.reconciliations??0)+1;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:success?3:1,text,npcIds:[npcId]});
  state.rngCounter=rng.counter(); return {success,messages:[{text}]};
}

function existingChildFirstNames(state:GameState){
  return new Set(state.relationships.filter(rel=>rel.type==='child').map(rel=>state.npcs[rel.npcId]?.firstName).filter((name):name is string=>Boolean(name)));
}

function pickChildName(state:GameState,pool:ReturnType<typeof getNamePool>,rng:ReturnType<typeof createRng>,reserved:Set<string>){
  const available=pool.first.filter(name=>!reserved.has(name));
  const name=rng.pick(available.length?available:pool.first);
  reserved.add(name);
  return name;
}

export function processFamilyPlanningYear(state:GameState):void {
  const pregnancy=state.familyPlanning?.pregnancy;
  if(!pregnancy||pregnancy.dueAge>state.character.age)return;
  const partner=state.npcs[pregnancy.partnerId];
  const rng=createRng(state.seed,state.rngCounter);
  const pool=getNamePool(state.character.countryId);
  const reserved=existingChildFirstNames(state);
  const names:string[]=[];
  const count=Math.max(1,Math.min(3,Math.floor(pregnancy.expectedChildren||1)));
  for(let i=0;i<count;i++){
    const id=makeStateId(state,'child');
    const firstName=pickChildName(state,pool,rng,reserved);names.push(firstName);
    const child:Npc={id,firstName,lastName:state.character.lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,95),wealth:0,countryId:state.character.countryId,city:state.character.city,
      sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(55,90),memories:[],parentIds:[state.character.id,...(partner?[partner.id]:[])],childIds:[]};
    state.npcs[id]=child;state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
    if(partner&&!partner.childIds.includes(id))partner.childIds.push(id);
    state.legacy.familyTreeNpcIds.push(id);
  }
  const text=count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text,npcIds:partner?[partner.id]:undefined});
  delete state.familyPlanning.pregnancy;
  state.flags.lastFamilyExpansionAge=state.character.age;
  state.rngCounter=rng.counter();
}

export function haveChild(state:GameState,partnerId?:string,adopt=false):EngineResult {
  if(state.character.age<16) return {success:false,messages:[{text:'You are too young to become a parent.'}]};
  state.familyPlanning=state.familyPlanning??{};
  if(state.familyPlanning.pregnancy)return{success:false,messages:[{text:'You are already expecting a child. Age up to let the pregnancy progress.'}]};
  const hasNewborn=state.relationships.some(rel=>rel.type==='child'&&state.npcs[rel.npcId]?.alive&&state.npcs[rel.npcId]?.age===0);
  if(hasNewborn)return{success:false,messages:[{text:'Your family already welcomed a child this year. Age up before expanding it again.'}]};
  const partner=partnerId?state.npcs[partnerId]:undefined;
  const rel=partnerId?state.relationships.find(r=>r.npcId===partnerId):undefined;
  if(!adopt && (!partner||!rel||!['partner','fiance','spouse'].includes(rel.type))) return {success:false,messages:[{text:'A current partner is required for this path.'}]};
  if(!adopt && partner && partner.age<16) return {success:false,messages:[{text:"Both parents must meet the game's minimum parenting age."}]};
  const rng=createRng(state.seed,state.rngCounter);
  const fertility=adopt?1:clamp((state.character.secondary.fertility+(partner?.fertility??50))/200,.08,.92);
  if(!adopt){
    const gate=consumeAction(state,{policy:'family.child_attempt'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
    if(!rng.chance(fertility)){state.rngCounter=rng.counter();return{success:false,messages:[{text:'You tried for a child, but there was no pregnancy this year.'}]};}
    const expectedChildren=rng.chance(.012)?3:rng.chance(.035)?2:1;
    state.familyPlanning.pregnancy={partnerId:partner!.id,conceivedAge:state.character.age,dueAge:state.character.age+1,expectedChildren};
    state.rngCounter=rng.counter();
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`You and ${partner!.firstName} learned that a child is on the way.`,npcIds:[partner!.id]});
    return{success:true,messages:[{text:`You and ${partner!.firstName} are expecting${expectedChildren>1?` ${expectedChildren===2?'twins':'triplets'}`:' a child'}.`} ]};
  }
  const gate=consumeAction(state,{policy:'family.adoption'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const pool=getNamePool(state.character.countryId);
  const count=1;
  const names:string[]=[];
  const reserved=existingChildFirstNames(state);
  for(let i=0;i<count;i++){
    const id=makeStateId(state,'child'); const firstName=pickChildName(state,pool,rng,reserved); names.push(firstName);
    const child:Npc={id,firstName,lastName:state.character.lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,95),wealth:0,countryId:state.character.countryId,city:state.character.city,
      sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(55,90),memories:[],parentIds:[state.character.id,...(partner?[partner.id]:[])],childIds:[]};
    state.npcs[id]=child; state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
    partner?.childIds.push(id); state.legacy.familyTreeNpcIds.push(id);
  }
  const text=adopt?`You adopted ${count>1?`${count} children`:names[0]}.`:`${count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`}`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text}); state.rngCounter=rng.counter();
  return {success:true,messages:[{text}]};
}
