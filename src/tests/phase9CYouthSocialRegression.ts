import { actionUsesThisAge } from '../core/actionEconomy';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { SHARED_EXPERIENCE_ACTIVITIES, sharedExperienceActivityById } from '../data/sharedExperiences';
import { YOUTH_SOCIAL_PLANS } from '../data/youthSocial';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { shareExperienceWithNpc } from '../systems/RelationshipSystem';
import { evaluateSharedExperience, sharedExperienceAvailability } from '../systems/SharedExperienceSystem';
import { projectYouthSocialPlans, youthSocialTargetAvailability } from '../systems/YouthSocialSystem';
import type { GameState, Npc, Relationship, RelationshipType, SocialWorld } from '../types/game';

function addNpc(state:GameState,id:string,age:number,type:RelationshipType='classmate'):{npc:Npc;rel:Relationship}{
  const npc:Npc={id,firstName:'Jamie',lastName:'Thread',age,alive:true,health:85,happiness:60,wealth:500,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['playful','loyal'],hiddenOpinion:5,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type,score:58,attraction:0,compatibility:65,yearsKnown:2};
  state.npcs[id]=npc;state.relationships.push(rel);ensureNpcLife(state,npc);return{npc,rel};
}

function youthState(seed:string,age=10,npcAge=10,type:RelationshipType='classmate'){
  const state=createNewGame({seed});state.character.age=age;state.currentYear=2040+age;state.character.stats.happiness=55;state.character.stats.health=85;
  const pair=addNpc(state,'youth-peer',npcAge,type);return{state,...pair};
}

function addSchoolMembership(state:GameState,npcId:string){
  const world:SocialWorld={id:'school-world-youth',kind:'school',name:'Everthread Community School',countryId:state.character.countryId,city:state.character.city,startedAge:6,active:true,members:[{npcId,role:'classmate',joinedAge:6,groupIds:[]}],groups:[],school:{stage:'secondary',educationKey:'youth-test',attendance:90,conduct:80,socialStanding:55,honors:0,disciplinaryActions:0,principalNpcId:npcId}};
  state.socialWorlds.push(world);
}

function clone<T>(value:T):T{return structuredClone(value);}

