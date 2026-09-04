import type { IllnessDefinition } from '../types/content';

type Category = IllnessDefinition['category'];
type Preset = Omit<IllnessDefinition,'id'|'name'|'category'>;

const presets: Record<Category, Preset> = {
  common: { minAge:1, prevalence:.025, severityRange:[8,30], healthDrain:2, mortalityFactor:.002, chronicChance:.04, treatmentCost:180, treatmentEffectiveness:.88 },
  chronic: { minAge:8, prevalence:.005, severityRange:[18,52], healthDrain:5, mortalityFactor:.006, chronicChance:.90, treatmentCost:1200, treatmentEffectiveness:.58 },
  genetic: { minAge:0, prevalence:.0018, severityRange:[20,60], healthDrain:6, mortalityFactor:.008, chronicChance:.96, treatmentCost:1800, treatmentEffectiveness:.45 },
  infectious: { minAge:1, prevalence:.009, severityRange:[15,55], healthDrain:6, mortalityFactor:.008, chronicChance:.07, treatmentCost:650, treatmentEffectiveness:.75 },
  mental_wellness: { minAge:10, prevalence:.008, severityRange:[15,55], healthDrain:2, mortalityFactor:.001, chronicChance:.55, treatmentCost:900, treatmentEffectiveness:.62 },
  injury: { minAge:3, prevalence:.010, severityRange:[12,68], healthDrain:5, mortalityFactor:.006, chronicChance:.12, treatmentCost:1100, treatmentEffectiveness:.78 },
  age_related: { minAge:48, prevalence:.012, severityRange:[18,70], healthDrain:7, mortalityFactor:.014, chronicChance:.82, treatmentCost:1700, treatmentEffectiveness:.48 },
};

const conditionNames: Record<Category,string[]> = {
  common: [
    'Seasonal Cold','Stomach Bug','Sinus Infection','Ear Infection','Tension Headache','Migraine Episode','Allergic Flare','Mild Bronchitis',
    'Throat Infection','Foodborne Illness','Skin Rash','Eye Infection','Dehydration','Heat Exhaustion','Motion Sickness','Sleep Disruption',
    'Minor Gastritis','Muscle Strain','Back Spasm','Dental Infection'
  ],
  chronic: [
    'Asthma','Hypertension','Type 2 Diabetes','Chronic Migraine','Arthritis','Chronic Back Pain','Eczema','Chronic Sinusitis','Digestive Disorder',
    'Thyroid Disorder','Chronic Fatigue Condition','Inflammatory Joint Condition','Kidney Disorder','Liver Disorder','Cardiac Rhythm Disorder','Autoimmune Condition'
  ],
  genetic: [
    'Inherited Blood Disorder','Congenital Heart Condition','Hereditary Vision Condition','Inherited Hearing Condition','Metabolic Genetic Condition',
    'Connective Tissue Disorder','Inherited Clotting Disorder','Familial Cholesterol Disorder','Hereditary Kidney Condition','Neuromuscular Genetic Condition'
  ],
  infectious: [
    'Seasonal Flu','Viral Pneumonia','Bacterial Pneumonia','Glandular Fever','Viral Fever','Intestinal Infection','Respiratory Infection',
    'Tropical Fever','Contagious Rash Illness','Whooping Cough','Viral Gastroenteritis','Bacterial Gastroenteritis','Tick-Borne Infection','Waterborne Infection','Travel Fever'
  ],
  mental_wellness: [
    'Anxiety Condition','Depressive Episode','Panic Disorder','Burnout','Chronic Insomnia','Social Anxiety','Grief Complication','Trauma Stress Condition',
    'Attention Regulation Condition','Compulsive Behavior Condition','Eating Wellness Condition','Mood Regulation Condition','Work Stress Syndrome','Academic Burnout','Adjustment Disorder'
  ],
  injury: [
    'Sprained Ankle','Broken Wrist','Broken Arm','Broken Leg','Shoulder Dislocation','Knee Ligament Injury','Concussion','Rib Fracture','Back Injury','Neck Strain',
    'Torn Muscle','Achilles Injury','Foot Fracture','Hand Fracture','Hip Injury','Sports Overuse Injury','Workplace Injury','Cycling Injury','Vehicle Accident Injury','Household Accident Injury'
  ],
  age_related: [
    'Age-Related Hearing Loss','Age-Related Vision Loss','Osteoporosis','Degenerative Joint Condition','Memory Decline','Cardiovascular Disease','Chronic Kidney Decline',
    'Chronic Lung Decline','Frailty Syndrome','Balance Disorder','Age-Related Muscle Loss','Cataracts','Glaucoma','Vascular Condition','Late-Life Sleep Disorder','Mobility Decline'
  ],
};

const tweaks: Record<string, Partial<Preset>> = {
  'Seasonal Cold': { prevalence:.05, healthDrain:1, mortalityFactor:0, treatmentCost:80, treatmentEffectiveness:.95 },
  'Hypertension': { minAge:25, chronicChance:.98 },
  'Type 2 Diabetes': { minAge:20, chronicChance:.99 },
  'Congenital Heart Condition': { minAge:0, mortalityFactor:.018 },
  'Concussion': { mortalityFactor:.008, chronicChance:.10 },
  'Vehicle Accident Injury': { severityRange:[25,85], mortalityFactor:.025, treatmentCost:4500 },
  'Cardiovascular Disease': { minAge:45, mortalityFactor:.035, healthDrain:10 },
  'Memory Decline': { minAge:62, healthDrain:5, chronicChance:.98 },
  'Frailty Syndrome': { minAge:70, healthDrain:8, mortalityFactor:.025 },
};

function slug(value:string) { return value.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }

export const illnesses: IllnessDefinition[] = (Object.entries(conditionNames) as Array<[Category,string[]]>).flatMap(([category,names]) =>
  names.map(name => ({ id:slug(name), name, category, ...presets[category], ...(tweaks[name] ?? {}) }))
);

export const illnessById = Object.fromEntries(illnesses.map(i => [i.id,i])) as Record<string,IllnessDefinition>;
