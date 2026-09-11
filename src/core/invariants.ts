import type { GameState, SocialWorld } from '../types/game';
import { clamp } from './math';
import { NPC_ASSET_LIMITS } from '../data/npcAssetRules';

const PHASE4_SPECIAL_WORLD_KINDS = ['acting','music','sports','combat','military','politics','modeling','racing','directing'] as const;
type Phase4SpecialWorldKind = typeof PHASE4_SPECIAL_WORLD_KINDS[number];
const SUPPLEMENTAL_WORLD_KINDS = new Set<Phase4SpecialWorldKind>(['combat','military','politics']);

type Track = Record<string, number | string | boolean>;

function specialWorldKind(world:SocialWorld):Phase4SpecialWorldKind|undefined {
  if(world.kind!=='organization')return undefined;
  return PHASE4_SPECIAL_WORLD_KINDS.find(kind=>world.id.startsWith(`special-${kind}-`));
}

function specialTrack(state:GameState,kind:Phase4SpecialWorldKind):Track|undefined {
  return state.specialCareers[kind] as Track|undefined;
}

function supplementalPathOwnsWorld(state:GameState,kind:Phase4SpecialWorldKind){
  const career=specialTrack(state,kind);
  if(!career||career.leftPath===true)return false;
  if(kind==='politics')return typeof career.office==='number'&&Number(career.office)>0;
  if(kind==='combat'||kind==='military')return career.active===true;
  return true;
}

function archiveWorld(world:SocialWorld,age:number){
  world.active=false;
  world.endedAge??=Math.max(world.startedAge,age);
  for(const member of world.members)member.leftAge??=world.endedAge;
}

function preferredWorldId(state:GameState,kind:Phase4SpecialWorldKind,active:SocialWorld[]){
  const career=specialTrack(state,kind);
  const candidates=['currentProjectWorldId','currentCampaignWorldId','currentSeasonWorldId','worldId']
    .map(key=>career?.[key])
    .filter((value):value is string=>typeof value==='string'&&value.length>0);
  return candidates.find(id=>active.some(world=>world.id===id));
}

/**
 * Repairs structural Career World inconsistencies that can otherwise compound across long saves.
 * It intentionally does not invent career outcomes: it only reconciles duplicated/stale affiliations,
 * bounded group values, and impossible active-world ownership.
 */
function normalizePhase4CareerWorlds(state:GameState){
  const phase4Worlds=state.socialWorlds.filter(world=>Boolean(specialWorldKind(world)));

  for(const world of phase4Worlds){
    // Keep one member record per NPC while preserving every group link carried by duplicate legacy rows.
    const memberByNpc=new Map<string,SocialWorld['members'][number]>();
    const members:SocialWorld['members']=[];
    for(const member of world.members){
      if(!state.npcs[member.npcId])continue;
      member.groupIds=[...new Set(member.groupIds??[])];
      const existing=memberByNpc.get(member.npcId);
      if(!existing){memberByNpc.set(member.npcId,member);members.push(member);continue;}
      existing.groupIds=[...new Set([...existing.groupIds,...member.groupIds])];
      existing.joinedAge=Math.min(existing.joinedAge,member.joinedAge);
      if(member.role==='leader')existing.role='leader';
      if(existing.leftAge===undefined||member.leftAge===undefined)existing.leftAge=undefined;
      else existing.leftAge=Math.max(existing.leftAge,member.leftAge);
    }
    world.members=members;

    const groupById=new Map<string,SocialWorld['groups'][number]>();
    const groups:SocialWorld['groups']=[];
    for(const group of world.groups){
      const existing=groupById.get(group.id);
      if(existing){existing.memberNpcIds=[...new Set([...(existing.memberNpcIds??[]),...(group.memberNpcIds??[])])];continue;}
      groupById.set(group.id,group);groups.push(group);
    }
    world.groups=groups;
    for(const group of world.groups){
      group.prestige=Number.isFinite(group.prestige)?clamp(group.prestige):50;
      group.memberNpcIds=[...new Set((group.memberNpcIds??[]).filter(id=>memberByNpc.has(id)&&Boolean(state.npcs[id])))];
    }
    for(const member of world.members){
      member.groupIds=member.groupIds.filter(id=>groupById.has(id));
      for(const groupId of member.groupIds){const group=groupById.get(groupId)!;if(!group.memberNpcIds.includes(member.npcId))group.memberNpcIds.push(member.npcId);}
    }
    for(const group of world.groups){
      for(const npcId of group.memberNpcIds){const member=memberByNpc.get(npcId);if(member&&!member.groupIds.includes(group.id))member.groupIds.push(group.id);}
    }

    if(world.active&&world.endedAge!==undefined)delete world.endedAge;
    if(!world.active){
      if(world.endedAge===undefined){
        const knownEnds=world.members.map(member=>member.leftAge).filter((value):value is number=>typeof value==='number');
        world.endedAge=Math.max(world.startedAge,...knownEnds);
      }
      for(const member of world.members)member.leftAge??=world.endedAge;
    }
  }

  for(const kind of PHASE4_SPECIAL_WORLD_KINDS){
    const worlds=phase4Worlds.filter(world=>specialWorldKind(world)===kind);
    const active=worlds.filter(world=>world.active);
    if(SUPPLEMENTAL_WORLD_KINDS.has(kind)&&!supplementalPathOwnsWorld(state,kind)){
      for(const world of active)archiveWorld(world,state.character.age);
      continue;
    }
    if(active.length<=1)continue;
    const preferred=preferredWorldId(state,kind,active);
    const keep=preferred?active.find(world=>world.id===preferred):active.slice().sort((a,b)=>a.startedAge-b.startedAge||state.socialWorlds.indexOf(a)-state.socialWorlds.indexOf(b)).at(-1);
    for(const world of active)if(world!==keep)archiveWorld(world,state.character.age);
  }
}

