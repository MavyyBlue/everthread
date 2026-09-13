import { createNewGame } from '../systems/CharacterSystem';
import { activitiesDisclosure, careerDisclosure, schoolGroupAgeVisible, specialActionAgeVisible, specialPathAgeVisible } from '../screens/progressiveDisclosure';

function verify(condition:unknown,message:string){if(!condition)throw new Error(`Progressive disclosure regression failed: ${message}`);}
function stateAt(age:number){const state=createNewGame({seed:`progressive-disclosure-${age}`});state.character.age=age;state.currentYear=2026+age;return state;}

export function runProgressiveDisclosureRegression(){
  let checks=0;const ok=(condition:unknown,message:string)=>{verify(condition,message);checks+=1;};

  const newborn=activitiesDisclosure(stateAt(0));
  ok(!newborn.meetSomeone&&!newborn.travel&&!newborn.socialMedia&&!newborn.riskyHabits&&!newborn.unusualVentures,'newborn activity view hides later-life surfaces');
  ok(newborn.wellness.length===0&&!newborn.therapy&&newborn.licenses.length===0,'newborn activity view hides age-locked wellness, therapy, and licenses');
  const age3=activitiesDisclosure(stateAt(3));ok(age3.wellness.includes('walking')&&!age3.travel,'walking appears at its owner-defined age while travel stays hidden');
  const age5=activitiesDisclosure(stateAt(5));ok(age5.travel&&age5.wellness.includes('running'),'family travel and running appear at their owner-defined age');
  const age13=activitiesDisclosure(stateAt(13));ok(age13.socialMedia&&age13.therapy&&age13.wellness.includes('gym')&&!age13.meetSomeone,'teen wellness/social surfaces unlock without exposing dating early');
  const age14=activitiesDisclosure(stateAt(14));ok(age14.meetSomeone,'Meet Someone appears at the relationship-system threshold');
  const age16=activitiesDisclosure(stateAt(16));ok(age16.riskyHabits&&age16.licenses.includes('driving')&&age16.licenses.includes('boating')&&!age16.licenses.includes('pilot'),'age 16 exposes eligible habits and licenses but not pilot');
  const age18=activitiesDisclosure(stateAt(18));ok(age18.unusualVentures&&age18.independentTravel&&age18.licenses.includes('pilot'),'adult ventures, independent travel, and pilot licensing appear at 18');

  const childCareer=careerDisclosure(stateAt(8));ok(!childCareer.fullTimeWork&&!childCareer.partTimeWork&&!childCareer.freelance,'child Work tab hides employment surfaces');
  const age14Career=careerDisclosure(stateAt(14));ok(!age14Career.fullTimeWork&&!age14Career.partTimeWork&&age14Career.freelance,'freelance unlocks before ordinary job-market surfaces');
  const age16Career=careerDisclosure(stateAt(16));ok(age16Career.fullTimeWork&&age16Career.partTimeWork&&age16Career.freelance,'age 16 exposes ordinary work surfaces');
  const legacyWork=stateAt(10);legacyWork.employment.current={jobId:'legacy',title:'Legacy Role',company:'Legacy Co',startAge:10,salary:1,performance:50,level:1};ok(careerDisclosure(legacyWork).fullTimeWork,'legacy/current employment stays visible even below the presentation threshold');

  const age7=stateAt(7);ok(!specialPathAgeVisible(age7,'acting')&&!specialPathAgeVisible(age7,'sports')&&!specialPathAgeVisible(age7,'combat'),'pre-path child hides acting, organized sports, and combat career cards');
  const age8=stateAt(8);ok(specialPathAgeVisible(age8,'acting')&&specialPathAgeVisible(age8,'sports')&&!specialPathAgeVisible(age8,'combat'),'acting and organized sports appear at 8 while combat remains hidden');
  const age12=stateAt(12);ok(specialPathAgeVisible(age12,'combat')&&!specialActionAgeVisible(age12,'combat','Take fight'),'combat training can appear at 12 while fights stay hidden');
  const age13State=stateAt(13);ok(specialActionAgeVisible(age13State,'music','Release song'),'music release appears at 13');
  const age14State=stateAt(14);ok(specialPathAgeVisible(age14State,'modeling')&&specialActionAgeVisible(age14State,'acting','Audition'),'modeling and professional acting audition appear at 14');
  const age16State=stateAt(16);ok(specialPathAgeVisible(age16State,'racing')&&specialActionAgeVisible(age16State,'combat','Take fight'),'motorsport and sanctioned combat appear at 16');
  const age18State=stateAt(18);ok(specialPathAgeVisible(age18State,'military')&&specialPathAgeVisible(age18State,'crimeOrg')&&specialActionAgeVisible(age18State,'sports','Seek pro contract'),'adult service, organization, and professional sports surfaces appear at 18');
  const age21State=stateAt(21);ok(specialPathAgeVisible(age21State,'directing')&&!specialPathAgeVisible(age21State,'politics'),'directing appears at 21 while politics remains hidden');
  const age25State=stateAt(25);ok(specialPathAgeVisible(age25State,'politics'),'politics appears at 25');
  const nonRoyal=stateAt(30);ok(!specialPathAgeVisible(nonRoyal,'royalty'),'royalty card stays hidden for non-royal characters');nonRoyal.flags.royalBirth=true;ok(specialPathAgeVisible(nonRoyal,'royalty'),'royalty card appears for a royal-born character');
  const legacy=stateAt(5);legacy.specialCareers.racing={active:true};ok(specialPathAgeVisible(legacy,'racing'),'existing career state remains visible even below a modern presentation threshold');
  ok(!schoolGroupAgeVisible(9,12,false)&&schoolGroupAgeVisible(12,12,false)&&schoolGroupAgeVisible(9,12,true),'school groups hide until minimum age but preserve already joined legacy membership');

  return checks;
}
