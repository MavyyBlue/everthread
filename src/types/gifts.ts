import type { EngineResult } from './game';
import type { SharedExperienceBand } from './sharedExperiences';
import type { NpcPreferenceTag } from './npcPreferences';

export interface PersonalGiftOption {
  instanceId:string;
  itemId:string;
  itemName:string;
  description:string;
  category:'keepsake'|'hobby'|'style'|'gift';
  acquiredAge:number;
  allowed:boolean;
  reason?:string;
}

export interface PersonalGiftEvaluation {
  npcId:string;
  relationshipId:string;
  instanceId:string;
  itemId:string;
  itemName:string;
  approval:number;
  band:SharedExperienceBand;
  relationshipDelta:number;
  opinionDelta:number;
  happinessDelta:number;
  prose:string;
  memorySummary:string;
  meaningfulMemory:boolean;
  preferenceSignalTag?:NpcPreferenceTag;
  discoveredPreferenceTag?:NpcPreferenceTag;
}

export interface PersonalGiftActionResult extends EngineResult {
  gift?:PersonalGiftEvaluation;
}
