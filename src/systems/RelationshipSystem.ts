import { getNamePool } from '../data/names';
import type { EngineResult, GameState, Npc, Orientation, Relationship, RelationshipType } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { consumeAction } from '../core/actionEconomy';
import { ensureNpcLife } from './NpcLifeSystem';
import { assignNpcReproductiveSex, biologicalChildGate } from './ReproductionSystem';

const interactionEffects: Record<string,{base:number;happiness:number;karma?:number}> = {
  conversation:{base:3,happiness:1}, compliment:{base:5,happiness:2}, insult:{base:-12,happiness:-1,karma:-2}, spend_time:{base:7,happiness:4},
  give_money:{base:8,happiness:1,karma:2}, gift:{base:6,happiness:3}, ask_money:{base:-2,happiness:0}, argue:{base:-9,happiness:-2},
  apologize:{base:7,happiness:1,karma:1}, prank:{base:1,happiness:2}, fight:{base:-20,happiness:-5,karma:-4}, counseling:{base:8,happiness:2}, vacation:{base:11,happiness:6},
};

const ASK_OUT_RELATIONSHIP_TYPES = new Set<RelationshipType>(['friend','best_friend','classmate','coworker','boss','teacher','principal','coach']);
const CURRENT_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);

function datingAgesCompatible(playerAge:number,npcAge:number){
  if(playerAge<14||npcAge<14)return false;
  if(playerAge<18)return npcAge<18;
  return npcAge>=18;
}

function currentRomanticCommitments(state:GameState,excludeNpcId?:string){
  return state.relationships.filter(rel=>rel.npcId!==excludeNpcId&&CURRENT_ROMANTIC_TYPES.has(rel.type)&&state.npcs[rel.npcId]?.alive);
}

export function hasCurrentRomanticCommitment(state:GameState,excludeNpcId?:string){return currentRomanticCommitments(state,excludeNpcId).length>0;}

export function canAskOutNpc(state:GameState,npcId:string){
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return Boolean(npc?.alive&&rel&&ASK_OUT_RELATIONSHIP_TYPES.has(rel.type)&&datingAgesCompatible(state.character.age,npc.age)&&!hasCurrentRomanticCommitment(state,npcId));
}

export function canHookUpWithNpc(state:GameState,npcId:string){
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return Boolean(
    npc?.alive&&rel&&state.character.age>=18&&npc.age>=18&&
    ASK_OUT_RELATIONSHIP_TYPES.has(rel.type)&&currentRomanticCommitments(state,npcId).length>0
  );
}

export function canReconcileWithNpc(state:GameState,npcId:string){
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return Boolean(npc?.alive&&rel?.type==='ex'&&datingAgesCompatible(state.character.age,npc.age)&&!hasCurrentRomanticCommitment(state,npcId));
}

export function hookupDiscoveryChance(streak:number,commitmentType:RelationshipType,partner?:Npc){
  const repeated=Math.max(0,Math.floor(streak)-1)*.10;
  const commitmentBonus=commitmentType==='spouse'?.05:commitmentType==='fiance'?.03:0;
  const jealousyBonus=partner?.traits.includes('jealous')?.05:0;
  return clamp(.12+repeated+commitmentBonus+jealousyBonus,.12,.72);
}

