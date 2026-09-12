import type { GameState, RelationshipType } from '../types/game';
import { relationshipTypeLabel } from '../core/familyRelations';
import {
  PEOPLE_FOLDERS,
  affiliationForFolder,
  relationshipsForFolder,
  type PeopleFolderAffiliation,
  type PeopleFolderId,
} from './PeopleGraphSystem';

export interface PeopleWorkspaceMembership {
  folderId: PeopleFolderId;
  label: string;
  relationshipType: RelationshipType;
  relationshipScore: number;
  affiliation?: PeopleFolderAffiliation;
}

export interface PeopleWorkspacePerson {
  id: string;
  name: string;
  age: number;
  alive: boolean;
  relationshipType: RelationshipType;
  relationshipScore: number;
  memberships: PeopleWorkspaceMembership[];
}

export interface PeopleWorkspaceFolder {
  id: PeopleFolderId;
  title: string;
  description: string;
  count: number;
  currentCount: number;
  formerCount: number;
}

export type PeopleWorkspaceStructuralEdgeKind = 'parent_child' | 'partner';

export interface PeopleWorkspaceStructuralEdge {
  id: string;
  from: string;
  to: string;
  kind: PeopleWorkspaceStructuralEdgeKind;
  label: string;
}

export interface PeopleWorkspaceModel {
  player: {
    id: string;
    name: string;
    age: number;
    alive: boolean;
  };
  folders: PeopleWorkspaceFolder[];
  people: PeopleWorkspacePerson[];
  structuralEdges: PeopleWorkspaceStructuralEdge[];
}

export interface PeopleWorkspaceViewOptions {
  visibleFolderIds?: readonly PeopleFolderId[];
  expandedFolderIds?: readonly PeopleFolderId[];
  query?: string;
  includeDeceased?: boolean;
  includeFormer?: boolean;
  minRelationship?: number;
}

export interface PeopleWorkspaceLayoutNode {
  id: string;
  kind: 'player' | 'folder' | 'person';
  x: number;
  y: number;
  name: string;
  folderId?: PeopleFolderId;
  person?: PeopleWorkspacePerson;
  count?: number;
  expanded?: boolean;
}

export interface PeopleWorkspaceLayoutEdge {
  id: string;
  from: string;
  to: string;
  kind: 'folder_link' | PeopleWorkspaceStructuralEdgeKind;
  label: string;
  folderId?: PeopleFolderId;
}

export interface PeopleWorkspaceProjection {
  model: PeopleWorkspaceModel;
  nodes: PeopleWorkspaceLayoutNode[];
  edges: PeopleWorkspaceLayoutEdge[];
  visibleFolderIds: PeopleFolderId[];
  expandedFolderIds: PeopleFolderId[];
  visiblePersonIds: string[];
}

export const DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS: readonly PeopleFolderId[] = PEOPLE_FOLDERS.map(folder=>folder.id);
export const DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS: readonly PeopleFolderId[] = ['player_family','friends'];

const FOLDER_INDEX = new Map(PEOPLE_FOLDERS.map((folder,index)=>[folder.id,index] as const));
const HUB_RADIUS = 330;
const PERSON_RING_START = 610;
const PERSON_RING_STEP = 185;
const PERSON_ARC_TARGET = 185;
const CATEGORY_SECTOR_SPAN = (Math.PI * 2 / PEOPLE_FOLDERS.length) * .7;
const START_ANGLE = -Math.PI / 2;

function roleText(value:string){return value.replaceAll('_',' ');}
function directLabel(type:RelationshipType){return relationshipTypeLabel(type);}
function folderAngle(folderId:PeopleFolderId){return START_ANGLE+(FOLDER_INDEX.get(folderId)??0)*(Math.PI*2/PEOPLE_FOLDERS.length);}
function folderNodeId(folderId:PeopleFolderId){return `people-folder:${folderId}`;}
function sortedUnique<T>(values:Iterable<T>){return [...new Set(values)];}