export function enforceStateInvariants(state: GameState): GameState {
  state.character.age = Math.max(0, Math.floor(state.character.age));
  state.character.stats.health = clamp(state.character.stats.health);
  state.character.stats.happiness = clamp(state.character.stats.happiness);
  state.character.stats.intelligence = clamp(state.character.stats.intelligence);
  state.character.stats.appearance = clamp(state.character.stats.appearance);
  for (const [key, value] of Object.entries(state.character.secondary)) {
    if (key === 'karma') continue;
    (state.character.secondary as unknown as Record<string, number>)[key] = clamp(value);
  }
  state.finances.cash = Number.isFinite(state.finances.cash) ? state.finances.cash : 0;
  state.legal.sentenceRemaining = Math.max(0, state.legal.sentenceRemaining);
  state.fame.fame = clamp(state.fame.fame);
  state.fame.publicReputation = clamp(state.fame.publicReputation);

  const spouseRelations = state.relationships.filter(r => r.type === 'spouse' && !r.estranged);
  if (spouseRelations.length > 1) {
    for (const duplicate of spouseRelations.slice(1)) duplicate.type = 'ex';
  }

  for (const rel of state.relationships) {
    rel.score = clamp(rel.score);
    rel.attraction = clamp(rel.attraction);
    rel.compatibility = clamp(rel.compatibility);
    if (!state.npcs[rel.npcId]) rel.estranged = true;
  }

  const npcPropertyIds=new Set<string>();
  const npcBusinessIds=new Set<string>();
  for (const npc of Object.values(state.npcs)) {
    npc.age = Math.max(0, Math.floor(npc.age));
    npc.health = clamp(npc.health);
    npc.happiness = clamp(npc.happiness);
    npc.fertility = clamp(npc.fertility);
    npc.hiddenOpinion = clamp(npc.hiddenOpinion, -100, 100);
    npc.wealth = Math.max(0, Number.isFinite(npc.wealth) ? Math.round(npc.wealth) : 0);
    npc.assetPortfolio ??= {properties:[],businesses:[]};

    const boundedProperties=[];
    for(const property of npc.assetPortfolio.properties??[]){
      if(!property?.id||npcPropertyIds.has(property.id))continue;
      property.purchasePrice=Math.max(0,Number.isFinite(property.purchasePrice)?property.purchasePrice:0);
      property.marketValue=Math.max(0,Number.isFinite(property.marketValue)?property.marketValue:0);
      property.mortgageBalance=Math.max(0,Math.min(property.marketValue,Number.isFinite(property.mortgageBalance)?property.mortgageBalance:0));
      property.condition=clamp(property.condition);property.propertyAge=Math.max(0,Math.floor(property.propertyAge??0));property.acquiredAge=Math.max(0,Math.min(npc.age,Math.floor(property.acquiredAge??npc.age)));
      npcPropertyIds.add(property.id);
      if(boundedProperties.length<NPC_ASSET_LIMITS.portfolioProperties)boundedProperties.push(property);
      else npc.wealth+=Math.max(0,Math.round(property.marketValue-property.mortgageBalance));
    }
    npc.assetPortfolio.properties=boundedProperties;

    const boundedBusinesses=[];
    for(const business of npc.assetPortfolio.businesses??[]){
      if(!business?.id||npcBusinessIds.has(business.id))continue;
      business.valuation=Math.max(0,Number.isFinite(business.valuation)?business.valuation:0);business.annualProfit=Number.isFinite(business.annualProfit)?business.annualProfit:0;business.employees=Math.max(0,Math.floor(business.employees??0));business.reputation=clamp(business.reputation);business.foundedYear=Math.max(1900,Math.floor(business.foundedYear??state.currentYear));business.acquiredAge=Math.max(0,Math.min(npc.age,Math.floor(business.acquiredAge??npc.age)));business.active=Boolean(business.active);
      npcBusinessIds.add(business.id);
      if(boundedBusinesses.length<NPC_ASSET_LIMITS.portfolioBusinesses)boundedBusinesses.push(business);
      else if(business.active)npc.wealth+=Math.max(0,Math.round(business.valuation));
    }
    npc.assetPortfolio.businesses=boundedBusinesses;

    if(npc.inheritanceTrust){
      const trust=npc.inheritanceTrust;trust.value=Math.max(0,Number.isFinite(trust.value)?trust.value:0);let liquid=Math.max(0,Number.isFinite(trust.liquidValue)?trust.liquidValue!:(Array.isArray(trust.properties)&&trust.properties.length||Array.isArray(trust.businesses)&&trust.businesses.length?0:trust.value));
      const trustProperties=[];
      for(const property of Array.isArray(trust.properties)?trust.properties:[]){
        if(!property?.id||npcPropertyIds.has(property.id))continue;
        property.purchasePrice=Math.max(0,Number.isFinite(property.purchasePrice)?property.purchasePrice:0);property.marketValue=Math.max(0,Number.isFinite(property.marketValue)?property.marketValue:0);property.mortgageBalance=Math.max(0,Math.min(property.marketValue,Number.isFinite(property.mortgageBalance)?property.mortgageBalance:0));property.condition=clamp(property.condition);property.propertyAge=Math.max(0,Math.floor(property.propertyAge??0));property.acquiredAge=Math.max(0,Math.min(npc.age,Math.floor(property.acquiredAge??npc.age)));
        npcPropertyIds.add(property.id);
        if(trustProperties.length<NPC_ASSET_LIMITS.portfolioProperties)trustProperties.push(property);else liquid+=Math.max(0,Math.round(property.marketValue-property.mortgageBalance));
      }
      const trustBusinesses=[];
      for(const business of Array.isArray(trust.businesses)?trust.businesses:[]){
        if(!business?.id||npcBusinessIds.has(business.id))continue;
        business.valuation=Math.max(0,Number.isFinite(business.valuation)?business.valuation:0);business.annualProfit=Number.isFinite(business.annualProfit)?business.annualProfit:0;business.employees=Math.max(0,Math.floor(business.employees??0));business.reputation=clamp(business.reputation);business.foundedYear=Math.max(1900,Math.floor(business.foundedYear??state.currentYear));business.acquiredAge=Math.max(0,Math.min(npc.age,Math.floor(business.acquiredAge??npc.age)));business.active=Boolean(business.active);
        npcBusinessIds.add(business.id);
        if(trustBusinesses.length<NPC_ASSET_LIMITS.portfolioBusinesses)trustBusinesses.push(business);else if(business.active)liquid+=Math.max(0,Math.round(business.valuation));
      }
      trust.properties=trustProperties;trust.businesses=trustBusinesses;trust.liquidValue=Math.max(0,Math.round(liquid));
      const represented=trust.liquidValue+trustProperties.reduce((sum,property)=>sum+Math.max(0,property.marketValue-property.mortgageBalance),0)+trustBusinesses.reduce((sum,business)=>sum+(business.active?business.valuation:0),0);trust.value=Math.max(trust.value,Math.round(represented));
    }
    if (npc.life) {
      npc.life.aptitude = clamp(npc.life.aptitude);
      npc.life.education.performance = clamp(npc.life.education.performance);
      npc.life.finance.annualIncome = Math.max(0, Number.isFinite(npc.life.finance.annualIncome) ? npc.life.finance.annualIncome : 0);
      npc.life.finance.debt = Math.max(0, Number.isFinite(npc.life.finance.debt) ? npc.life.finance.debt : 0);
      npc.life.finance.propertyValue = npc.assetPortfolio.properties.reduce((sum,property)=>sum+property.marketValue,0);
      npc.life.finance.creditStress = clamp(npc.life.finance.creditStress);
      npc.life.health.fitness = clamp(npc.life.health.fitness);
      npc.life.health.wellness = clamp(npc.life.health.wellness);
      npc.life.health.conditions = (npc.life.health.conditions ?? []).slice(-4).map(condition => ({...condition,severity:clamp(condition.severity),years:Math.max(0,Math.floor(condition.years))}));
      npc.life.legal.incidents = (npc.life.legal.incidents ?? []).slice(-8);
      npc.life.legal.sentenceRemaining = Math.max(0, Math.floor(npc.life.legal.sentenceRemaining));
      npc.life.legal.recordSeverity = clamp(npc.life.legal.recordSeverity);
      npc.life.publicLife.fame = clamp(npc.life.publicLife.fame);
      npc.life.publicLife.reputation = clamp(npc.life.publicLife.reputation);
      npc.life.publicLife.followers = Math.max(0,Math.floor(npc.life.publicLife.followers));
      npc.life.publicLife.scandals = Math.max(0,Math.floor(npc.life.publicLife.scandals));
      npc.life.household.moves = Math.max(0,Math.floor(npc.life.household.moves));
      npc.life.household.dependents = Math.max(0,Math.floor(npc.life.household.dependents));
      npc.imprisoned = npc.life.legal.sentenceRemaining > 0;
      npc.famous = npc.life.publicLife.fame >= 25;
    }
    if (!npc.alive) { npc.imprisoned = false; npc.partnerId = undefined; if(npc.life) npc.life.legal.sentenceRemaining = 0; }
  }
  state.socialWorlds ??= [];
  state.employment.partTimeJobs ??= [];
  state.employment.partTimeHistory ??= [];
  const activeSchoolWorlds = state.socialWorlds.filter(world => world.kind === 'school' && world.active);
  if (activeSchoolWorlds.length > 1) {
    const keep = activeSchoolWorlds.slice().sort((a,b)=>b.startedAge-a.startedAge)[0];
    for (const world of activeSchoolWorlds) if (world !== keep) { world.active = false; world.endedAge ??= state.character.age; }
  }
  for (const world of state.socialWorlds) {
    world.members = (world.members ?? []).filter(member => Boolean(state.npcs[member.npcId]));
    world.groups ??= [];
    for (const group of world.groups) {
      group.memberNpcIds = (group.memberNpcIds ?? []).filter(id => Boolean(state.npcs[id]));
      group.prestige = Number.isFinite(group.prestige) ? clamp(group.prestige) : 50;
    }
    if (world.school) {
      world.school.attendance = clamp(world.school.attendance);
      world.school.conduct = clamp(world.school.conduct);
      world.school.socialStanding = clamp(world.school.socialStanding);
      world.school.honors = Math.max(0,Math.floor(world.school.honors));
      world.school.disciplinaryActions = Math.max(0,Math.floor(world.school.disciplinaryActions));
    }
    if (world.workplace) {
      world.workplace.morale = clamp(world.workplace.morale);
      world.workplace.culture = clamp(world.workplace.culture);
      world.workplace.tension = clamp(world.workplace.tension);
      world.workplace.reputation = clamp(world.workplace.reputation);
      world.workplace.layoffs = Math.max(0,Math.floor(world.workplace.layoffs));
      world.workplace.disputes = Math.max(0,Math.floor(world.workplace.disputes));
      if (world.workplace.managerNpcId && !state.npcs[world.workplace.managerNpcId]) world.workplace.managerNpcId = undefined;
    }
  }
  normalizePhase4CareerWorlds(state);

  for (const npc of Object.values(state.npcs)) {
    if (!npc.partnerId) continue;
    const partner = state.npcs[npc.partnerId];
    if (!partner?.alive || partner.id === npc.id) { npc.partnerId = undefined; continue; }
    if (!partner.partnerId) partner.partnerId = npc.id;
    else if (partner.partnerId !== npc.id) npc.partnerId = undefined;
  }

  return state;
}

