import { getNamePool } from '../data/names';
import type { EngineResult, GameState, Npc, Orientation, Relationship, RelationshipType } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { consumeAction } from '../core/actionEconomy';
import { ensureNpcLife } from './NpcLifeSystem';

const interactionEffects: Record<string,{base:number;happiness:number;karma?:number}> = {
  conversation:{base:3,happiness:1}, compliment:{base:5,happiness:2}, insult:{base:-12,happiness:-1,karma:-2}, spend_time:{base:7,happiness:4},
  give_money:{base:8,happiness:1,karma:2}, gift:{base:6,happiness:3}, ask_money:{base:-2,happiness:0}, argue:{base:-9,happiness:-2},
  apologize:{base:7,happiness:1,karma:1}, prank:{base:1,happiness:2}, fight:{base:-20,happiness:-5,karma:-4}, counseling:{base:8,happiness:2}, vacation:{base:11,happiness:6},
};

export { processNpcLives as ageNpcs } from './NpcLifeSystem';

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
  state.npcs[id]=npc;ensureNpcLife(state,npc);
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
    state.npcs[id]=child;ensureNpcLife(state,child);state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
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
    state.npcs[id]=child;ensureNpcLife(state,child); state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
    partner?.childIds.push(id); state.legacy.familyTreeNpcIds.push(id);
  }
  const text=adopt?`You adopted ${count>1?`${count} children`:names[0]}.`:`${count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`}`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text}); state.rngCounter=rng.counter();
  return {success:true,messages:[{text}]};
}