function membershipLabel(type:RelationshipType,affiliation?:PeopleFolderAffiliation){
  if(!affiliation)return directLabel(type);
  const status=affiliation.status==='current'?'current':'former';
  return `${status} ${roleText(affiliation.role)} · ${affiliation.worldName}`;
}

function addStructuralEdge(
  edges:PeopleWorkspaceStructuralEdge[],
  keys:Set<string>,
  from:string,
  to:string,
  kind:PeopleWorkspaceStructuralEdgeKind,
  label:string,
){
  if(from===to)return;
  const key=kind==='parent_child'
    ? `${kind}:${from}>${to}`
    : `${kind}:${[from,to].sort().join('|')}`;
  if(keys.has(key))return;
  keys.add(key);
  edges.push({id:key,from,to,kind,label});
}

export function buildPeopleWorkspaceModel(state:GameState):PeopleWorkspaceModel {
  const personById=new Map<string,PeopleWorkspacePerson>();
  const folderMemberships=new Map<PeopleFolderId,PeopleWorkspaceMembership[]>();

  for(const folder of PEOPLE_FOLDERS){
    const memberships:PeopleWorkspaceMembership[]=[];
    for(const rel of relationshipsForFolder(state,folder.id)){
      const npc=state.npcs[rel.npcId];
      if(!npc)continue;
      const affiliation=['school','work','career'].includes(folder.id)
        ? affiliationForFolder(state,folder.id,npc.id)
        : undefined;
      const membership:PeopleWorkspaceMembership={
        folderId:folder.id,
        label:membershipLabel(rel.type,affiliation),
        relationshipType:rel.type,
        relationshipScore:rel.score,
        ...(affiliation?{affiliation}:{}),
      };
      memberships.push(membership);
      const existing=personById.get(npc.id);
      if(existing){
        if(!existing.memberships.some(item=>item.folderId===folder.id))existing.memberships.push(membership);
      }else{
        personById.set(npc.id,{
          id:npc.id,
          name:`${npc.firstName} ${npc.lastName}`,
          age:npc.age,
          alive:npc.alive,
          relationshipType:rel.type,
          relationshipScore:rel.score,
          memberships:[membership],
        });
      }
    }
    folderMemberships.set(folder.id,memberships);
  }

  for(const person of personById.values()){
    person.memberships.sort((a,b)=>(FOLDER_INDEX.get(a.folderId)??0)-(FOLDER_INDEX.get(b.folderId)??0));
  }

  const people=[...personById.values()].sort((a,b)=>b.relationshipScore-a.relationshipScore||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
  const peopleIds=new Set(people.map(person=>person.id));
  const structuralEdges:PeopleWorkspaceStructuralEdge[]=[];
  const edgeKeys=new Set<string>();
  const playerId=state.character.id;

  for(const person of people){
    const npc=state.npcs[person.id];
    const rel=state.relationships.find(item=>item.npcId===person.id);
    if(!npc||!rel)continue;
    if(npc.parentIds.includes(playerId))addStructuralEdge(structuralEdges,edgeKeys,playerId,npc.id,'parent_child','your child');
    if(npc.childIds.includes(playerId))addStructuralEdge(structuralEdges,edgeKeys,npc.id,playerId,'parent_child','your parent');
    if(['partner','fiance','spouse','ex'].includes(rel.type))addStructuralEdge(structuralEdges,edgeKeys,playerId,npc.id,'partner',directLabel(rel.type));
  }

  for(const person of people){
    const npc=state.npcs[person.id];
    if(!npc)continue;
    for(const parentId of npc.parentIds){
      if(peopleIds.has(parentId))addStructuralEdge(structuralEdges,edgeKeys,parentId,npc.id,'parent_child','parent → child');
    }
    for(const childId of npc.childIds){
      if(peopleIds.has(childId))addStructuralEdge(structuralEdges,edgeKeys,npc.id,childId,'parent_child','parent → child');
    }
    if(npc.partnerId&&peopleIds.has(npc.partnerId)){
      const partner=state.npcs[npc.partnerId];
      const label=npc.maritalStatus==='married'&&partner?.maritalStatus==='married'?'spouses':'partners';
      addStructuralEdge(structuralEdges,edgeKeys,npc.id,npc.partnerId,'partner',label);
    }
  }

  structuralEdges.sort((a,b)=>a.id.localeCompare(b.id));

  const folders:PeopleWorkspaceFolder[]=PEOPLE_FOLDERS.map(folder=>{
    const memberships=folderMemberships.get(folder.id)??[];
    const currentCount=memberships.filter(item=>item.affiliation?.status==='current').length;
    const formerCount=memberships.filter(item=>item.affiliation?.status==='former').length;
    return{
      id:folder.id,
      title:folder.title,
      description:folder.description,
      count:memberships.length,
      currentCount,
      formerCount,
    };
  });

  return{
    player:{id:playerId,name:`${state.character.firstName} ${state.character.lastName}`,age:state.character.age,alive:state.character.alive},
    folders,
    people,
    structuralEdges,
  };
}

function membershipPasses(person:PeopleWorkspacePerson,membership:PeopleWorkspaceMembership,options:Required<Pick<PeopleWorkspaceViewOptions,'includeFormer'|'minRelationship'>> & {query:string}){
  if(person.relationshipScore<options.minRelationship)return false;
  if(!options.includeFormer&&membership.affiliation?.status==='former')return false;
  if(!options.query)return true;
  const haystack=[
    person.name,
    directLabel(person.relationshipType),
    membership.label,
    membership.affiliation?.worldName??'',
    membership.affiliation?.role??'',
  ].join(' ').toLowerCase();
  return haystack.includes(options.query);
}

function assignPrimaryFolders(
  people:PeopleWorkspacePerson[],
  expanded:Set<PeopleFolderId>,
  visible:Set<PeopleFolderId>,
  includeFormer:boolean,
  minRelationship:number,
  query:string,
){
  const assignments=new Map<PeopleFolderId,PeopleWorkspacePerson[]>();
  for(const folder of PEOPLE_FOLDERS)assignments.set(folder.id,[]);
  const personMemberships=new Map<string,PeopleWorkspaceMembership[]>();
  for(const person of people){
    const memberships=person.memberships.filter(membership=>
      visible.has(membership.folderId)&&expanded.has(membership.folderId)&&membershipPasses(person,membership,{includeFormer,minRelationship,query}),
    );
    if(!memberships.length)continue;
    personMemberships.set(person.id,memberships);
    const primary=memberships.slice().sort((a,b)=>(FOLDER_INDEX.get(a.folderId)??0)-(FOLDER_INDEX.get(b.folderId)??0))[0]!;
    assignments.get(primary.folderId)!.push(person);
  }
  for(const list of assignments.values())list.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
  return{assignments,personMemberships};
}

function layoutCategoryPeople(folderId:PeopleFolderId,people:PeopleWorkspacePerson[]){
  const result=new Map<string,{x:number;y:number}>();
  if(!people.length)return result;
  const center=folderAngle(folderId);
  let radius=PERSON_RING_START;
  let cursor=0;
  while(cursor<people.length){
    const capacity=Math.max(1,Math.floor((radius*CATEGORY_SECTOR_SPAN)/PERSON_ARC_TARGET));
    const take=Math.min(capacity,people.length-cursor);
    const span=take<=1?0:Math.min(CATEGORY_SECTOR_SPAN,(take-1)*PERSON_ARC_TARGET/radius);
    for(let i=0;i<take;i+=1){
      const fraction=take<=1?.5:i/(take-1);
      const angle=center-span/2+span*fraction;
      const person=people[cursor+i]!;
      result.set(person.id,{x:Math.cos(angle)*radius,y:Math.sin(angle)*radius});
    }
    cursor+=take;
    radius+=PERSON_RING_STEP;
  }
  return result;
}

export function projectPeopleWorkspace(model:PeopleWorkspaceModel,options:PeopleWorkspaceViewOptions={}):PeopleWorkspaceProjection {
  const visibleFolderIds=sortedUnique(options.visibleFolderIds??DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS).filter(id=>FOLDER_INDEX.has(id));
  const visible=new Set(visibleFolderIds);
  const expandedFolderIds=sortedUnique(options.expandedFolderIds??DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS).filter(id=>visible.has(id));
  const expanded=new Set(expandedFolderIds);
  const includeDeceased=options.includeDeceased??true;
  const includeFormer=options.includeFormer??true;
  const minRelationship=Math.max(0,Math.min(100,Math.round(options.minRelationship??0)));
  const query=(options.query??'').trim().toLowerCase();
  const candidates=model.people.filter(person=>includeDeceased||person.alive);
  const {assignments,personMemberships}=assignPrimaryFolders(candidates,expanded,visible,includeFormer,minRelationship,query);
  const positionByPerson=new Map<string,{x:number;y:number}>();
  for(const folder of PEOPLE_FOLDERS){
    const positions=layoutCategoryPeople(folder.id,assignments.get(folder.id)??[]);
    for(const [id,position] of positions)positionByPerson.set(id,position);
  }

  const nodes:PeopleWorkspaceLayoutNode[]=[{
    id:model.player.id,kind:'player',x:0,y:0,name:model.player.name,
  }];
  for(const folder of model.folders){
    if(!visible.has(folder.id))continue;
    const angle=folderAngle(folder.id);
    nodes.push({
      id:folderNodeId(folder.id),kind:'folder',folderId:folder.id,
      x:Math.cos(angle)*HUB_RADIUS,y:Math.sin(angle)*HUB_RADIUS,
      name:folder.title,count:folder.count,expanded:expanded.has(folder.id),
    });
  }
  for(const person of candidates){
    const position=positionByPerson.get(person.id);
    if(!position)continue;
    nodes.push({id:person.id,kind:'person',x:position.x,y:position.y,name:person.name,person});
  }

  const visiblePersonIds=[...positionByPerson.keys()];
  const visiblePeople=new Set(visiblePersonIds);
  const edges:PeopleWorkspaceLayoutEdge[]=[];
  for(const personId of visiblePersonIds){
    for(const membership of personMemberships.get(personId)??[]){
      edges.push({
        id:`folder-link:${membership.folderId}:${personId}`,
        from:folderNodeId(membership.folderId),to:personId,kind:'folder_link',
        label:membership.label,folderId:membership.folderId,
      });
    }
  }
  for(const edge of model.structuralEdges){
    const fromVisible=edge.from===model.player.id||visiblePeople.has(edge.from);
    const toVisible=edge.to===model.player.id||visiblePeople.has(edge.to);
    if(fromVisible&&toVisible)edges.push({...edge});
  }
  edges.sort((a,b)=>a.id.localeCompare(b.id));

  return{model,nodes,edges,visibleFolderIds,expandedFolderIds,visiblePersonIds};
}

export function peopleWorkspaceSemanticView(state:GameState){
  const model=buildPeopleWorkspaceModel(state);
  const people=model.people.slice(0,96);
  const includedIds=new Set([model.player.id,...people.map(person=>person.id)]);
  return{
    player:{...model.player},
    folders:model.folders.map(folder=>({...folder})),
    totalPeople:model.people.length,
    people:people.map(person=>({
      id:person.id,name:person.name,age:person.age,alive:person.alive,
      relationshipType:person.relationshipType,relationshipScore:person.relationshipScore,
      memberships:person.memberships.map(membership=>({
        folderId:membership.folderId,label:membership.label,
        affiliation:membership.affiliation?{...membership.affiliation}:undefined,
      })),
    })),
    truncated:model.people.length>people.length,
    structuralEdges:model.structuralEdges.filter(edge=>includedIds.has(edge.from)&&includedIds.has(edge.to)).slice(0,160).map(edge=>({...edge})),
  };
}

export function peopleWorkspaceFolderNodeId(folderId:PeopleFolderId){return folderNodeId(folderId);}
