import { primaryNavigationItems } from '../core/navigation';
import { createInstitutionRouteRequest, resolveInstitutionDestination } from '../core/institutionRouting';
import { TOWN_MAP_HEIGHT, TOWN_MAP_WIDTH, TOWN_PLACES } from '../data/townPlaces';

export function runPrePhase10EPlayerUxRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Pre-Phase 10E player-UX regression failed: ${message}`);}

  const base=primaryNavigationItems('life',false);
  verify(base.map(item=>item.id).join(',')==='life,people,map','1 the persistent mobile navigation must contain only Life, People, and Map');
  for(const contextual of ['activities','career','assets'] as const){
    const items=primaryNavigationItems(contextual,true);
    verify(items.length===4&&items.slice(0,3).map(item=>item.id).join(',')==='life,people,map'&&items[3]?.id===contextual,`2-${contextual} a map-routed ${contextual} owner must appear only as the single contextual fourth tab`);
  }
  verify(primaryNavigationItems('career',false).length===3,'3 a non-routed Career screen must not permanently restore the removed navigation item');

  const studio=TOWN_PLACES.find(place=>place.id==='threadtone-music-studio');
  verify(Boolean(studio&&studio.category==='career'&&studio.districtId==='eastworks'),'4 the Music career must have one authored public Eastworks studio location');
  verify(Boolean(studio&&studio.map.x>=0&&studio.map.x<=TOWN_MAP_WIDTH&&studio.map.y>=0&&studio.map.y<=TOWN_MAP_HEIGHT),'5 the Music Studio marker must stay on the authored map coordinate plane');
  verify(studio?.activityTags.includes('music')===true&&studio.visibility==='public','6 the Music Studio must be searchable as a public music place');
  verify(studio?.routes?.length===1&&studio.routes[0]?.destination==='music','7 the Music Studio must expose one honest route into the existing Music owner');
  verify(JSON.stringify(resolveInstitutionDestination('music'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'music'}),'8 Music routing must focus the established Career special-path authority');
  const requestA=createInstitutionRouteRequest('threadtone-music-studio','music',901);const requestB=createInstitutionRouteRequest('threadtone-music-studio','music',901);
  verify(Boolean(requestA&&requestA.placeId==='threadtone-music-studio'&&requestA.resolved.tab==='career'&&JSON.stringify(requestA)===JSON.stringify(requestB)),'9 Music Studio route requests must preserve authored place identity and resolve deterministically');

  return checks;
}
