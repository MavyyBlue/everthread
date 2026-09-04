const pools = {
  anglophone: {
    first:['Avery','Maya','Noah','Elena','Theo','Jordan','Lena','Miles','Amara','Elliot','Sophie','Kai','Iris','Rowan','Naomi','Caleb','Tessa','Julian','Nora','Ezra'],
    last:['Bennett','Coleman','Hayes','Morgan','Reed','Foster','Sullivan','Brooks','Parker','Ellis','Warren','Monroe','Quinn','Harper','Blake','Carver','Dalton','Sawyer','Hale','Mercer']
  },
  latin: {
    first:['Lucía','Mateo','Camila','Diego','Sofía','Tomás','Valentina','Nicolás','Ana','Gabriel','Marina','Rafael','Elisa','Bruno','Clara','Javier','Renata','Andrés','Lola','Martín'],
    last:['García','Morales','Silva','Navarro','Rojas','Castillo','Vega','Torres','Mendoza','Romero','Santos','Cruz','Herrera','Medina','Flores','Ortega','Campos','Reyes','Paz','Ibarra']
  },
  european: {
    first:['Emilia','Lukas','Freja','Mila','Anton','Leonie','Hugo','Elsa','Niko','Clara','Felix','Ines','Marek','Anika','Jonas','Elise','Oskar','Mira','Noor','Sander'],
    last:['Berg','Weber','Novak','Lind','Moreau','Jansen','Keller','Rossi','Nowak','Dubois','Schmidt','Vos','Nielsen','Kovac','Müller','Costa','Larsen','Bauer','de Vries','Fischer']
  },
  southAsian: {
    first:['Aarav','Anaya','Ishaan','Meera','Rohan','Diya','Kabir','Aditi','Vihaan','Nisha','Arjun','Kavya','Dev','Tara','Reyansh','Mira','Neil','Sana','Vikram','Riya'],
    last:['Sharma','Patel','Mehta','Rao','Kapoor','Iyer','Singh','Nair','Desai','Gupta','Bose','Joshi','Malhotra','Khan','Reddy','Menon','Verma','Sethi','Bhat','Kulkarni']
  },
  eastAsian: {
    first:['Hana','Ren','Minji','Joon','Yuna','Haru','Mei','Kenji','Sora','Taeyang','Aiko','Jun','Nari','Riku','Yuri','Hyeon','Mina','Daichi','Aya','Seo-jun'],
    last:['Kim','Lee','Park','Sato','Tanaka','Suzuki','Watanabe','Ito','Nakamura','Yamamoto','Choi','Jung','Kang','Lim','Kobayashi','Kato','Yoshida','Yamada','Matsumoto','Inoue']
  },
  african: {
    first:['Amara','Kofi','Zuri','Thabo','Nia','Kwame','Amina','Tariq','Lebo','Imani','Sibusiso','Adaeze','Malik','Ayana','Tunde','Zola','Chidi','Mariam','Neo','Fatima'],
    last:['Okafor','Mensah','Dlamini','Ndlovu','Bello','Adebayo','Diallo','Kone','Mbeki','Abebe','Owusu','Kamara','Traore','Moyo','Nkosi','Afolayan','Eze','Bah','Kebede','Sow']
  },
  mena: {
    first:['Layla','Omar','Noor','Zayd','Mariam','Sami','Yasmin','Karim','Rania','Hadi','Salma','Adel','Dalia','Tariq','Nadia','Rami','Farah','Youssef','Lina','Amir'],
    last:['Haddad','Nasser','Khalil','Mansour','Farouk','Rahman','Saleh','Aziz','Hamdan','Bakri','Saad','Najjar','Darwish','Hakim','Qasim','Fahmy','Amin','Hariri','Karam','Zaki']
  }
} as const;

const regionMap: Record<string, keyof typeof pools> = {
  us:'anglophone', ca:'anglophone', gb:'anglophone', ie:'anglophone', au:'anglophone', nz:'anglophone',
  mx:'latin', br:'latin', ar:'latin', es:'latin', pt:'latin', it:'latin', cl:'latin',
  fr:'european', de:'european', nl:'european', be:'european', se:'european', no:'european', dk:'european', pl:'european', gr:'european', tr:'mena',
  in:'southAsian', jp:'eastAsian', kr:'eastAsian', ph:'eastAsian', sg:'eastAsian',
  za:'african', ng:'african', eg:'mena', ae:'mena'
};

export function getNamePool(countryId: string) {
  return pools[regionMap[countryId] ?? 'anglophone'];
}
