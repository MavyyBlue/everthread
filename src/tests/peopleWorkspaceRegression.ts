import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import {
  DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS,
  DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS,
  buildPeopleWorkspaceModel,
  peopleWorkspaceSemanticView,
  projectPeopleWorkspace,
  type PeopleWorkspaceModel,
  type PeopleWorkspacePerson,
} from '../systems/PeopleWorkspaceSystem';
import { PEOPLE_FOLDERS } from '../systems/PeopleGraphSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, Npc, RelationshipType, SocialWorld } from '../types/game';

function adultFixture(seed:string){
  const state=createNewGame({seed});state.character.age=30;state.currentYear=2070;state.education=[];state.finances.cash=250_000;return state;
}

function addNpc(state:GameState,id:string,firstName:string,type:RelationshipType,score:number,options:{alive?:boolean;age?:number;maritalStatus?:Npc['maritalStatus'];parentIds?:string[];childIds?:string[]}={}){
  const npc:Npc={
    id,firstName,lastName:'Thread',age:options.age??30,alive:options.alive??true,health:84,happiness:72,wealth:35_000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:72,maritalStatus:options.maritalStatus??'single',
    traits:['calm','loyal'],hiddenOpinion:18,memories:[],parentIds:options.parentIds??[],childIds:options.childIds??[],simulationTier:'background',
  };
  state.npcs[id]=npc;ensureNpcLife(state,npc);
  state.relationships.push({id:`rel-${id}`,npcId:id,type,score,attraction:type==='spouse'?80:35,compatibility:76,yearsKnown:5});
  return npc;
}

function world(state:GameState,id:string,kind:SocialWorld['kind'],name:string,active:boolean,members:SocialWorld['members'],extra:Partial<SocialWorld>={}):SocialWorld{
  return{id,kind,name,countryId:state.character.countryId,city:state.character.city,startedAge:22,...(!active?{endedAge:27}:{}),active,members,groups:[],...extra};
}

function populatedFixture(){
  const state=adultFixture('people-workspace');
  const alice=addNpc(state,'alice','Alice','friend',82);
  const boss=addNpc(state,'eve','Eve','boss',66,{age:44});
  const child=addNpc(state,'child','Mina','child',91,{age:8,parentIds:[state.character.id]});
  const spouse=addNpc(state,'spouse','Riley','spouse',88,{age:31,maritalStatus:'married'});
  const deceased=addNpc(state,'bob','Bob','friend',57,{alive:false,age:50});
  const low=addNpc(state,'low','Lowell','friend',18,{age:29});
  const formerTeacher=addNpc(state,'teacher','Tessa','teacher',63,{age:52});
  state.socialWorlds.push(world(state,'work-current','workplace','Northline Studio',true,[
    {npcId:alice.id,role:'coworker',joinedAge:28,groupIds:[]},
    {npcId:boss.id,role:'boss',joinedAge:28,groupIds:[]},
  ],{workplace:{employmentKey:'fixture',employmentKind:'full_time',industry:'Media',department:'Design',morale:60,culture:62,tension:22,reputation:64,managerNpcId:boss.id,layoffs:0,disputes:0}}));
  state.socialWorlds.push(world(state,'special-acting-fixture','organization','Glass Lantern Pictures',true,[
    {npcId:alice.id,role:'leader',joinedAge:29,groupIds:[]},
  ]));
  state.socialWorlds.push(world(state,'school-former','school','Westbridge Academy',false,[
    {npcId:alice.id,role:'classmate',joinedAge:15,leftAge:18,groupIds:[]},
    {npcId:formerTeacher.id,role:'teacher',joinedAge:15,leftAge:18,groupIds:[]},
  ],{school:{stage:'secondary',educationKey:'fixture-school',attendance:88,conduct:82,socialStanding:70,honors:1,disciplinaryActions:0,principalNpcId:formerTeacher.id}}));
  return{state,alice,boss,child,spouse,deceased,low,formerTeacher};
}

function fakeLargeModel(count:number):PeopleWorkspaceModel{
  const people:PeopleWorkspacePerson[]=Array.from({length:count},(_,index)=>({
    id:`stress-${index}`,name:`Stress ${String(index).padStart(4,'0')}`,age:30,alive:true,relationshipType:'friend',relationshipScore:60,
    memberships:[{folderId:'friends',label:'friend',relationshipType:'friend',relationshipScore:60}],
  }));
  return{
    player:{id:'player-stress',name:'Player Stress',age:30,alive:true},
    folders:PEOPLE_FOLDERS.map(item=>({id:item.id,title:item.title,description:item.description,count:item.id==='friends'?count:0,currentCount:0,formerCount:0})),
    people,structuralEdges:[],
  };
}

