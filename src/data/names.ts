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
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Avery','Maya','Noah','Elena','Theo','Jordan','Lena','Miles','Amara','Elliot','Sophie','Kai','Iris','Rowan','Naomi','Caleb','Tessa','Julian','Nora','Ezra','Olivia','Emma','Charlotte','Amelia','Isla','Evelyn','Mia','Harper','Eleanor','Violet','Grace','Chloe','Hazel','Lucy','Stella','Alice','Ruby','Claire','Phoebe','Audrey','Madeline','Cora','Vivian','Georgia','June','Maeve','Sadie','Piper','Willow','Freya','Wren','Daisy','Eliza','Rosalie','Margot','Fiona','Gemma','Hallie','Brooke','Paige','Reese','Sydney','Cassidy','Jade','Keira','Molly','Delilah','Brielle','Willa','Zoe','Liam','Oliver','James','Henry','Jack','Leo','William','Ethan','Lucas','Mason','Benjamin','Alexander','Daniel','Samuel','Finn','Owen','Sebastian','Asher','Declan','Graham','Silas','Arthur','Simon','Cole','Dean','Grant','Jasper','Nolan','Reid','Wesley','Emmett','Logan','Parker','Quinn','Bennett','Micah','Gavin','Blake','Cameron','Dylan','Wyatt','Luke','Maxwell','Rhys','Tristan','Sage','River','Skyler','Emery','Phoenix'],
    last:['Bennett','Coleman','Hayes','Morgan','Reed','Foster','Sullivan','Brooks','Parker','Ellis','Warren','Monroe','Quinn','Harper','Blake','Carver','Dalton','Sawyer','Hale','Mercer','Adams','Anderson','Armstrong','Atkins','Baker','Barnes','Barrett','Bishop','Blackwood','Bradley','Bryant','Burke','Caldwell','Campbell','Carlisle','Chambers','Clark','Collins','Crawford','Cross','Dawson','Douglas','Dunn','Edwards','Everett','Fleming','Ford','Franklin','Gallagher','Gibson','Graham','Grant','Griffin','Hamilton','Hart','Hawthorne','Henderson','Holland','Hughes','Jennings','Kendall','Kennedy','Knight','Lawson','Lewis','Livingston','Lowe','Marshall','Mason','McCarthy','McKenna','Miller','Mitchell','Morris','Murphy','Nash','Nelson','Owens','Palmer','Pearson','Pierce','Porter','Prescott','Ramsey','Rhodes','Richards','Robertson','Ross','Russell','Sanders','Shaw','Sinclair','Spencer','Steele','Stone','Taylor','Thatcher','Thomas','Thornton','Vaughn','Walker','Wallace','Walsh','Watson','Webster','Wells','West','Whitaker','White','Whitney','Wilcox','Williams','Wilson','Winters','Wolfe','Wood','Wright','York','Young','Zimmer'],
    gendered:{
      female:['Maya','Elena','Jordan','Lena','Amara','Sophie','Iris','Naomi','Tessa','Nora','Olivia','Emma','Charlotte','Amelia','Isla','Evelyn','Mia','Harper','Eleanor','Violet','Grace','Chloe','Hazel','Lucy','Stella','Alice','Ruby','Claire','Phoebe','Audrey','Madeline','Cora','Vivian','Georgia','June','Maeve','Sadie','Piper','Willow','Freya','Wren','Daisy','Eliza','Rosalie','Margot','Fiona','Gemma','Hallie','Brooke','Paige','Reese','Sydney','Cassidy','Jade','Keira','Molly','Delilah','Brielle','Willa','Zoe'],
      male:['Noah','Theo','Miles','Elliot','Kai','Rowan','Caleb','Julian','Ezra','Liam','Oliver','James','Henry','Jack','Leo','William','Ethan','Lucas','Mason','Benjamin','Alexander','Daniel','Samuel','Finn','Owen','Sebastian','Asher','Declan','Graham','Silas','Arthur','Simon','Cole','Dean','Grant','Jasper','Nolan','Reid','Wesley','Emmett','Logan','Parker','Quinn','Bennett','Micah','Gavin','Blake','Cameron','Dylan','Wyatt','Luke','Maxwell','Rhys','Tristan'],
      nonbinary:['Avery','Sage','River','Skyler','Emery','Phoenix'],
    },
  },
  latin: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Lucía','Mateo','Camila','Diego','Sofía','Tomás','Valentina','Nicolás','Ana','Gabriel','Marina','Rafael','Elisa','Bruno','Clara','Javier','Renata','Andrés','Lola','Álex','Adriana','Alejandra','Alma','Beatriz','Belén','Carolina','Catalina','Cecilia','Daniela','Eva','Fernanda','Gabriela','Inés','Isabel','Jimena','Josefina','Julia','Laura','Lorena','Luisa','Manuela','Marta','Natalia','Paola','Pilar','Rocío','Sara','Teresa','Verónica','Victoria','Ximena','Abril','Aitana','Alba','Candela','Constanza','Emilia','Estela','Florencia','Guadalupe','Helena','Irene','Julieta','Leonor','Maite','Milagros','Noelia','Paloma','Raquel','Violeta','Alejandro','Álvaro','Antonio','Benjamín','Carlos','Cristóbal','Damián','Eduardo','Emilio','Esteban','Felipe','Fernando','Francisco','Héctor','Hugo','Ignacio','Iván','Joaquín','Jorge','José','Juan','Leonardo','Lorenzo','Luis','Manuel','Marcos','Mario','Miguel','Pablo','Pedro','Rodrigo','Salvador','Samuel','Santiago','Sebastián','Vicente','Agustín','César','Daniel','Elias','Gael','Gonzalo','Jerónimo','Leandro','Ramiro','Ariel','Cruz','Dani','Sol','Valen'],
    last:['García','Morales','Silva','Navarro','Rojas','Castillo','Vega','Torres','Mendoza','Romero','Santos','Cruz','Herrera','Medina','Flores','Ortega','Campos','Reyes','Paz','Ibarra','Acosta','Aguilar','Alonso','Álvarez','Arias','Benítez','Blanco','Bravo','Cabrera','Calderón','Cardenas','Carrasco','Carrillo','Castañeda','Castro','Contreras','Cordero','Correa','Delgado','Domínguez','Duarte','Escobar','Espinoza','Estrada','Ferrer','Fuentes','Gallardo','Gallegos','Giménez','Godoy','Gómez','González','Guerrero','Gutiérrez','León','Lozano','Luna','Maldonado','Márquez','Martínez','Molina','Montero','Montoya','Muñoz','Ocampo','Olivares','Ortiz','Pacheco','Palacios','Parra','Peña','Pereira','Pérez','Ponce','Prieto','Ramírez','Ramos','Ríos','Rivera','Rodríguez','Salazar','Salgado','Sánchez','Santana','Serrano','Soto','Suárez','Tapia','Valdés','Valencia','Valenzuela','Vargas','Vásquez','Velasco','Vidal','Villalba','Zamora','Zapata','Arce','Barrera','Bustamante','Cano','Carmona','Cuevas','Figueroa','Franco','Lara','Macias','Mercado','Mora','Nieto','Peralta','Quintero','Rosales','Sepúlveda','Treviño','Urbina','Varela','Yáñez','Zúñiga'],
    gendered:{
      female:['Lucía','Camila','Sofía','Valentina','Ana','Marina','Elisa','Clara','Renata','Lola','Adriana','Alejandra','Alma','Beatriz','Belén','Carolina','Catalina','Cecilia','Daniela','Eva','Fernanda','Gabriela','Inés','Isabel','Jimena','Josefina','Julia','Laura','Lorena','Luisa','Manuela','Marta','Natalia','Paola','Pilar','Rocío','Sara','Teresa','Verónica','Victoria','Ximena','Abril','Aitana','Alba','Candela','Constanza','Emilia','Estela','Florencia','Guadalupe','Helena','Irene','Julieta','Leonor','Maite','Milagros','Noelia','Paloma','Raquel','Violeta'],
      male:['Mateo','Diego','Tomás','Nicolás','Gabriel','Rafael','Bruno','Javier','Andrés','Alejandro','Álvaro','Antonio','Benjamín','Carlos','Cristóbal','Damián','Eduardo','Emilio','Esteban','Felipe','Fernando','Francisco','Héctor','Hugo','Ignacio','Iván','Joaquín','Jorge','José','Juan','Leonardo','Lorenzo','Luis','Manuel','Marcos','Mario','Miguel','Pablo','Pedro','Rodrigo','Salvador','Samuel','Santiago','Sebastián','Vicente','Agustín','César','Daniel','Elias','Gael','Gonzalo','Jerónimo','Leandro','Ramiro'],
      nonbinary:['Álex','Ariel','Cruz','Dani','Sol','Valen'],
    },
    legacyGenderByFirstName:{'Martín':'male'},
  },
  european: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Emilia','Lukas','Freja','Mila','Anton','Leonie','Hugo','Elsa','Niko','Clara','Felix','Ines','Marek','Anika','Jonas','Elise','Oskar','Mira','Noor','Sander','Anna','Sofia','Lina','Ida','Alma','Klara','Johanna','Louise','Mathilde','Frida','Greta','Liv','Astrid','Elin','Saga','Thea','Maja','Nora','Signe','Tuva','Lotte','Eva','Hanna','Laura','Pauline','Amelie','Celine','Sabine','Nina','Saskia','Lara','Chiara','Giulia','Elena','Lucia','Bianca','Alessia','Elisa','Petra','Katarina','Zuzana','Magda','Natalia','Irena','Ewa','Agnieszka','Kaja','Sonia','Vera','Daria','Matteo','Luca','Marco','Leon','Emil','Erik','Henrik','Johan','Axel','Magnus','Sven','Otto','Viktor','Mikkel','Anders','Leif','Tobias','Martin','David','Daniel','Thomas','Stefan','Niklas','Florian','Matthias','Raphael','Louis','Bastien','Julien','Maxime','Pierre','Enzo','Davide','Paolo','Andrea','Giorgio','Tomasz','Pavel','Jakub','Milan','Luka','Ivan','Dario','Matej','Kasper','Robin','Sascha','Noa','Lou','Mika'],
    last:['Berg','Weber','Novak','Lind','Moreau','Jansen','Keller','Rossi','Nowak','Dubois','Schmidt','Vos','Nielsen','Kovac','Müller','Costa','Larsen','Bauer','de Vries','Fischer','Andersson','Johansson','Karlsson','Eriksson','Larsson','Olsson','Persson','Svensson','Gustafsson','Pettersson','Hansen','Johansen','Olsen','Lund','Holm','Dahl','Nyberg','Ekström','Sjöberg','Ahlberg','Meyer','Wagner','Becker','Hoffmann','Schäfer','Koch','Richter','Klein','Wolf','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hartmann','Lange','Werner','Schmitz','Leroy','Bernard','Robert','Richard','Petit','Durand','Laurent','Simon','Michel','Lefebvre','Fontaine','Chevalier','Martinelli','Romano','Esposito','Conti','Ferrari','Ricci','Marino','Greco','Lombardi','Gallo','Kowalski','Kowalczyk','Wiśniewski','Wójcik','Kamiński','Lewandowski','Zieliński','Szymański','Dąbrowski','Kozłowski','Horvat','Babić','Marić','Petrović','Jovanović','Nikolić','Ilić','Marković','Pavlović','Vuković','Novotný','Svoboda','Dvořák','Černý','Procházka','Veselý','Kučera','Beneš','Němec','Pokorný','De Jong','Smit','Bakker','Visser','Mulder','Bos','Meijer','Dekker','Smeets','Verhoeven'],
    gendered:{
      female:['Emilia','Freja','Mila','Leonie','Elsa','Clara','Ines','Anika','Elise','Mira','Anna','Sofia','Lina','Ida','Alma','Klara','Johanna','Louise','Mathilde','Frida','Greta','Liv','Astrid','Elin','Saga','Thea','Maja','Nora','Signe','Tuva','Lotte','Eva','Hanna','Laura','Pauline','Amelie','Celine','Sabine','Nina','Saskia','Lara','Chiara','Giulia','Elena','Lucia','Bianca','Alessia','Elisa','Petra','Katarina','Zuzana','Magda','Natalia','Irena','Ewa','Agnieszka','Kaja','Sonia','Vera','Daria'],
      male:['Lukas','Anton','Hugo','Niko','Felix','Marek','Jonas','Oskar','Sander','Matteo','Luca','Marco','Leon','Emil','Erik','Henrik','Johan','Axel','Magnus','Sven','Otto','Viktor','Mikkel','Anders','Leif','Tobias','Martin','David','Daniel','Thomas','Stefan','Niklas','Florian','Matthias','Raphael','Louis','Bastien','Julien','Maxime','Pierre','Enzo','Davide','Paolo','Andrea','Giorgio','Tomasz','Pavel','Jakub','Milan','Luka','Ivan','Dario','Matej','Kasper'],
      nonbinary:['Noor','Robin','Sascha','Noa','Lou','Mika'],
    },
  },
  southAsian: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Aarav','Anaya','Ishaan','Meera','Rohan','Diya','Kabir','Aditi','Vihaan','Nisha','Arjun','Kavya','Dev','Tara','Kiran','Mira','Neil','Sana','Vikram','Riya','Aanya','Aarohi','Aisha','Akshara','Amrita','Anika','Anjali','Anushka','Avni','Bhavna','Charu','Deepika','Esha','Gauri','Ira','Ishita','Jhanvi','Juhi','Kajal','Khushi','Kirti','Lavanya','Mahi','Manya','Maya','Myra','Navya','Neha','Nikita','Pooja','Prisha','Priya','Radhika','Rhea','Ritika','Saanvi','Sakshi','Samaira','Shreya','Simran','Sneha','Tanvi','Trisha','Vaani','Vaishnavi','Vidya','Yamini','Zara','Zoya','Ayesha','Aditya','Akash','Akshay','Aman','Amit','Anirudh','Ankit','Aryan','Ashwin','Ayush','Dhruv','Harsh','Karan','Kartik','Krish','Kunal','Manav','Mohit','Naveen','Nikhil','Nirav','Pranav','Rahul','Raj','Rishi','Ritvik','Rudra','Sameer','Sanjay','Shaan','Shiv','Siddharth','Suraj','Varun','Ved','Yash','Zain','Ayaan','Darsh','Eshan','Hriday','Jai','Laksh','Om','Parth','Arya','Adi','Rumi','Samar','Tej'],
    last:['Sharma','Patel','Mehta','Rao','Kapoor','Iyer','Singh','Nair','Desai','Gupta','Bose','Joshi','Malhotra','Khan','Reddy','Menon','Verma','Sethi','Bhat','Kulkarni','Agarwal','Arora','Bajaj','Banerjee','Basu','Bedi','Bhalla','Bharadwaj','Chandra','Chatterjee','Chaudhary','Chopra','Das','Dutta','Gandhi','Garg','Ghosh','Gill','Goyal','Grover','Jain','Jha','Kaul','Khanna','Kohli','Krishnan','Lal','Madan','Mathur','Mishra','Mukherjee','Nagpal','Narayan','Pandey','Pillai','Puri','Rajput','Raman','Rana','Rastogi','Saxena','Sen','Shah','Shukla','Sinha','Sodhi','Subramanian','Tandon','Thakur','Tripathi','Vaid','Venkatesh','Yadav','Acharya','Adhikari','Bhandari','Bhatt','Dhawan','Dua','Goel','Hegde','Kashyap','Khatri','Kumar','Mahajan','Mani','Mitra','Naidu','Prasad','Rajan','Ranganathan','Roy','Sabharwal','Sarin','Sawant','Sekhon','Talwar','Walia','Anand','Batra','Bhatia','Chawla','Deol','Kaushik','Khurana','Lamba','Mangal','Mody','Narang','Oberoi','Pal','Parekh','Sachdev','Suri','Vohra','Wadhwa','Ahuja','Bakshi','Bhasin','Chahal'],
    gendered:{
      female:['Anaya','Meera','Diya','Aditi','Nisha','Kavya','Tara','Mira','Sana','Riya','Aanya','Aarohi','Aisha','Akshara','Amrita','Anika','Anjali','Anushka','Avni','Bhavna','Charu','Deepika','Esha','Gauri','Ira','Ishita','Jhanvi','Juhi','Kajal','Khushi','Kirti','Lavanya','Mahi','Manya','Maya','Myra','Navya','Neha','Nikita','Pooja','Prisha','Priya','Radhika','Rhea','Ritika','Saanvi','Sakshi','Samaira','Shreya','Simran','Sneha','Tanvi','Trisha','Vaani','Vaishnavi','Vidya','Yamini','Zara','Zoya','Ayesha'],
      male:['Aarav','Ishaan','Rohan','Kabir','Vihaan','Arjun','Dev','Neil','Vikram','Aditya','Akash','Akshay','Aman','Amit','Anirudh','Ankit','Aryan','Ashwin','Ayush','Dhruv','Harsh','Karan','Kartik','Krish','Kunal','Manav','Mohit','Naveen','Nikhil','Nirav','Pranav','Rahul','Raj','Rishi','Ritvik','Rudra','Sameer','Sanjay','Shaan','Shiv','Siddharth','Suraj','Varun','Ved','Yash','Zain','Ayaan','Darsh','Eshan','Hriday','Jai','Laksh','Om','Parth'],
      nonbinary:['Kiran','Arya','Adi','Rumi','Samar','Tej'],
    },
    legacyGenderByFirstName:{'Reyansh':'male'},
  },
  eastAsian: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Hana','Ren','Minji','Joon','Yuna','Haru','Mei','Kenji','Sora','Taeyang','Aiko','Jun','Nari','Riku','Yuri','Hyeon','Mina','Daichi','Aya','Seo-jun','Akari','Akiko','Asami','Chihiro','Emi','Emiko','Haruka','Hikari','Hinata','Kaori','Keiko','Kiko','Mai','Maki','Mao','Megumi','Miku','Misaki','Nanami','Reina','Rina','Risa','Saki','Sakura','Satomi','Shiori','Yui','Yuka','Yuki','Yumi','Ji-eun','Seo-yeon','Soo-jin','Hae-won','Eunji','Jiwon','Seoyeon','Chaewon','Dahyun','Yeji','Jia','Xinyi','Meilin','Liyun','Yue','Qian','Jing','Lan','Xia','Ying','Akira','Daisuke','Haruto','Hiro','Hiroki','Itsuki','Kaito','Kazuki','Kenta','Koji','Makoto','Masato','Naoki','Renji','Ryota','Shin','Shota','Souta','Takumi','Yuto','Hyun-woo','Ji-hoon','Min-jun','Sung-ho','Woo-jin','Jun-ho','Dong-hyun','Seung-min','Tae-hyun','Jae-hyun','Chen','Haoran','Jian','Junwei','Lei','Ming','Tao','Wei','Yichen','Zhen','Bo','Chao','Feng','Guang','Peng','Haneul','Yuu','Rin','Ari','Rei'],
    last:['Kim','Lee','Park','Sato','Tanaka','Suzuki','Watanabe','Ito','Nakamura','Yamamoto','Choi','Jung','Kang','Lim','Kobayashi','Kato','Yoshida','Yamada','Matsumoto','Inoue','Abe','Arai','Endo','Fujita','Fujiwara','Goto','Hasegawa','Hayashi','Ikeda','Ishii','Ishikawa','Kawasaki','Kondo','Maeda','Mori','Murakami','Nakajima','Nakano','Nishimura','Ogawa','Okada','Okamoto','Ono','Saito','Sasaki','Shimizu','Takahashi','Takeda','Takeuchi','Ueda','Yamaguchi','Aoki','Fukuda','Hashimoto','Hirano','Honda','Wada','Kawaguchi','Kinoshita','Kojima','Kubo','Matsuda','Miyazaki','Morita','Nakagawa','Nakayama','Ota','Sugiyama','Tamura','Yokoyama','Kwon','Yoon','Han','Shin','Jang','Ahn','Song','Hong','Moon','Baek','Bae','Hwang','Ryu','Jeon','Seo','Nam','Koo','Cha','Son','Oh','Heo','Guo','Huang','Liang','Lin','Liu','Lu','Pan','Qiao','Qin','Shen','Sun','Tang','Wang','Wu','Xu','Yang','Ye','Yu','Zhang','Zhao','Zhou','Cai','Deng','Fan','Gao','He','Jiang','Luo','Ma'],
    gendered:{
      female:['Hana','Minji','Yuna','Haru','Mei','Aiko','Nari','Yuri','Mina','Aya','Akari','Akiko','Asami','Chihiro','Emi','Emiko','Haruka','Hikari','Hinata','Kaori','Keiko','Kiko','Mai','Maki','Mao','Megumi','Miku','Misaki','Nanami','Reina','Rina','Risa','Saki','Sakura','Satomi','Shiori','Yui','Yuka','Yuki','Yumi','Ji-eun','Seo-yeon','Soo-jin','Hae-won','Eunji','Jiwon','Seoyeon','Chaewon','Dahyun','Yeji','Jia','Xinyi','Meilin','Liyun','Yue','Qian','Jing','Lan','Xia','Ying'],
      male:['Ren','Joon','Kenji','Taeyang','Jun','Riku','Hyeon','Daichi','Seo-jun','Akira','Daisuke','Haruto','Hiro','Hiroki','Itsuki','Kaito','Kazuki','Kenta','Koji','Makoto','Masato','Naoki','Renji','Ryota','Shin','Shota','Souta','Takumi','Yuto','Hyun-woo','Ji-hoon','Min-jun','Sung-ho','Woo-jin','Jun-ho','Dong-hyun','Seung-min','Tae-hyun','Jae-hyun','Chen','Haoran','Jian','Junwei','Lei','Ming','Tao','Wei','Yichen','Zhen','Bo','Chao','Feng','Guang','Peng'],
      nonbinary:['Sora','Haneul','Yuu','Rin','Ari','Rei'],
    },
  },
  african: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Amara','Kofi','Zuri','Thabo','Nia','Kwame','Amina','Tariq','Lebo','Imani','Sibusiso','Adaeze','Malik','Ayana','Tunde','Zola','Chidi','Mariam','Neo','Fatima','Abena','Abiola','Ada','Adanna','Adwoa','Aisha','Akosua','Amaka','Ayomide','Binta','Chioma','Efe','Folake','Ifunanya','Ijeoma','Khadija','Lerato','Malaika','Mandisa','Nandi','Ngozi','Nomsa','Oluchi','Onyinye','Sade','Simisola','Thandi','Wanjiku','Yaa','Zainab','Amahle','Buhle','Dineo','Fikile','Keitumetse','Lesedi','Lindiwe','Naledi','Noluthando','Palesa','Refilwe','Sibongile','Tebogo','Thandeka','Yewande','Zanele','Zinhle','Abeni','Eshe','Makena','Abel','Ade','Adewale','Ayo','Babatunde','Biko','Chibueze','Chinedu','Chuka','Emeka','Femi','Ikenna','Jabari','Jelani','Kamau','Kelechi','Kojo','Mandela','Musa','Nnamdi','Obinna','Olumide','Sani','Sekou','Sipho','Temba','Tendai','Thulani','Uche','Yared','Zuberi','Adekunle','Ayodele','Chima','Dayo','Ekon','Faraji','Gideon','Jomo','Kato','Lunga','Mandla','Mpho','Simba','Tau','Amani','Kosi','Kito','Tumi','Zolae'],
    last:['Okafor','Mensah','Dlamini','Ndlovu','Bello','Adebayo','Diallo','Kone','Mbeki','Abebe','Owusu','Kamara','Traore','Moyo','Nkosi','Afolayan','Eze','Bah','Kebede','Sow','Abiola','Adeyemi','Agbaje','Akintola','Balogun','Chukwu','Ekwueme','Ezeani','Ibrahim','Ifeanyi','Nwosu','Obi','Ogunleye','Okeke','Olawale','Olowu','Onyeka','Salami','Umeh','Yusuf','Boateng','Appiah','Asante','Badu','Darko','Frimpong','Gyasi','Ofori','Opoku','Quaye','Tetteh','Acheampong','Addo','Agyeman','Amoako','Antwi','Kwarteng','Nyarko','Prempeh','Twum','Mthembu','Khumalo','Mahlangu','Maseko','Mazibuko','Mkhize','Mokoena','Molefe','Motsepe','Ncube','Ngcobo','Ntuli','Sithole','Zulu','Radebe','Mabena','Mhlongo','Modise','Mosiane','Motaung','Kariuki','Kamau','Karanja','Kiptoo','Maina','Mwangi','Njoroge','Odhiambo','Omondi','Otieno','Wambui','Wanjiru','Alemu','Bekele','Demissie','Fikru','Gebre','Haile','Mengistu','Mekonnen','Tadesse','Tesfaye','Abdullahi','Abubakar','Bakare','Garba','Hassan','Lawal','Mohammed','Musa','Suleiman','Toure','Keita','Coulibaly','Diabaté','Fofana','Sy','Ba','Cissé','Gueye'],
    gendered:{
      female:['Amara','Zuri','Nia','Amina','Imani','Adaeze','Ayana','Zola','Mariam','Fatima','Abena','Abiola','Ada','Adanna','Adwoa','Aisha','Akosua','Amaka','Ayomide','Binta','Chioma','Efe','Folake','Ifunanya','Ijeoma','Khadija','Lerato','Malaika','Mandisa','Nandi','Ngozi','Nomsa','Oluchi','Onyinye','Sade','Simisola','Thandi','Wanjiku','Yaa','Zainab','Amahle','Buhle','Dineo','Fikile','Keitumetse','Lesedi','Lindiwe','Naledi','Noluthando','Palesa','Refilwe','Sibongile','Tebogo','Thandeka','Yewande','Zanele','Zinhle','Abeni','Eshe','Makena'],
      male:['Kofi','Thabo','Kwame','Tariq','Sibusiso','Malik','Tunde','Chidi','Neo','Abel','Ade','Adewale','Ayo','Babatunde','Biko','Chibueze','Chinedu','Chuka','Emeka','Femi','Ikenna','Jabari','Jelani','Kamau','Kelechi','Kojo','Mandela','Musa','Nnamdi','Obinna','Olumide','Sani','Sekou','Sipho','Temba','Tendai','Thulani','Uche','Yared','Zuberi','Adekunle','Ayodele','Chima','Dayo','Ekon','Faraji','Gideon','Jomo','Kato','Lunga','Mandla','Mpho','Simba','Tau'],
      nonbinary:['Lebo','Amani','Kosi','Kito','Tumi','Zolae'],
    },
  },
  mena: {
    // 120 active names preserve Everthread's default NPC gender odds exactly:
    // 60 female (50%), 54 male (45%), 6 nonbinary (5%).
    first:['Layla','Omar','Noor','Zayd','Mariam','Sami','Yasmin','Karim','Rania','Hadi','Salma','Adel','Dalia','Tariq','Nadia','Rami','Farah','Youssef','Lina','Maha','Aaliyah','Amani','Amal','Aya','Dana','Eman','Farida','Hala','Hanan','Hiba','Iman','Jana','Joud','Lama','Leen','Loubna','Malak','Maya','Mona','Nadine','Nawal','Nour','Rasha','Reem','Rima','Ruba','Sahar','Samira','Sana','Sara','Shahd','Yara','Zahra','Zeina','Asma','Basima','Dina','Ghada','Hind','Lamis','Marwa','Maysa','Nesrine','Razan','Ritaj','Samar','Sawsan','Tasneem','Wafa','Yasmine','Ahmad','Ali','Anas','Bassam','Bilal','Fadi','Faisal','Fares','Hassan','Ibrahim','Idris','Jamal','Khaled','Laith','Mahmoud','Marwan','Mazin','Mohamed','Mustafa','Nabil','Nadim','Nasser','Othman','Qais','Rashid','Saeed','Samir','Tamer','Walid','Yasin','Yusuf','Zain','Ziad','Amin','Basil','Emad','Firas','Hamza','Iyad','Kamal','Majid','Munir','Naim','Riad','Tawfiq','Rayan','Shams','Jude','Nuri','Rumi'],
    last:['Haddad','Nasser','Khalil','Mansour','Farouk','Rahman','Saleh','Aziz','Hamdan','Bakri','Saad','Najjar','Darwish','Hakim','Qasim','Fahmy','Amin','Hariri','Karam','Zaki','Abboud','Abdelrahman','Abidi','Akkad','Alami','Alavi','Almasri','Ansari','Assaf','Azzam','Badr','Barakat','Bashir','Bazzi','Chahine','Daher','Daoud','Eid','Fadel','Fakhoury','Ghanem','Habib','Hafez','Halabi','Safadi','Hamid','Harb','Hashem','Hassan','Hatem','Hourani','Ismail','Jaber','Kanaan','Kassem','Khoury','Malik','Masri','Matar','Mikhail','Moussa','Nader','Nasr','Nassar','Odeh','Osman','Qattan','Rahal','Rashid','Salameh','Salem','Samaha','Shami','Sharif','Sleiman','Younes','Zein','Zoghbi','Abbasi','Afshar','Ahmadi','Akbari','Amini','Azimi','Bahrami','Darvishi','Ebrahimi','Farhadi','Ghasemi','Hosseini','Jafari','Karimi','Kazemi','Mahmoudi','Mirzaei','Moradi','Najafi','Nazari','Rahimi','Rezaei','Rostami','Sadeghi','Shirazi','Soleimani','Taheri','Zarei','Al-Khatib','Al-Sayed','Al-Harbi','Al-Qahtani','Al-Rashid','Al-Zahrani','El-Masri','El-Sayed','Boustani','Bitar','Mansouri','Naccache','Tahan','Wehbe'],
    gendered:{
      female:['Layla','Mariam','Yasmin','Rania','Salma','Dalia','Nadia','Farah','Lina','Maha','Aaliyah','Amani','Amal','Aya','Dana','Eman','Farida','Hala','Hanan','Hiba','Iman','Jana','Joud','Lama','Leen','Loubna','Malak','Maya','Mona','Nadine','Nawal','Nour','Rasha','Reem','Rima','Ruba','Sahar','Samira','Sana','Sara','Shahd','Yara','Zahra','Zeina','Asma','Basima','Dina','Ghada','Hind','Lamis','Marwa','Maysa','Nesrine','Razan','Ritaj','Samar','Sawsan','Tasneem','Wafa','Yasmine'],
      male:['Omar','Zayd','Sami','Karim','Hadi','Adel','Tariq','Rami','Youssef','Ahmad','Ali','Anas','Bassam','Bilal','Fadi','Faisal','Fares','Hassan','Ibrahim','Idris','Jamal','Khaled','Laith','Mahmoud','Marwan','Mazin','Mohamed','Mustafa','Nabil','Nadim','Nasser','Othman','Qais','Rashid','Saeed','Samir','Tamer','Walid','Yasin','Yusuf','Zain','Ziad','Amin','Basil','Emad','Firas','Hamza','Iyad','Kamal','Majid','Munir','Naim','Riad','Tawfiq'],
      nonbinary:['Noor','Rayan','Shams','Jude','Nuri','Rumi'],
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