export function runPhase9CYouthSocialRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9C youth-social regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 youth social life must reuse established relationship/school/shared-experience state without a schema bump');
  verify(YOUTH_SOCIAL_PLANS.length===11,'02 youth social life should expose eleven curated age-aware plans rather than cosmetic duplicates');
  verify(new Set(YOUTH_SOCIAL_PLANS.map(plan=>plan.id)).size===YOUTH_SOCIAL_PLANS.length,'03 youth plan ids must be unique');
  verify(YOUTH_SOCIAL_PLANS.every(plan=>plan.minAge>=3&&plan.maxAge<=17&&plan.minAge<=plan.maxAge),'04 every youth plan must stay inside the intended childhood/teen range');
  verify(YOUTH_SOCIAL_PLANS.every(plan=>sharedExperienceActivityById[plan.activityId]?.placeIds.includes(plan.placeId)),'05 every youth plan must resolve through a canonical Phase 9B activity/place pair');
  verify(SHARED_EXPERIENCE_ACTIVITIES.length===13&&sharedExperienceActivityById.sleepover?.maxAge===17&&sharedExperienceActivityById.school_social?.maxAge===17,'06 Phase 9C should add youth-specific shared activities with explicit teen ceilings');

  const child=youthState('phase9c-child',3,3,'classmate');
  const childPlans=projectYouthSocialPlans(child.state,child.npc.id);
  verify(childPlans.length===1&&childPlans[0]?.id==='park-playdate','07 a three-year-old peer plan should be a simple park playdate rather than teen activities');
  verify(childPlans[0]?.allowed===true,'08 the youngest authored playdate must actually be executable for same-age Everthread peers');
  verify(!childPlans.some(plan=>plan.id==='arcade-games'||plan.id==='sleepover'),'09 age filtering must hide plans that are not yet appropriate rather than merely disabling a wall of future buttons');

  const preteen=youthState('phase9c-preteen',10,10,'classmate');addSchoolMembership(preteen.state,preteen.npc.id);
  const preteenBefore=JSON.stringify(preteen.state),preteenRng=preteen.state.rngCounter,preteenId=preteen.state.idCounter;
  const preteenPlans=projectYouthSocialPlans(preteen.state,preteen.npc.id);
  verify(preteenPlans.some(plan=>plan.id==='sleepover'&&plan.allowed)&&preteenPlans.some(plan=>plan.id==='arcade-games'&&plan.allowed),'10 preteen school peers should receive meaningful home and mall/game choices');
  verify(preteenPlans.some(plan=>plan.id==='mall-hangout')&&preteenPlans.some(plan=>plan.id==='diner-hangout')&&preteenPlans.some(plan=>plan.id==='school-social'&&plan.currentSchoolPeer),'11 older-child plans should broaden into independent outings plus a real current-school social event');
  verify(preteenPlans.every(plan=>plan.connection==='school_friend'&&plan.schoolPeer),'12 a real school-world classmate must stay identified as school context even though outcomes use RelationshipSystem');
  verify(JSON.stringify(preteen.state)===preteenBefore&&preteen.state.rngCounter===preteenRng&&preteen.state.idCounter===preteenId,'13 browsing youth plans must be read-only and RNG/runtime-ID neutral');

  const teen=youthState('phase9c-teen',17,17,'friend');const teenPlans=projectYouthSocialPlans(teen.state,teen.npc.id);
  verify(teenPlans.some(plan=>plan.id==='park-walk')&&teenPlans.some(plan=>plan.id==='movie-afternoon'),'14 teens should receive quieter and broader outing choices rather than child-only playdates');
  verify(!teenPlans.some(plan=>plan.id==='park-playdate'),'15 the child playdate label must age out instead of following the player into late adolescence');
  verify(teenPlans.every(plan=>plan.connection==='friend')&&!teenPlans.some(plan=>plan.id==='school-social'),'16 a generic same-age friend should remain a friend context and must not receive school-only plans without a current school link');

  const adult=youthState('phase9c-adult',18,18,'friend');
  verify(projectYouthSocialPlans(adult.state,adult.npc.id).length===0&&!youthSocialTargetAvailability(adult.state,adult.npc.id).allowed,'17 youth planner must disappear cleanly once the protagonist becomes an adult');
  verify(!sharedExperienceAvailability(adult.state,adult.npc.id,'threadwell-residential','sleepover').allowed,'18 direct engine callers must not bypass the youth-only sleepover ceiling');
  verify(evaluateSharedExperience(adult.state,adult.npc.id,'threadwell-residential','sleepover',0)===undefined,'19 pure evaluation must also reject an age-inappropriate youth-only activity');

  const teacher=youthState('phase9c-teacher',12,35,'teacher');
  verify(projectYouthSocialPlans(teacher.state,teacher.npc.id).length===0,'20 teachers must not leak into peer-oriented childhood outing controls');
  const enemy=youthState('phase9c-enemy',12,12,'enemy');
  verify(projectYouthSocialPlans(enemy.state,enemy.npc.id).length===0,'21 enemy relationships must not be presented as friendly youth plans');
  const adultFriend=youthState('phase9c-adult-friend',15,21,'friend');
  verify(projectYouthSocialPlans(adultFriend.state,adultFriend.npc.id).length===0,'22 a minor must not receive peer-plan controls for an adult non-family friend');
  const ageGap=youthState('phase9c-age-gap',10,14,'friend');
  verify(projectYouthSocialPlans(ageGap.state,ageGap.npc.id).length===0,'23 non-family peer plans must reject implausibly wide youth age gaps');

  const sibling=youthState('phase9c-sibling',12,20,'sibling');const siblingPlans=projectYouthSocialPlans(sibling.state,sibling.npc.id);
  verify(siblingPlans.length>0&&siblingPlans.every(plan=>plan.connection==='family'),'24 an older real sibling remains a valid family social target without fabricating a peer record');
  verify(siblingPlans.some(plan=>plan.id==='home-visit'&&plan.allowed),'25 an adult sibling can still share an ordinary home visit with a younger protagonist');
  verify(siblingPlans.some(plan=>plan.id==='sleepover'&&!plan.allowed),'26 youth-only activity rules must still block a sleepover when either participant is above the authored age ceiling');
  const cousin=youthState('phase9c-cousin',11,12,'cousin');
  verify(projectYouthSocialPlans(cousin.state,cousin.npc.id).some(plan=>plan.connection==='family'&&plan.allowed),'27 cousins should participate through the existing family relationship taxonomy');

  const promoted=youthState('phase9c-promoted',13,13,'friend');addSchoolMembership(promoted.state,promoted.npc.id);
  verify(projectYouthSocialPlans(promoted.state,promoted.npc.id).every(plan=>plan.connection==='school_friend'),'28 a classmate promoted to real friend must retain school context from the authoritative SocialWorld membership');
  promoted.rel.estranged=true;
  verify(projectYouthSocialPlans(promoted.state,promoted.npc.id).length===0,'29 estranged relationships must not silently surface friendly plans');

  const remote=youthState('phase9c-remote',10,10,'classmate');remote.npc.city='Elsewhere';const remotePlans=projectYouthSocialPlans(remote.state,remote.npc.id);
  verify(remotePlans.length>0&&remotePlans.every(plan=>!plan.allowed&&Boolean(plan.reason)),'30 a remote youth target should keep contextual options visible but disabled with real Phase 9B availability reasons');
  const dead=youthState('phase9c-dead',10,10,'classmate');dead.npc.alive=false;
  verify(projectYouthSocialPlans(dead.state,dead.npc.id).length===0,'31 deceased targets must not retain youth social controls');
  const stale=youthState('phase9c-stale',10,10,'classmate');delete stale.state.npcs[stale.npc.id];
  verify(projectYouthSocialPlans(stale.state,stale.npc.id).length===0,'32 stale NPC ids must fail without projection mutation');

  const commit=youthState('phase9c-commit',10,10,'classmate');addSchoolMembership(commit.state,commit.npc.id);commit.npc.preferences={version:1,likes:['games','playful','social'],dislikes:[],aversions:[]};
  const arcade=projectYouthSocialPlans(commit.state,commit.npc.id).find(plan=>plan.id==='arcade-games')!;
  const beforeScore=commit.rel.score,beforeRng=commit.state.rngCounter,beforeTimeline=commit.state.timeline.length;
  const result=shareExperienceWithNpc(commit.state,commit.npc.id,arcade.placeId,arcade.activityId);
  verify(result.success&&Boolean(result.experience),'33 a youth outing must commit through the existing RelationshipSystem shared-experience authority');
  verify(commit.state.rngCounter===beforeRng+1,'34 a committed youth outing must consume the same single gameplay-RNG draw as the certified 9B path');
  verify(commit.rel.score===Math.max(0,Math.min(100,beforeScore+result.experience!.relationshipDelta)),'35 RelationshipSystem must remain the sole owner applying the outing relationship delta');
  verify(commit.state.timeline.length===beforeTimeline+1&&commit.state.timeline.at(-1)?.npcIds?.[0]===commit.npc.id,'36 the outing must write exactly one exact-target timeline entry through the established relationship path');
  verify(actionUsesThisAge(commit.state,'social.npc.total',commit.npc.id)===1&&actionUsesThisAge(commit.state,'social.npc.action',`${commit.npc.id}:shared:${arcade.activityId}`)===1,'37 youth outings must reuse the established per-person social action economy');
  const repeat=shareExperienceWithNpc(commit.state,commit.npc.id,arcade.placeId,arcade.activityId);
  verify(!repeat.success,'38 the same youth activity cannot be rerolled repeatedly against the same person in one age');
  verify(!('youthSocial' in (commit.state as unknown as Record<string,unknown>))&&!('sharedExperiences' in (commit.state as unknown as Record<string,unknown>)),'39 Phase 9C must not create a durable youth/social outing ledger beside existing authorities');

  const deterministicA=youthState('phase9c-determinism',11,11,'friend');const deterministicB={state:clone(deterministicA.state),npcId:deterministicA.npc.id};
  const planA=projectYouthSocialPlans(deterministicA.state,deterministicA.npc.id).find(plan=>plan.id==='sleepover')!;
  const a=shareExperienceWithNpc(deterministicA.state,deterministicA.npc.id,planA.placeId,planA.activityId);
  const bPlan=projectYouthSocialPlans(deterministicB.state,deterministicB.npcId).find(plan=>plan.id==='sleepover')!;
  const b=shareExperienceWithNpc(deterministicB.state,deterministicB.npcId,bPlan.placeId,bPlan.activityId);
  verify(JSON.stringify(a)===JSON.stringify(b)&&JSON.stringify(deterministicA.state)===JSON.stringify(deterministicB.state),'40 identical seeded youth experiences must remain fully deterministic');

  return checks;
}