function personNodes(model:PeopleWorkspaceModel,count?:number){
  const projection=projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends']});
  const nodes=projection.nodes.filter(node=>node.kind==='person');
  if(count!==undefined&&nodes.length!==count)throw new Error(`Expected ${count} person nodes, received ${nodes.length}.`);
  return nodes;
}

export async function runPeopleWorkspaceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`People workspace regression failed: ${message}`);}

  verify(PEOPLE_FOLDERS.length===7&&new Set(PEOPLE_FOLDERS.map(folder=>folder.id)).size===7,'the seven established People categories remain unique and authoritative');
  verify(DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS.length===7&&DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS.every(id=>PEOPLE_FOLDERS.some(folder=>folder.id===id)),'default Threadspace visibility includes all seven established categories');
  verify(DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS.includes('player_family')&&DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS.includes('friends'),'default expansion opens useful relationship circles without expanding the entire lifetime cast');

  const fixture=populatedFixture();const sourceBefore=JSON.stringify(fixture.state);const model=buildPeopleWorkspaceModel(fixture.state);
  verify(JSON.stringify(fixture.state)===sourceBefore,'building the Threadspace model is strictly read-only');
  verify(model.people.filter(person=>person.id===fixture.alice.id).length===1,'one canonical node exists per NPC even when the person belongs to several categories');
  const alice=model.people.find(person=>person.id===fixture.alice.id)!;const aliceFolders=new Set(alice.memberships.map(item=>item.folderId));
  verify((['friends','school','work','career'] as const).every(folder=>aliceFolders.has(folder)),'one canonical person can simultaneously carry friend, school, workplace, and Career World memberships');
  verify(model.folders.find(folder=>folder.id==='work')?.count===2,'work category count is projected from persistent workplace affiliation rather than relationship type alone');
  verify(model.folders.find(folder=>folder.id==='career')?.count===1,'Career Worlds category discovers the exact persistent special-career affiliation');
  verify(model.folders.find(folder=>folder.id==='school')?.formerCount===2,'former school affiliations remain represented as historical graph membership');
  verify(model.structuralEdges.some(edge=>edge.kind==='parent_child'&&edge.from===fixture.state.character.id&&edge.to===fixture.child.id),'real player-to-child structure is preserved as a labeled graph edge');
  verify(model.structuralEdges.some(edge=>edge.kind==='partner'&&edge.from===fixture.state.character.id&&edge.to===fixture.spouse.id),'current romantic structure is preserved as a graph edge');
  verify(!model.structuralEdges.some(edge=>(edge.from===fixture.alice.id&&edge.to===fixture.deceased.id)||(edge.from===fixture.deceased.id&&edge.to===fixture.alice.id)),'Threadspace does not invent NPC-to-NPC social links merely to make the graph busier');

  const collapsed=projectPeopleWorkspace(model,{expandedFolderIds:[]});
  verify(collapsed.visiblePersonIds.length===0&&collapsed.nodes.filter(node=>node.kind==='folder').length===7,'collapsed categories retain their hubs while hiding their NPC nodes');
  const friends=projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends']});
  verify(friends.visiblePersonIds.includes(fixture.alice.id)&&friends.visiblePersonIds.includes(fixture.deceased.id),'expanding Friends reveals its canonical member nodes');
  const work=projectPeopleWorkspace(model,{visibleFolderIds:['work'],expandedFolderIds:['work']});
  verify(work.visiblePersonIds.includes(fixture.alice.id)&&work.visiblePersonIds.includes(fixture.boss.id),'expanding Work reveals persistent coworker and boss nodes');
  const multi=projectPeopleWorkspace(model,{visibleFolderIds:['friends','work','career'],expandedFolderIds:['friends','work','career']});
  verify(multi.nodes.filter(node=>node.id===fixture.alice.id).length===1,'simultaneously expanded categories still render a shared NPC only once');
  verify(multi.edges.filter(edge=>edge.kind==='folder_link'&&edge.to===fixture.alice.id).length===3,'the canonical shared NPC receives one labeled link from each visible expanded category');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends'],includeDeceased:false}).visiblePersonIds.includes(fixture.deceased.id)===false,'deceased filter hides dead NPC nodes without deleting them from the model');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends'],includeDeceased:true}).visiblePersonIds.includes(fixture.deceased.id),'deceased filter can restore historical NPC nodes');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['school'],expandedFolderIds:['school'],includeFormer:false}).visiblePersonIds.length===0,'former-affiliation filter can collapse an entirely historical school graph');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends','school'],expandedFolderIds:['friends','school'],includeFormer:false}).visiblePersonIds.includes(fixture.alice.id),'hiding a former school affiliation does not hide the same canonical NPC when a current visible friendship still qualifies');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends'],minRelationship:60}).visiblePersonIds.includes(fixture.low.id)===false,'minimum relationship filter removes weak connections');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends'],query:'alice'}).visiblePersonIds.includes(fixture.alice.id),'name search finds an exact canonical NPC');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['work'],expandedFolderIds:['work'],query:'northline'}).visiblePersonIds.includes(fixture.alice.id),'institution/world search finds people by persistent affiliation');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['work'],expandedFolderIds:['work'],query:'boss'}).visiblePersonIds.includes(fixture.boss.id),'role search finds people by institutional role');
  const deterministicA=JSON.stringify(projectPeopleWorkspace(model,{visibleFolderIds:['friends','work','career'],expandedFolderIds:['friends','work','career']}));
  const deterministicB=JSON.stringify(projectPeopleWorkspace(model,{visibleFolderIds:['friends','work','career'],expandedFolderIds:['friends','work','career']}));
  verify(deterministicA===deterministicB,'identical state and view options produce deterministic Threadspace topology and coordinates');
  verify(multi.nodes.every(node=>Number.isFinite(node.x)&&Number.isFinite(node.y)),'all projected node coordinates remain finite');
  verify(new Set(multi.nodes.map(node=>node.id)).size===multi.nodes.length,'projected node ids remain unique');
  verify(new Set(multi.edges.map(edge=>edge.id)).size===multi.edges.length,'projected edge ids remain unique');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['work']}).expandedFolderIds.length===0,'hidden categories cannot remain invisibly expanded');
  verify(projectPeopleWorkspace(model,{visibleFolderIds:['friends'],expandedFolderIds:['friends']}).nodes.some(node=>node.kind==='folder'&&node.folderId==='work')===false,'category visibility filter removes hidden hubs from the presentation projection');

  const stress180=personNodes(fakeLargeModel(180),180);
  verify(new Set(stress180.map(node=>`${node.x.toFixed(4)}|${node.y.toFixed(4)}`)).size===180,'180-person layout assigns a unique spatial position to every canonical node');
  verify(stress180.every(node=>Number.isFinite(node.x)&&Number.isFinite(node.y)),'180-person layout remains finite');
  let overlap180=false;for(let i=0;i<stress180.length&&!overlap180;i++)for(let j=i+1;j<stress180.length;j++){const a=stress180[i]!,b=stress180[j]!;if(Math.abs(a.x-b.x)<158&&Math.abs(a.y-b.y)<78){overlap180=true;break;}}
  verify(!overlap180,'180-person populated graph retains card-sized spatial separation instead of becoming electronic spaghetti');
  verify(Math.max(...stress180.map(node=>Math.hypot(node.x,node.y)))<12_000,'180-person graph growth remains bounded to a practical logical coordinate envelope');
  const stress1000=personNodes(fakeLargeModel(1000),1000);
  verify(new Set(stress1000.map(node=>`${node.x.toFixed(4)}|${node.y.toFixed(4)}`)).size===1000,'1,000-person single-category stress layout produces no duplicate positions');
  verify(stress1000.every(node=>Number.isFinite(node.x)&&Number.isFinite(node.y)),'1,000-person stress layout remains numerically stable');
  verify(Math.max(...stress1000.map(node=>Math.hypot(node.x,node.y)))<30_000,'1,000-person logical graph stays bounded without requiring a giant rendered DOM surface');

  const semanticBefore=JSON.stringify(fixture.state);const semantic=peopleWorkspaceSemanticView(fixture.state);
  verify(JSON.stringify(fixture.state)===semanticBefore,'semantic People workspace observation is read-only');
  verify(semantic.folders.length===7&&semantic.totalPeople===model.people.length,'semantic observation exposes the same seven-category canonical graph model');
  const semanticAlice=semantic.people.find(person=>person.id===fixture.alice.id)!;
  verify(Boolean(semanticAlice)&&semanticAlice.memberships.filter(item=>['friends','school','work','career'].includes(item.folderId)).length===4,'semantic observation preserves multi-category membership for the same exact NPC');
  verify(!semantic.truncated,'small relationship casts are exposed completely to the semantic People view');

  const aiSource=populatedFixture();const callerSnapshot=JSON.stringify(aiSource.state);
  await withEverthreadAiTestbench({state:aiSource.state,screen:'people'},async bench=>{
    const view=bench.observe('people');const workspace=view.data.workspace as ReturnType<typeof peopleWorkspaceSemanticView>;
    verify(workspace.folders.length===7&&workspace.people.some(person=>person.id===aiSource.alice.id),'AI People observation reads the same canonical Threadspace projection as the player-facing workspace');
    verify(view.actions.some(action=>action.id==='people.interact'&&action.args?.includes('npcId')&&action.args?.includes('action')),'AI People surface supports exact-NPC generic interaction beyond the bounded convenience action list');
    verify(view.actions.some(action=>action.id==='people.interact.argue'&&action.targetId===aiSource.alice.id),'Argue is represented in People semantic coverage like the real NPC profile card');
    verify(view.actions.some(action=>action.id==='people.report_workplace'&&action.targetId===aiSource.alice.id),'current coworker concerns are exposed against the exact persistent NPC');
    verify(view.actions.some(action=>action.id==='people.meet'&&action.enabled),'People semantic coverage includes the real Meet someone action');
    verify(view.actions.some(action=>action.id==='people.have_child'&&action.targetId===aiSource.spouse.id),'adult family-planning semantics bind Try for child to the exact current partner');
    verify(view.actions.some(action=>action.id==='people.adopt'&&action.enabled),'adult People semantic coverage includes adoption when the real UI action is available');
    const inspectBefore=JSON.stringify(bench.getState());const inspected=bench.inspectPeopleWorkspace();verify(inspected.people.some(person=>person.id===aiSource.alice.id)&&JSON.stringify(bench.getState())===inspectBefore,'inspectPeopleWorkspace is exact and read-only');
    const generic=bench.execute({id:'people.interact',args:{npcId:aiSource.alice.id,action:'conversation'}});verify(generic.result.success&&generic.invariantIssues.length===0,'generic exact-NPC semantic interaction routes through the real GameEngine and invariant watch');
    const beforeArgue=bench.getState().relationships.find(rel=>rel.npcId===aiSource.alice.id)!.score;const argue=bench.execute({id:'people.interact.argue',args:{npcId:aiSource.alice.id}});const afterArgue=bench.getState().relationships.find(rel=>rel.npcId===aiSource.alice.id)!.score;
    verify(argue.result.success&&afterArgue<beforeArgue&&bench.getState().npcs[aiSource.alice.id]!.memories.some(memory=>memory.kind==='argue'),'semantic Argue executes the real relationship consequence and NPC memory path');
    const report=bench.execute({id:'people.report_workplace',args:{npcId:aiSource.alice.id}});verify(report.result.success&&bench.getState().npcs[aiSource.alice.id]!.memories.some(memory=>memory.kind==='work_report'),'semantic workplace concern executes through the real workplace system and exact target memory');
    const beforeMeet=bench.getState().relationships.length;const meet=bench.execute('people.meet');verify(meet.result.success&&bench.getState().relationships.length===beforeMeet+1,'People semantic Meet someone creates the real persistent NPC relationship');
    const adopt=bench.execute('people.adopt');verify(adopt.result.success&&bench.getState().relationships.some(rel=>rel.type==='child'&&bench.getState().npcs[rel.npcId]?.age===0),'semantic adoption executes the same persistent child creation path as the player People tab');
  });
  verify(JSON.stringify(aiSource.state)===callerSnapshot,'the caller-owned fixture remains byte-for-byte unchanged after Threadspace AI interaction testing');

  const teen=adultFixture('people-workspace-teen');teen.character.age=17;teen.currentYear=2057;
  await withEverthreadAiTestbench({state:teen,screen:'people'},async bench=>{
    const actions=bench.observe('people').actions;verify(!actions.some(action=>action.id==='people.have_child'||action.id==='people.adopt'),'People semantic family-planning actions preserve the player UI adult presentation boundary');
  });

  return checks;
}