export function hookUpWithNpc(state:GameState,npcId:string):EngineResult {
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  if(!npc||!rel||!npc.alive)return{success:false,messages:[{text:'That relationship is unavailable.'}]};
  if(state.character.age<18||npc.age<18)return{success:false,messages:[{text:'Hookups are only available between adults.'}]};
  if(!ASK_OUT_RELATIONSHIP_TYPES.has(rel.type))return{success:false,messages:[{text:'A hookup is not available from this relationship.'}]};
  const commitments=currentRomanticCommitments(state,npcId);
  if(!commitments.length)return{success:false,messages:[{text:'You are not currently in another relationship. Ask this person out instead.'}]};
  const gate=consumeAction(state,{policy:'relationship.milestone',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const acceptance=clamp(rel.attraction*.50+rel.score*.25+rel.compatibility*.15+clamp(npc.hiddenOpinion,0,100)*.10,5,100)/100;
  if(!rng.chance(acceptance)){
    const text=`${npc.firstName} was not interested in hooking up.`;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:1,text,npcIds:[npcId]});
    state.rngCounter=rng.counter();
    return{success:false,messages:[{text}]};
  }

  const countKey=`hookupCount:${npcId}`;
  const streak=Number(state.flags[countKey]??0)+1;
  state.flags[countKey]=streak;
  state.flags.hookups=Number(state.flags.hookups??0)+1;
  rel.score=clamp(rel.score+4);rel.attraction=clamp(rel.attraction+2);npc.hiddenOpinion=clamp(npc.hiddenOpinion+3,-100,100);
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'hookup',sentiment:4,summary:`Hooked up with ${state.character.firstName}.`,permanent:streak>=2});
  state.character.stats.happiness=clamp(state.character.stats.happiness+2);
  state.character.secondary.karma-=4;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:1,text:`You hooked up with ${npc.firstName}.`,npcIds:[npcId],relationshipDelta:4});

  const messages=[{text:`You and ${npc.firstName} hooked up.`}];
  for(const commitment of commitments){
    const partner=state.npcs[commitment.npcId];if(!partner?.alive)continue;
    if(!rng.chance(hookupDiscoveryChance(streak,commitment.type,partner)))continue;
    const oldType=commitment.type;
    const damage=Math.round(clamp(18+(streak-1)*4+(oldType==='spouse'?6:oldType==='fiance'?3:0)+(partner.traits.includes('jealous')?5:0),18,46));
    commitment.score=clamp(commitment.score-damage);
    partner.hiddenOpinion=clamp(partner.hiddenOpinion-damage*.9,-100,100);
    partner.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'infidelity_discovery',sentiment:-damage,summary:`Discovered that ${state.character.firstName} hooked up with ${npc.firstName}.`,permanent:true});
    state.flags.infidelityDiscoveries=Number(state.flags.infidelityDiscoveries??0)+1;
    state.character.secondary.stress=clamp(state.character.secondary.stress+6);
    state.character.stats.happiness=clamp(state.character.stats.happiness-5);
    const endingChance=clamp(.05+(streak-1)*.07+(100-commitment.score)*.004+(partner.traits.includes('jealous')?.10:0)+(oldType==='spouse'?.08:oldType==='fiance'?.05:0),.05,.75);
    const ended=rng.chance(endingChance);
    if(ended){
      commitment.type='ex';
      partner.maritalStatus=oldType==='spouse'?'divorced':'single';
      if(oldType==='spouse')state.flags.divorces=Number(state.flags.divorces??0)+1;
      state.character.secondary.stress=clamp(state.character.secondary.stress+4);
    }
    const falloutText=ended
      ?`${partner.firstName} found out about your hookup with ${npc.firstName} and ended your ${oldType==='spouse'?'marriage':oldType==='fiance'?'engagement':'relationship'}.`
      :`${partner.firstName} found out about your hookup with ${npc.firstName}. Your relationship took a serious hit.`;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:ended?3:2,text:falloutText,npcIds:[partner.id,npc.id],relationshipDelta:-damage});
    messages.push({text:falloutText});
  }
  state.rngCounter=rng.counter();
  return{success:true,messages};
}

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
  if(action==='hook_up')return hookUpWithNpc(state,npcId);
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
  assignNpcReproductiveSex(state,npc);
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
  if((action==='ask_out'||action==='reconcile')&&hasCurrentRomanticCommitment(state,npcId))return{success:false,messages:[{text:'You are already in a relationship with someone else.'}]};
  if((action==='propose'||action==='marry')&&hasCurrentRomanticCommitment(state,npcId))return{success:false,messages:[{text:'You already have another current romantic commitment.'}]};
  if(action==='ask_out'&&!ASK_OUT_RELATIONSHIP_TYPES.has(rel.type))return{success:false,messages:[{text:'Dating is not available from this relationship.'}]};
  if(action==='propose'&&rel.type!=='partner')return{success:false,messages:[{text:'You need to be dating before proposing.'}]};
  if(action==='marry'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'Marriage is not available in this relationship yet.'}]};
  if(action==='break_up'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'There is no dating relationship to end.'}]};
  if(action==='divorce'&&rel.type!=='spouse')return{success:false,messages:[{text:'You are not married to this person.'}]};
  if(action==='reconcile'&&rel.type!=='ex')return{success:false,messages:[{text:'Only an ex can be reconciled with.'}]};
  const gate=consumeAction(state,{policy:'relationship.milestone',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const chance=clamp(rel.score*.55+rel.compatibility*.25+rel.attraction*.2+npc.hiddenOpinion*.15,0,100)/100;
  let success=true; let newType:RelationshipType=rel.type; let text='';
  if(action==='ask_out') { success=rng.chance(chance); newType=success?'partner':rel.type; text=success?`${npc.firstName} agrees to date you.`:`${npc.firstName} does not want to date you right now.`; if(success) npc.maritalStatus='dating'; }
  if(action==='propose') {
    success=rng.chance(chance+.08);newType=success?'fiance':rel.type;text=success?`${npc.firstName} says yes.`:`${npc.firstName} is not ready to get engaged.`;if(success)npc.maritalStatus='engaged';
  }
  if(action==='marry') {success=true;newType='spouse';text=`You married ${npc.firstName} ${npc.lastName}.`;npc.maritalStatus='married';}
  if(action==='break_up'||action==='divorce') { if(!['partner','fiance','spouse'].includes(rel.type)) success=false; else {newType='ex';npc.maritalStatus=action==='divorce'?'divorced':'single';rel.score=clamp(rel.score-18);text=`You ${action==='divorce'?'divorced':'broke up with'} ${npc.firstName}.`;} }
  if(action==='reconcile') { if(rel.type!=='ex') success=false; else success=rng.chance(Math.max(.15,chance-.1)); newType=success?'partner':'ex';text=success?`You and ${npc.firstName} decided to try again.`:`${npc.firstName} does not want to reopen the relationship.`; }
  if(!success && !text) text='That relationship step is not available right now.';
  if(success){rel.type=newType;if(CURRENT_ROMANTIC_TYPES.has(newType))assignNpcReproductiveSex(state,npc);if(action==='marry')state.flags.marriages=Number(state.flags.marriages??0)+1;if(action==='reconcile')state.flags.reconciliations=Number(state.flags.reconciliations??0)+1;}
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
  if(adopt && partnerId && (!partner||!rel||!['partner','fiance','spouse'].includes(rel.type))) return {success:false,messages:[{text:'Only a current partner can be recorded as a co-parent for this adoption.'}]};
  if(!adopt && partner && partner.age<16) return {success:false,messages:[{text:"Both parents must meet the game's minimum parenting age."}]};
  if(!adopt){
    const biologicalGate=biologicalChildGate(state,partnerId);
    if(!biologicalGate.allowed)return{success:false,messages:[{text:biologicalGate.reason??'This pairing cannot try for a biological child.'}]};
  }
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
    if(partner&&!partner.childIds.includes(id))partner.childIds.push(id); state.legacy.familyTreeNpcIds.push(id);
  }
  const text=adopt?`You adopted ${count>1?`${count} children`:names[0]}.`:`${count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`}`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text,npcIds:partner?[partner.id]:undefined}); state.rngCounter=rng.counter();
  return {success:true,messages:[{text}]};
}
