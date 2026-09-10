import type { NpcGender } from '../types/reproduction';

type GenderedFirstNames = Record<NpcGender, readonly string[]>;

type NamePool = {
  first: readonly string[];
  last: readonly string[];
  gendered: GenderedFirstNames;
  legacyGenderByFirstName?: Readonly<Record<string,NpcGender>>;
};

const pools = {
  anglophone: {
    // 20 active names intentionally encode the default NPC gender odds exactly:
    // 10 female (50%), 9 male (45%), 1 nonbinary (5%).
    first:['Avery','Maya','Noah','Elena','Theo','Jordan','Lena','Miles','Amara','Elliot','Sophie','Kai','Iris','Rowan','Naomi','Caleb','Tessa','Julian','Nora','Ezra'],
    last:['Bennett','Coleman','Hayes','Morgan','Reed','Foster','Sullivan','Brooks','Parker','Ellis','Warren','Monroe','Quinn','Harper','Blake','Carver','Dalton','Sawyer','Hale','Mercer'],
    gendered:{
      female:['Maya','Elena','Jordan','Lena','Amara','Sophie','Iris','Naomi','Tessa','Nora'],
      male:['Noah','Theo','Miles','Elliot','Kai','Rowan','Caleb','Julian','Ezra'],
      nonbinary:['Avery'],
    },
  },
  latin: {
    first:['Lucía','Mateo','Camila','Diego','Sofía','Tomás','Valentina','Nicolás','Ana','Gabriel','Marina','Rafael','Elisa','Bruno','Clara','Javier','Renata','Andrés','Lola','Álex'],
    last:['García','Morales','Silva','Navarro','Rojas','Castillo','Vega','Torres','Mendoza','Romero','Santos','Cruz','Herrera','Medina','Flores','Ortega','Campos','Reyes','Paz','Ibarra'],
    gendered:{
      female:['Lucía','Camila','Sofía','Valentina','Ana','Marina','Elisa','Clara','Renata','Lola'],
      male:['Mateo','Diego','Tomás','Nicolás','Gabriel','Rafael','Bruno','Javier','Andrés'],
      nonbinary:['Álex'],
    },
    legacyGenderByFirstName:{'Martín':'male'},
  },
  european: {
    first:['Emilia','Lukas','Freja','Mila','Anton','Leonie','Hugo','Elsa','Niko','Clara','Felix','Ines','Marek','Anika','Jonas','Elise','Oskar','Mira','Noor','Sander'],
    last:['Berg','Weber','Novak','Lind','Moreau','Jansen','Keller','Rossi','Nowak','Dubois','Schmidt','Vos','Nielsen','Kovac','Müller','Costa','Larsen','Bauer','de Vries','Fischer'],
    gendered:{
      female:['Emilia','Freja','Mila','Leonie','Elsa','Clara','Ines','Anika','Elise','Mira'],
      male:['Lukas','Anton','Hugo','Niko','Felix','Marek','Jonas','Oskar','Sander'],
      nonbinary:['Noor'],
    },
  },
  southAsian: {
    first:['Aarav','Anaya','Ishaan','Meera','Rohan','Diya','Kabir','Aditi','Vihaan','Nisha','Arjun','Kavya','Dev','Tara','Kiran','Mira','Neil','Sana','Vikram','Riya'],
    last:['Sharma','Patel','Mehta','Rao','Kapoor','Iyer','Singh','Nair','Desai','Gupta','Bose','Joshi','Malhotra','Khan','Reddy','Menon','Verma','Sethi','Bhat','Kulkarni'],
    gendered:{
      female:['Anaya','Meera','Diya','Aditi','Nisha','Kavya','Tara','Mira','Sana','Riya'],
      male:['Aarav','Ishaan','Rohan','Kabir','Vihaan','Arjun','Dev','Neil','Vikram'],
      nonbinary:['Kiran'],
    },
    legacyGenderByFirstName:{'Reyansh':'male'},
  },
  eastAsian: {
    first:['Hana','Ren','Minji','Joon','Yuna','Haru','Mei','Kenji','Sora','Taeyang','Aiko','Jun','Nari','Riku','Yuri','Hyeon','Mina','Daichi','Aya','Seo-jun'],
    last:['Kim','Lee','Park','Sato','Tanaka','Suzuki','Watanabe','Ito','Nakamura','Yamamoto','Choi','Jung','Kang','Lim','Kobayashi','Kato','Yoshida','Yamada','Matsumoto','Inoue'],
    gendered:{
      female:['Hana','Minji','Yuna','Haru','Mei','Aiko','Nari','Yuri','Mina','Aya'],
      male:['Ren','Joon','Kenji','Taeyang','Jun','Riku','Hyeon','Daichi','Seo-jun'],
      nonbinary:['Sora'],
    },
  },
  african: {
    first:['Amara','Kofi','Zuri','Thabo','Nia','Kwame','Amina','Tariq','Lebo','Imani','Sibusiso','Adaeze','Malik','Ayana','Tunde','Zola','Chidi','Mariam','Neo','Fatima'],
    last:['Okafor','Mensah','Dlamini','Ndlovu','Bello','Adebayo','Diallo','Kone','Mbeki','Abebe','Owusu','Kamara','Traore','Moyo','Nkosi','Afolayan','Eze','Bah','Kebede','Sow'],
    gendered:{
      female:['Amara','Zuri','Nia','Amina','Imani','Adaeze','Ayana','Zola','Mariam','Fatima'],
      male:['Kofi','Thabo','Kwame','Tariq','Sibusiso','Malik','Tunde','Chidi','Neo'],
      nonbinary:['Lebo'],
    },
  },
  mena: {
    first:['Layla','Omar','Noor','Zayd','Mariam','Sami','Yasmin','Karim','Rania','Hadi','Salma','Adel','Dalia','Tariq','Nadia','Rami','Farah','Youssef','Lina','Maha'],
    last:['Haddad','Nasser','Khalil','Mansour','Farouk','Rahman','Saleh','Aziz','Hamdan','Bakri','Saad','Najjar','Darwish','Hakim','Qasim','Fahmy','Amin','Hariri','Karam','Zaki'],
    gendered:{
      female:['Layla','Mariam','Yasmin','Rania','Salma','Dalia','Nadia','Farah','Lina','Maha'],
      male:['Omar','Zayd','Sami','Karim','Hadi','Adel','Tariq','Rami','Youssef'],
      nonbinary:['Noor'],
    },
    legacyGenderByFirstName:{'Amir':'male'},
  },
} satisfies Record<string,NamePool>;