export function validateState(state: GameState): string[] {
  const errors: string[] = [];
  if (!state.character?.id) errors.push('Missing character id');
  if (state.character.age < 0) errors.push('Negative player age');
  if (state.saveVersion < 1) errors.push('Invalid save version');
  const spouses = state.relationships.filter(r => r.type === 'spouse' && !r.estranged);
  if (spouses.length > 1) errors.push('Multiple active spouses');
  if (state.relationships.some(r => !state.npcs[r.npcId])) errors.push('Relationship references missing NPC');
  if (state.legal.sentenceRemaining < 0) errors.push('Negative prison sentence');
  if (state.timeline.some(entry => entry.age < 0)) errors.push('Timeline contains negative age');
  const seenNpcPropertyIds=new Set<string>();const seenNpcBusinessIds=new Set<string>();
  for (const npc of Object.values(state.npcs)) {
    if (npc.alive && npc.health <= 0) errors.push(`NPC ${npc.id} is alive with terminal health`);
    if (!npc.life) errors.push(`NPC ${npc.id} is missing life state`);
    else {
      if (npc.life.finance.debt < 0 || npc.life.finance.propertyValue < 0 || npc.life.finance.annualIncome < 0) errors.push(`NPC ${npc.id} has invalid finances`);
      if (npc.life.legal.sentenceRemaining < 0) errors.push(`NPC ${npc.id} has negative sentence`);
      if (npc.life.health.conditions.length > 4) errors.push(`NPC ${npc.id} has too many active conditions`);
      if (npc.life.career.history.length > 10) errors.push(`NPC ${npc.id} career history is unbounded`);
      if (npc.life.education.records.length > 8) errors.push(`NPC ${npc.id} education history is unbounded`);
    }
    if(!npc.assetPortfolio)errors.push(`NPC ${npc.id} is missing asset portfolio`);
    else{
      if(npc.assetPortfolio.properties.length>NPC_ASSET_LIMITS.portfolioProperties)errors.push(`NPC ${npc.id} property portfolio is unbounded`);
      if(npc.assetPortfolio.businesses.length>NPC_ASSET_LIMITS.portfolioBusinesses)errors.push(`NPC ${npc.id} business portfolio is unbounded`);
      const projected=npc.assetPortfolio.properties.reduce((sum,property)=>sum+property.marketValue,0);if(npc.life&&Math.abs(projected-npc.life.finance.propertyValue)>.5)errors.push(`NPC ${npc.id} property projection is inconsistent`);
      for(const property of npc.assetPortfolio.properties){if(seenNpcPropertyIds.has(property.id))errors.push(`NPC property ${property.id} has duplicate ownership`);seenNpcPropertyIds.add(property.id);if(property.marketValue<0||property.mortgageBalance<0||property.mortgageBalance>property.marketValue)errors.push(`NPC property ${property.id} has invalid value/debt`);}
      for(const business of npc.assetPortfolio.businesses){if(seenNpcBusinessIds.has(business.id))errors.push(`NPC business ${business.id} has duplicate ownership`);seenNpcBusinessIds.add(business.id);if(business.valuation<0||business.employees<0)errors.push(`NPC business ${business.id} has invalid values`);}
    }
    if(npc.inheritanceTrust){
      const trustProperties=npc.inheritanceTrust.properties??[];const trustBusinesses=npc.inheritanceTrust.businesses??[];
      if(trustProperties.length>NPC_ASSET_LIMITS.portfolioProperties)errors.push(`NPC ${npc.id} inheritance trust property portfolio is unbounded`);
      if(trustBusinesses.length>NPC_ASSET_LIMITS.portfolioBusinesses)errors.push(`NPC ${npc.id} inheritance trust business portfolio is unbounded`);
      for(const property of trustProperties){if(seenNpcPropertyIds.has(property.id))errors.push(`NPC trust property ${property.id} has duplicate ownership`);seenNpcPropertyIds.add(property.id);if(property.marketValue<0||property.mortgageBalance<0||property.mortgageBalance>property.marketValue)errors.push(`NPC trust property ${property.id} has invalid value/debt`);}
      for(const business of trustBusinesses){if(seenNpcBusinessIds.has(business.id))errors.push(`NPC trust business ${business.id} has duplicate ownership`);seenNpcBusinessIds.add(business.id);if(business.valuation<0||business.employees<0)errors.push(`NPC trust business ${business.id} has invalid values`);}
    }
    if (!npc.partnerId) continue;
    if (npc.partnerId === npc.id) errors.push(`NPC ${npc.id} is partnered with self`);
    const partner = state.npcs[npc.partnerId];
    if (!partner) errors.push(`NPC ${npc.id} references missing partner ${npc.partnerId}`);
    else if (partner.partnerId !== npc.id) errors.push(`NPC partnership ${npc.id}/${partner.id} is asymmetric`);
  }
  if ((state.socialWorlds??[]).filter(world=>world.kind==='school'&&world.active).length>1) errors.push('Multiple active school worlds');
  if ((state.socialWorlds??[]).filter(world=>world.kind==='workplace'&&world.active&&world.workplace?.employmentKind==='full_time').length>1) errors.push('Multiple active full-time workplace worlds');
  if ((state.employment.partTimeJobs??[]).length>3) errors.push('Too many active part-time jobs');
  if ((state.employment.partTimeJobs??[]).some(job=>job.hoursPerWeek<=0||job.hoursPerWeek>15)) errors.push('Invalid part-time job hours');
  for (const world of state.socialWorlds??[]) {
    for (const member of world.members??[]) if (!state.npcs[member.npcId]) errors.push(`Social world ${world.id} references missing NPC ${member.npcId}`);
    for (const group of world.groups??[]) if (!Number.isFinite(group.prestige)||group.prestige<0||group.prestige>100) errors.push(`Social world ${world.id} group ${group.id} has invalid prestige`);
    if (world.school && (world.school.attendance<0||world.school.attendance>100||world.school.conduct<0||world.school.conduct>100||world.school.socialStanding<0||world.school.socialStanding>100)) errors.push(`School world ${world.id} contains invalid bounded stats`);
    if (world.workplace && (world.workplace.morale<0||world.workplace.morale>100||world.workplace.culture<0||world.workplace.culture>100||world.workplace.tension<0||world.workplace.tension>100||world.workplace.reputation<0||world.workplace.reputation>100)) errors.push(`Workplace world ${world.id} contains invalid bounded stats`);

    const kind=specialWorldKind(world);
    if(!kind)continue;
    if(world.active&&world.endedAge!==undefined)errors.push(`Active ${kind} Career World ${world.id} has an ended age`);
    if(!world.active&&world.endedAge===undefined)errors.push(`Archived ${kind} Career World ${world.id} is missing an ended age`);
    if(!world.active&&world.members.some(member=>member.leftAge===undefined))errors.push(`Archived ${kind} Career World ${world.id} has active member affiliations`);
    const memberIds=world.members.map(member=>member.npcId);if(new Set(memberIds).size!==memberIds.length)errors.push(`Career World ${world.id} has duplicate member records`);
    const worldGroupIds=world.groups.map(group=>group.id);if(new Set(worldGroupIds).size!==worldGroupIds.length)errors.push(`Career World ${world.id} has duplicate group records`);
    const groupIds=new Set(worldGroupIds);
    for(const member of world.members){
      if(member.groupIds.some(id=>!groupIds.has(id)))errors.push(`Career World ${world.id} member ${member.npcId} references a missing group`);
      for(const groupId of member.groupIds){const group=world.groups.find(item=>item.id===groupId);if(group&&!group.memberNpcIds.includes(member.npcId))errors.push(`Career World ${world.id} member ${member.npcId} has asymmetric group membership`);}
    }
    for(const group of world.groups){
      if(new Set(group.memberNpcIds).size!==group.memberNpcIds.length)errors.push(`Career World ${world.id} group ${group.id} has duplicate members`);
      for(const npcId of group.memberNpcIds){
        const member=world.members.find(item=>item.npcId===npcId);if(!member)errors.push(`Career World ${world.id} group ${group.id} references a non-member NPC ${npcId}`);
        else if(!member.groupIds.includes(group.id))errors.push(`Career World ${world.id} group ${group.id} has asymmetric member ${npcId}`);
      }
    }
  }
  for(const kind of PHASE4_SPECIAL_WORLD_KINDS){
    const active=(state.socialWorlds??[]).filter(world=>world.active&&specialWorldKind(world)===kind);
    if(active.length>1)errors.push(`Multiple active ${kind} Career Worlds`);
    if(SUPPLEMENTAL_WORLD_KINDS.has(kind)&&active.length&& !supplementalPathOwnsWorld(state,kind))errors.push(`Active ${kind} Career World exists without an active owning career`);
  }
  return errors;
}
