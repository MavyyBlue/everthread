import { relationshipTypeLabel } from '../core/familyRelations';
import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { BottomSheet } from '../components/BottomSheet';
import { PeopleWorkspace } from '../components/PeopleWorkspace';
import { gameEngine } from '../stores/gameStore';
import { actionAllowed } from '../core/actionEconomy';
import { canReportCoworker, workplaceRoleForNpc } from '../systems/WorkplaceSystem';
import { npcLifeSummary } from '../systems/NpcLifeSystem';
import { canAskNpcOnDate, canBecomePartners, canHookUpWithNpc, canReconcileWithNpc } from '../systems/RelationshipSystem';
import { biologicalChildGate, npcReproductiveSex } from '../systems/ReproductionSystem';
import { npcGender, npcGenderLabel, npcReproductiveSexLabel } from '../systems/NpcIdentitySystem';
import { orientationLabel } from '../systems/NpcOrientationSystem';
import { npcCareerProjection } from '../systems/CareerIdentitySystem';
import { formatMoney } from '../core/format';
import { projectKnownNpcPreferences } from '../systems/NpcPreferenceSystem';
import { projectYouthSocialPlans, type YouthSocialPlan } from '../systems/YouthSocialSystem';
import type { SharedExperienceResult } from '../types/sharedExperiences';
import { projectRomanticDateOptions, romanticDateTargetAvailability } from '../systems/RomanticDateSystem';
import type { RomanticDateOption } from '../types/romanticDates';
import type { ActionResultHandler } from '../core/actionVfx';
import { projectPersonalGiftOptions } from '../systems/GiftSystem';
import type { PersonalGiftEvaluation } from '../types/gifts';

const CURRENT_ROMANTIC_TYPES=new Set<GameState['relationships'][number]['type']>(['partner','fiance','spouse']);