const regionMap: Record<string, keyof typeof pools> = {
  us:'anglophone', ca:'anglophone', gb:'anglophone', ie:'anglophone', au:'anglophone', nz:'anglophone',
  mx:'latin', br:'latin', ar:'latin', es:'latin', pt:'latin', it:'latin', cl:'latin',
  fr:'european', de:'european', nl:'european', be:'european', se:'european', no:'european', dk:'european', pl:'european', gr:'european', tr:'mena',
  in:'southAsian', jp:'eastAsian', kr:'eastAsian', ph:'eastAsian', sg:'eastAsian',
  za:'african', ng:'african', eg:'mena', ae:'mena'
};

function poolFor(countryId:string):NamePool {
  return pools[regionMap[countryId] ?? 'anglophone'];
}

export function getNamePool(countryId: string) {
  return poolFor(countryId);
}

export function getNpcFirstNames(countryId:string,gender:NpcGender):readonly string[] {
  return poolFor(countryId).gendered[gender];
}

export function npcGenderForFirstName(countryId:string,firstName:string):NpcGender|undefined {
  const pool=poolFor(countryId);
  for(const gender of ['female','male','nonbinary'] as const){
    if(pool.gendered[gender].includes(firstName))return gender;
  }
  return pool.legacyGenderByFirstName?.[firstName];
}

/** Exposed for deterministic regression of Everthread's default 50/45/5 NPC identity weighting. */
export function npcFirstNameGenderCounts(countryId:string):Record<NpcGender,number> {
  const pool=poolFor(countryId);
  return{female:pool.gendered.female.length,male:pool.gendered.male.length,nonbinary:pool.gendered.nonbinary.length};
}