export function PeopleScreen({state,onResult,onOpenPlayerProfile}:{state:GameState;onResult:ActionResultHandler;onOpenPlayerProfile:()=>void}){
  const[selectedNpcId,setSelectedNpcId]=useState<string>();
  const[lastSharedExperience,setLastSharedExperience]=useState<SharedExperienceResult>();
  const[lastRomanticDate,setLastRomanticDate]=useState<SharedExperienceResult>();
  const[lastGift,setLastGift]=useState<PersonalGiftEvaluation>();
  const[giftPickerOpen,setGiftPickerOpen]=useState(false);
  const selected=selectedNpcId?state.relationships.find(r=>r.npcId===selectedNpcId):undefined;
  const npc=selected?state.npcs[selected.npcId]:undefined;
  const npcWorlds=npc?state.socialWorlds.filter(world=>world.members.some(member=>member.npcId===npc.id)):[];
  const currentWorkRole=npc?workplaceRoleForNpc(state,npc.id):undefined;
  const lifeSummary=npc?npcLifeSummary(npc):undefined;
  const careerProjection=npc?npcCareerProjection(state,npc):undefined;
  const knownPreferences=npc?projectKnownNpcPreferences(state,npc.id):[];
  const youthPlans=npc?projectYouthSocialPlans(state,npc.id):[];
  const youthExperience=lastSharedExperience?.npcId===npc?.id?lastSharedExperience:undefined;
  const dateOptions=npc?projectRomanticDateOptions(state,npc.id):[];
  const dateTarget=npc?romanticDateTargetAvailability(state,npc.id):undefined;
  const pendingDate=Boolean(selected?.romance?.pendingDate);
  const dateExperience=lastRomanticDate?.npcId===npc?.id?lastRomanticDate:undefined;
  const giftOptions=npc?projectPersonalGiftOptions(state,npc.id):[];
  const giftExperience=lastGift?.npcId===npc?.id?lastGift:undefined;
  const currentPartner=state.relationships.find(r=>CURRENT_ROMANTIC_TYPES.has(r.type)&&!r.estranged&&state.npcs[r.npcId]?.alive);
  const expecting=state.familyPlanning.pregnancy;
  const canTryChild=actionAllowed(state,{policy:'family.child_attempt'});
  const canAdopt=actionAllowed(state,{policy:'family.adoption'});
  const newbornPresent=state.relationships.some(r=>r.type==='child'&&state.npcs[r.npcId]?.alive&&state.npcs[r.npcId]?.age===0);
  const selectedIsCurrentPartner=Boolean(selected&&!selected.estranged&&npc?.alive&&CURRENT_ROMANTIC_TYPES.has(selected.type));
  const selectedFamilyGate=selectedIsCurrentPartner&&npc?biologicalChildGate(state,npc.id):undefined;
  const selectedGender=npc?npcGender(state,npc):undefined;
  const feedback=(result:EngineResult)=>onResult(result,{derive:true});
  const shareYouthExperience=(plan:YouthSocialPlan)=>{const result=gameEngine.shareExperience(plan.npcId,plan.placeId,plan.activityId);if(result.experience)setLastSharedExperience(result.experience);feedback(result);};
  const completeDate=(option:RomanticDateOption)=>{const result=gameEngine.romanticDate(npc!.id,option.placeId,option.activityId);if(result.experience)setLastRomanticDate(result.experience);feedback(result);};
  const giveGift=(instanceId:string)=>{const result=gameEngine.giftPersonalItem(npc!.id,instanceId);if(result.gift)setLastGift(result.gift);if(result.success)setGiftPickerOpen(false);feedback(result);};

  const personSheet=<BottomSheet open={!!selected} title={npc?`${npc.firstName} ${npc.lastName}`:'Relationship'} onClose={()=>{setSelectedNpcId(undefined);setGiftPickerOpen(false);}}>{selected&&npc&&<>
    <div className="sheet-stat-grid">
      <div><small>Relationship</small><strong>{Math.round(selected.score)}</strong></div>
      <div><small>Compatibility</small><strong>{Math.round(selected.compatibility)}</strong></div>
      <div><small>Age</small><strong>{npc.age}</strong></div>
      <div><small>Marriage</small><strong>{npc.maritalStatus.charAt(0).toUpperCase()+npc.maritalStatus.slice(1)}</strong></div>
      <div><small>Gender</small><strong>{selectedGender?npcGenderLabel(selectedGender):'Unknown'}</strong></div>
      {npc.age>=14&&<div><small>Orientation</small><strong>{orientationLabel(npc.sexuality)}</strong></div>}
    </div>
    <div className="sheet-section"><h3>Interests</h3>{knownPreferences.length?<div className="npc-preference-list">{knownPreferences.map(pref=><span key={pref.tag} className={`npc-preference npc-preference--${pref.level}`}>{pref.level==='like'?'Likes':pref.level==='neutral'?'Neutral':pref.level==='dislike'?'Dislikes':'Avoids'} · {pref.label}</span>)}</div>:<p className="muted">You haven't learned much about their tastes yet.</p>}</div>
    {npc.alive&&<div className="sheet-section personal-gift-section"><div className="section-heading"><div><p className="eyebrow">Something you own</p><h3>Give a gift</h3></div><span>{giftOptions.length}</span></div><p className="muted">Choose an exact item from your personal inventory. Their reaction depends on who they are, not the price tag.</p>{giftOptions.length?giftPickerOpen?<><div className="personal-gift-grid">{giftOptions.map(option=><button key={option.instanceId} disabled={!option.allowed} onClick={()=>giveGift(option.instanceId)}><strong>{option.itemName}</strong><small>Acquired age {option.acquiredAge}</small><em>{option.allowed?option.description:option.reason??'Unavailable right now.'}</em></button>)}</div><button className="muted-action full-button" onClick={()=>setGiftPickerOpen(false)}>Close gifts</button></>:<button className="full-button" onClick={()=>setGiftPickerOpen(true)}>Choose from inventory</button>:<><p className="muted">Your personal inventory is empty. Pick something up around Everthread before choosing a gift.</p><button className="muted-action full-button" onClick={()=>{setSelectedNpcId(undefined);setGiftPickerOpen(false);onOpenPlayerProfile();}}>Open Inventory</button></>}{giftExperience&&<div className={`personal-gift-result personal-gift-result--${giftExperience.band}`}><div className="section-heading"><div><small>Gift reaction</small><strong>{giftExperience.itemName}</strong></div><b>{giftExperience.approval}/100</b></div><div className="personal-gift-meter" role="progressbar" aria-label="Gift approval" aria-valuemin={0} aria-valuemax={100} aria-valuenow={giftExperience.approval}><span style={{width:`${giftExperience.approval}%`}}/></div><p>{giftExperience.prose}</p></div>}</div>}
    {youthPlans.length>0&&<div className="sheet-section youth-social-section"><div className="section-heading"><div><p className="eyebrow">Growing up together</p><h3>Spend time together</h3></div><span>{youthPlans.filter(plan=>plan.allowed).length} available</span></div><p className="muted">{youthPlans[0]?.connection==='school_friend'?'Make plans with a real school friend or classmate.':youthPlans[0]?.connection==='family'?'Make a childhood memory with family.':'Choose something that fits both of you.'}</p><div className="youth-social-grid">{youthPlans.map(plan=><button key={plan.id} disabled={!plan.allowed} onClick={()=>shareYouthExperience(plan)}><strong>{plan.label}</strong><small>{plan.placeLabel}</small><em>{plan.allowed?plan.description:plan.reason??'Unavailable right now.'}</em></button>)}</div>{youthExperience&&<div className={`youth-experience-result youth-experience-result--${youthExperience.band}`}><div className="section-heading"><div><small>Last outing</small><strong>{youthExperience.activityLabel}</strong></div><b>{youthExperience.approval}/100</b></div><div className="youth-approval-meter" role="progressbar" aria-label="Outing approval" aria-valuemin={0} aria-valuemax={100} aria-valuenow={youthExperience.approval}><span style={{width:`${youthExperience.approval}%`}}/></div><p>{youthExperience.prose}</p></div>}</div>}
    <div className="action-grid">{['conversation','compliment','spend_time','apologize','prank','argue','insult'].map(a=><button key={a} disabled={!npc.alive||!actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:${a}`}])} onClick={()=>feedback(gameEngine.interactWithCharacter(npc.id,a))}>{a.replace('_',' ')}</button>)}</div>
    {npc.alive&&(canAskNpcOnDate(state,npc.id)||dateOptions.length>0||pendingDate||Boolean(selected.romance?.dateHistory?.length))&&<div className="sheet-section romantic-date-section"><div className="section-heading"><div><p className="eyebrow">Romantic momentum</p><h3>Dating</h3></div></div>{dateOptions.length>0?<><p className="muted">{npc.firstName} said yes. Choose where the date happens.</p><div className="romantic-date-grid">{dateOptions.map(option=><button key={option.id} disabled={!option.allowed} onClick={()=>completeDate(option)}><strong>{option.label}</strong><small>{option.placeLabel}</small><em>{option.allowed?option.description:option.reason??'Unavailable right now.'}</em></button>)}</div><button className="muted-action full-button" onClick={()=>feedback(gameEngine.cancelDate(npc.id))}>Cancel date plans</button></>:pendingDate?<><p className="muted">{dateTarget?.reason??'Your accepted date is still saved, but there is nowhere valid to go together right now.'}</p><button className="muted-action full-button" onClick={()=>feedback(gameEngine.cancelDate(npc.id))}>Cancel date plans</button></>:canAskNpcOnDate(state,npc.id)?<button className="full-button" disabled={!actionAllowed(state,{policy:'relationship.date.invite',target:npc.id})} onClick={()=>feedback(gameEngine.askOnDate(npc.id))}>Ask on Date</button>:null}{dateExperience&&<div className={`romantic-date-result romantic-date-result--${dateExperience.band}`}><div className="section-heading"><div><small>Last date</small><strong>{dateExperience.activityLabel}</strong></div><b>{dateExperience.approval}/100</b></div><div className="romantic-date-meter" role="progressbar" aria-label="Date approval" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dateExperience.approval}><span style={{width:`${dateExperience.approval}%`}}/></div><p>{dateExperience.prose}</p></div>}{selected.romance?.dateHistory?.length&&!canBecomePartners(state,npc.id)&&!selected.romance.pendingDate?<p className="muted">A few genuinely good dates can build toward making things official.</p>:null}</div>}
    {npc.alive&&<div className="sheet-section"><h3>Relationship</h3><div className="action-grid">{canBecomePartners(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'become_partners'))}>Become Partners</button>}{canHookUpWithNpc(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.interactWithCharacter(npc.id,'hook_up'))}>Hook Up</button>}{selected.type==='partner'&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'propose'))}>Propose</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'marry'))}>Marry</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'break_up'))}>Break up</button>}{selected.type==='spouse'&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'divorce'))}>Divorce</button>}{canReconcileWithNpc(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>feedback(gameEngine.relationshipAction(npc.id,'reconcile'))}>Reconcile</button>}</div></div>}
    {selectedIsCurrentPartner&&<div className="sheet-section family-planning-section">
      <h3>Family Planning</h3>
      <p className="muted">Reproductive sex: {npcReproductiveSexLabel(npcReproductiveSex(state,npc))}.</p>
      <p className="memory">{state.character.age<18||npc.age<18
        ?'Family planning becomes available when both partners are adults.'
        :expecting?.partnerId===npc.id
          ?`You and ${npc.firstName} are expecting ${expecting.expectedChildren===2?'twins':expecting.expectedChildren===3?'triplets':'a child'} next year.`
          :selectedFamilyGate?.allowed
            ?selectedFamilyGate.ageFactor!==undefined&&selectedFamilyGate.ageFactor<.15
              ?'Biological conception is still possible, but reproductive age now makes it very unlikely. Adoption remains available.'
              :selectedFamilyGate.ageFactor!==undefined&&selectedFamilyGate.ageFactor<.55
                ?'Biological conception is still possible, but reproductive age is reducing the odds. Adoption remains available.'
                :'You can try for a biological child together or grow your family through adoption.'
            :selectedFamilyGate?.reason??'Adoption remains available for this relationship.'}</p>
      <div className="action-grid">
        <button className={!selectedFamilyGate?.allowed?'muted-action':''} onClick={()=>feedback(gameEngine.haveChild(npc.id,false))} disabled={state.character.age<18||npc.age<18||!selectedFamilyGate?.allowed||!!expecting||!canTryChild||newbornPresent}>{expecting?.partnerId===npc.id?'Expecting':!canTryChild?'Tried this year':'Try for a Child'}</button>
        <button onClick={()=>feedback(gameEngine.haveChild(npc.id,true))} disabled={state.character.age<18||npc.age<18||!!expecting||!canAdopt||newbornPresent}>{!canAdopt?'Adopted this year':'Adopt Child'}</button>
      </div>
    </div>}
    <div className="sheet-section"><h3>Connections</h3><p className="muted">To you: {relationshipTypeLabel(selected.type)}.</p>{npc.partnerId&&state.npcs[npc.partnerId]&&<p className="memory">Partner link: {state.npcs[npc.partnerId]!.firstName} {state.npcs[npc.partnerId]!.lastName}</p>}{npc.parentIds.map(id=>state.npcs[id]).filter(Boolean).map(parent=><p className="memory" key={`parent-${parent!.id}`}>Parent: {parent!.firstName} {parent!.lastName}</p>)}{npc.childIds.map(id=>state.npcs[id]).filter(Boolean).map(child=><p className="memory" key={`child-${child!.id}`}>Child: {child!.firstName} {child!.lastName}</p>)}</div>
    {lifeSummary&&<div className="sheet-section"><h3>Their life</h3><div className="sheet-stat-grid"><div><small>Education</small><strong>{lifeSummary.education}</strong></div><div><small>Career</small><strong>{careerProjection?.career??lifeSummary.career}</strong></div><div><small>Home</small><strong>{lifeSummary.housing}</strong></div><div><small>{careerProjection?.specialCareer?'Est. income':'Income'}</small><strong>{formatMoney(careerProjection?.annualIncome??lifeSummary.annualIncome)}/yr</strong></div></div><p className="memory">Finances: {formatMoney(npc.wealth)} liquid · {formatMoney(lifeSummary.propertyValue)} property · {formatMoney(lifeSummary.businessValue)} businesses · {formatMoney(lifeSummary.debt)} debt · est. net worth {formatMoney(lifeSummary.netWorth)}.</p>{(lifeSummary.properties.length>0||lifeSummary.businesses.length>0)&&<div className="stack">{lifeSummary.properties.map(property=><div className="owned-card" key={`npc-property-${property.id}`}><div><strong>{property.name}</strong><small>{property.location} · {formatMoney(property.value)} value · {formatMoney(property.equity)} equity</small></div></div>)}{lifeSummary.businesses.map(business=><div className="owned-card" key={`npc-business-${business.id}`}><div><strong>{business.name}</strong><small>{formatMoney(business.value)} valuation · {business.annualProfit>=0?'+':''}{formatMoney(business.annualProfit)} last-year profit</small></div></div>)}</div>}<p className="memory">Health: {lifeSummary.conditions.length?lifeSummary.conditions.join(', '):'no major recorded conditions'}.</p><p className="memory">Public/legal: fame {Math.round(lifeSummary.fame)} · {lifeSummary.followers.toLocaleString()} followers · {lifeSummary.legalIncidents} legal incident{lifeSummary.legalIncidents===1?'':'s'}{lifeSummary.sentenceRemaining?` · ${lifeSummary.sentenceRemaining} year${lifeSummary.sentenceRemaining===1?'':'s'} remaining in custody`:''}.</p>{lifeSummary.moves>0&&<p className="memory">Household: {lifeSummary.moves} move{lifeSummary.moves===1?'':'s'} recorded.</p>}</div>}
    {npcWorlds.length>0&&<div className="sheet-section"><h3>Shared worlds</h3>{npcWorlds.slice().sort((a,b)=>b.startedAge-a.startedAge).map(world=>{const member=world.members.find(item=>item.npcId===npc.id);return <p className="memory" key={world.id}><strong>{world.name}</strong> · {member?.role??'member'} · {world.active?'current':`ages ${world.startedAge}–${world.endedAge??state.character.age}`}</p>})}</div>}
    {currentWorkRole?.world.active&&['coworker','direct_report'].includes(currentWorkRole.role)&&<div className="sheet-section"><h3>Workplace</h3><p className="muted">This person is part of your current workplace at {currentWorkRole.world.name}. Formal concerns are limited and can affect team tension, your manager relationship, and this coworker.</p><button className="danger-soft full-button" disabled={!canReportCoworker(state,npc.id)} onClick={()=>feedback(gameEngine.reportCoworker(npc.id))}>Raise work concern</button></div>}
    <div className="sheet-section"><h3>Memories</h3>{npc.memories.slice(-5).reverse().map(m=><p className="memory" key={m.id}>{m.summary}</p>)}{!npc.memories.length&&<p className="muted">No major memories yet.</p>}</div>
  </>}</BottomSheet>;

  const floatingActions=state.character.age>=18&&!currentPartner
    ?<button disabled={!!expecting||!canAdopt||newbornPresent} onClick={()=>feedback(gameEngine.haveChild(undefined,true))}>{!canAdopt?'Adopted this year':'Adopt Child'}</button>
    :undefined;

  return <main className="screen people-workspace-screen">
    <PeopleWorkspace state={state} revision={gameEngine.getRevision()} onSelect={id=>{setSelectedNpcId(id);setGiftPickerOpen(false);}} onSelectPlayer={onOpenPlayerProfile} floatingActions={floatingActions}/>
    {personSheet}
  </main>;
}
