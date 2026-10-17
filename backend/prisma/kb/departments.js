const { ADMISSION_FEE } = require('./facts');

const FACULTIES = {
  eng: { name: 'Engineering', unit: 'A', building: 'Engineering Building', fee: '7,500' },
  sci: { name: 'Science', unit: 'A', building: 'Science Building 1', fee: '6,000' },
  life: { name: 'Life and Earth Science', unit: 'A', building: 'Science Building 2', fee: '6,000' },
  agri: { name: 'Agriculture', unit: 'A', building: 'Agriculture Building', fee: '6,000' },
  arts: { name: 'Arts', unit: 'B', building: 'Arts Building', fee: '4,500' },
  fine: { name: 'Fine Arts', unit: 'B', building: 'Fine Arts Building', fee: '4,500' },
  social: { name: 'Social Science', unit: 'B', building: 'Social Science Building', fee: '4,500' },
  law: { name: 'Law', unit: 'B', building: 'Law Building', fee: '4,500' },
  bus: { name: 'Business Studies', unit: 'C', building: 'Business Studies Building', fee: '5,500' },
};

const DEPARTMENTS = [
  ['CSE', 'Computer Science and Engineering', 'eng', 120, 150, 'BSc Engineering', 4, 'HSC te Math o Physics e minimum A grade thakte hobe', 'software engineer, web/app developer, data scientist, AI/ML engineer o network engineer hisebe deshe-bideshe kaj korar onek sujog ache', null],
  ['EEE', 'Electrical and Electronic Engineering', 'eng', 120, 260, 'BSc Engineering', 4, 'HSC te Math o Physics e minimum A grade thakte hobe', 'power plant, power distribution company, telecom company, electronics o automation industry te engineer hisebe kaj korte paro', null],
  ['ICE', 'Information and Communication Engineering', 'eng', 60, 520, 'BSc Engineering', 4, 'HSC te Math o Physics e minimum A- grade thakte hobe', 'telecom operator, ISP, network company o software company te kaj korar sujog ache', null],
  ['Civil Engineering', 'Civil Engineering', 'eng', 60, 380, 'BSc Engineering', 4, 'HSC te Math o Physics e minimum A grade thakte hobe', 'construction firm, LGED, PWD, Roads and Highways o consultancy firm e civil engineer hisebe kaj korte paro', null],
  ['Mechanical Engineering', 'Mechanical Engineering', 'eng', 60, 450, 'BSc Engineering', 4, 'HSC te Math o Physics e minimum A grade thakte hobe', 'factory, power plant, garments o manufacturing industry te mechanical engineer hisebe kaj korte paro', null],
  ['MSE', 'Materials Science and Engineering', 'eng', 50, 900, 'BSc Engineering', 4, 'HSC te Physics, Chemistry o Math e minimum A- grade thakte hobe', 'steel, ceramic, glass, cement, semiconductor industry o research lab e kaj korar sujog ache', null],
  ['ACCE', 'Applied Chemistry and Chemical Engineering', 'eng', 60, 820, 'BSc Engineering', 4, 'HSC te Chemistry o Math e minimum A- grade thakte hobe', 'pharmaceutical, fertilizer, food, textile o oil-gas industry te chemical engineer hisebe kaj korte paro', null],
  ['Architecture', 'Architecture', 'eng', 40, 600, 'BArch', 5, 'HSC te Math o Physics e minimum A- grade thakte hobe', 'architecture firm, real estate company o city development authority te architect hisebe kaj korte paro', 'drawing test (MCQ result er por main campus e hoy)'],
  ['Physics', 'Physics', 'sci', 120, 1100, 'BSc (Hons)', 4, 'HSC te Physics o Math e minimum B+ grade thakte hobe', 'research, teaching, atomic energy commission, meteorology o medical physics e kaj korar sujog ache', null],
  ['Chemistry', 'Chemistry', 'sci', 120, 980, 'BSc (Hons)', 4, 'HSC te Chemistry o Math e minimum B+ grade thakte hobe', 'pharmaceutical, chemical industry, research lab, quality control o teaching e kaj korte paro', null],
  ['Math', 'Mathematics', 'sci', 150, 1400, 'BSc (Hons)', 4, 'HSC te Math e minimum A- grade thakte hobe', 'teaching, research, banking, actuarial, data analysis o software field e kaj korte paro', null],
  ['Statistics', 'Statistics', 'sci', 100, 1250, 'BSc (Hons)', 4, 'HSC te Math e minimum B+ grade thakte hobe', 'data analyst, Bureau of Statistics, research organization, NGO o bank e onek chahida ache', null],
  ['Applied Math', 'Applied Mathematics', 'sci', 60, 1600, 'BSc (Hons)', 4, 'HSC te Math e minimum A- grade thakte hobe', 'modeling, data science, banking, research o teaching e kaj korte paro', null],
  ['Geography', 'Geography and Environmental Studies', 'sci', 80, 1900, 'BSc (Hons)', 4, null, 'urban planning, GIS, disaster management, NGO o environment department e kaj korte paro', null],
  ['Psychology', 'Psychology', 'sci', 70, 1800, 'BSc (Hons)', 4, 'HSC te Biology ba Math er jekono ekta te minimum B grade thakte hobe', 'counselor, clinical psychologist (masters er por), HR, NGO o research e kaj korte paro', null],
  ['Botany', 'Botany', 'life', 100, 2100, 'BSc (Hons)', 4, 'HSC te Biology te minimum B+ grade thakte hobe', 'agriculture research, forest department, biotech company, NGO o teaching e kaj korte paro', null],
  ['Zoology', 'Zoology', 'life', 100, 2000, 'BSc (Hons)', 4, 'HSC te Biology te minimum B+ grade thakte hobe', 'fisheries, wildlife, environment, research institute o teaching e kaj korte paro', null],
  ['Biochemistry (BMB)', 'Biochemistry and Molecular Biology', 'life', 60, 700, 'BSc (Hons)', 4, 'HSC te Chemistry o Biology te minimum A- grade thakte hobe', 'pharmaceutical, biotech, hospital lab o research e kaj korar sujog ache, bidesh e higher study er scholarship o pawa jay', null],
  ['Microbiology', 'Microbiology', 'life', 50, 800, 'BSc (Hons)', 4, 'HSC te Biology o Chemistry te minimum A- grade thakte hobe', 'pharmaceutical, food industry, hospital diagnostic lab o research institute e kaj korte paro', null],
  ['Genetic Engineering (GEB)', 'Genetic Engineering and Biotechnology', 'life', 50, 650, 'BSc (Hons)', 4, 'HSC te Biology o Chemistry te minimum A- grade thakte hobe', 'biotech company, pharmaceutical, agriculture research, forensic lab o bidesh e higher study er sujog ache', null],
  ['Pharmacy', 'Pharmacy', 'life', 60, 300, 'BPharm (Hons)', 4, 'HSC te Chemistry o Biology te minimum A grade thakte hobe', 'pharmaceutical company (production, QC, marketing), hospital pharmacy o drug administration e kaj korte paro', null],
  ['Geology', 'Geology and Mining', 'life', 60, 1700, 'BSc (Hons)', 4, 'HSC te Physics, Chemistry o Math e minimum B grade thakte hobe', 'oil-gas company, geological survey, mining company o energy sector e kaj korte paro', null],
  ['Population Science', 'Population Science and Human Resource Development', 'life', 60, 2400, 'BSc (Hons)', 4, null, 'NGO, health program, development organization, research o HR e kaj korte paro', null],
  ['Fisheries', 'Fisheries', 'agri', 60, 2300, 'BSc Fisheries (Hons)', 4, 'HSC te Biology te minimum B grade thakte hobe', 'Department of Fisheries, hatchery, fish feed company, research institute o NGO te kaj korte paro', null],
  ['Veterinary (DVM)', 'Veterinary and Animal Sciences', 'agri', 60, 1500, 'DVM', 5, 'HSC te Biology o Chemistry te minimum B+ grade thakte hobe', 'veterinary surgeon, Department of Livestock, poultry/dairy farm, feed company o research e kaj korte paro', null],
  ['Agriculture', 'Agriculture', 'agri', 100, 1300, 'BSc Ag (Hons)', 4, 'HSC te Biology o Chemistry te minimum B grade thakte hobe', 'Department of Agricultural Extension, agriculture research institute, seed o fertilizer company te kaj korte paro', null],
  ['Bangla', 'Bangla', 'arts', 120, 900, 'BA (Hons)', 4, 'HSC te Bangla te minimum B grade thakte hobe', 'teaching, journalism, publishing, media, BCS o research e kaj korte paro', null],
  ['English', 'English', 'arts', 100, 300, 'BA (Hons)', 4, 'HSC te English e minimum A- grade thakte hobe', 'teaching, media, corporate communication, NGO, BCS o English training e kaj korar onek sujog ache', null],
  ['Arabic', 'Arabic', 'arts', 100, 2600, 'BA (Hons)', 4, null, 'teaching, translation, Middle East er company/embassy, research o BCS e kaj korte paro', null],
  ['Islamic Studies', 'Islamic Studies', 'arts', 120, 2800, 'BA (Hons)', 4, null, 'teaching, Islamic banking, research o BCS e kaj korte paro', null],
  ['History', 'History', 'arts', 120, 1800, 'BA (Hons)', 4, null, 'teaching, archaeology, museum, research, journalism o BCS e kaj korte paro', null],
  ['Islamic History (IHC)', 'Islamic History and Culture', 'arts', 100, 2500, 'BA (Hons)', 4, null, 'teaching, archaeology department, museum, research o BCS e kaj korte paro', null],
  ['Philosophy', 'Philosophy', 'arts', 110, 2200, 'BA (Hons)', 4, null, 'teaching, research, writing, NGO o BCS e kaj korte paro', null],
  ['Sanskrit', 'Sanskrit', 'arts', 60, 3000, 'BA (Hons)', 4, null, 'teaching, research, translation o BCS e kaj korte paro', null],
  ['Persian', 'Persian Language and Literature', 'arts', 60, 3100, 'BA (Hons)', 4, null, 'teaching, translation, research, embassy o BCS e kaj korte paro', null],
  ['Music', 'Music', 'fine', 30, 1400, 'BA (Hons)', 4, null, 'music teacher, performer, composer, media o cultural organization e kaj korte paro', 'practical test (gaan gaoa ba badyojontro bajano)'],
  ['Theatre', 'Theatre and Performance Studies', 'fine', 30, 1500, 'BA (Hons)', 4, null, 'actor, director, script writer, TV production o cultural organization e kaj korte paro', 'practical test o viva'],
  ['Fine Arts', 'Fine Arts', 'fine', 60, 1300, 'BFA (Hons)', 4, null, 'graphic designer, illustrator, animator, art teacher o advertising agency te kaj korte paro', 'drawing test'],
  ['Economics', 'Economics', 'social', 120, 250, 'BSS (Hons)', 4, 'HSC te English e minimum B grade ar SSC ba HSC te Math thakte hobe', 'bank, central bank, research organization, NGO, development sector o BCS e onek chahida ache', null],
  ['Political Science', 'Political Science', 'social', 120, 700, 'BSS (Hons)', 4, null, 'BCS, research, journalism, NGO o international organization e kaj korte paro', null],
  ['Sociology', 'Sociology', 'social', 110, 800, 'BSS (Hons)', 4, null, 'NGO, development sector, research, social program o BCS e kaj korte paro', null],
  ['Social Work', 'Social Work', 'social', 110, 1200, 'BSS (Hons)', 4, null, 'NGO, hospital social work, development program o Department of Social Services e kaj korte paro', null],
  ['Anthropology', 'Anthropology', 'social', 60, 1600, 'BSS (Hons)', 4, null, 'research, NGO, development project o international organization e kaj korte paro', null],
  ['Journalism (MCJ)', 'Mass Communication and Journalism', 'social', 60, 350, 'BSS (Hons)', 4, 'HSC te English e minimum B grade thakte hobe', 'journalist, news presenter, content creator, PR, advertising o media house e kaj korte paro', null],
  ['Public Administration', 'Public Administration', 'social', 80, 500, 'BSS (Hons)', 4, 'HSC te English e minimum B grade thakte hobe', 'BCS (admin cadre), govt office, NGO, policy research o corporate HR e kaj korte paro', null],
  ['Library Management (ISLM)', 'Information Science and Library Management', 'social', 80, 2000, 'BSS (Hons)', 4, null, 'library, archive, documentation center, information management o research e kaj korte paro', null],
  ['Folklore', 'Folklore', 'social', 60, 2700, 'BSS (Hons)', 4, null, 'research, cultural organization, media, museum o teaching e kaj korte paro', null],
  ['Law', 'Law', 'law', 120, 150, 'LLB (Hons)', 4, 'HSC te English e minimum B+ grade thakte hobe', 'advocate (Bar Council exam er por), judicial service, legal adviser o corporate legal department e kaj korte paro', null],
  ['Accounting (AIS)', 'Accounting and Information Systems', 'bus', 120, 200, 'BBA', 4, 'HSC te English e minimum B grade thakte hobe', 'accountant, auditor, CA/CMA, bank, multinational company o finance department e onek chahida ache', null],
  ['Management', 'Management Studies', 'bus', 120, 350, 'BBA', 4, null, 'HR, operations, bank, multinational o local company te management trainee hisebe kaj korte paro', null],
  ['Finance', 'Finance', 'bus', 120, 300, 'BBA', 4, 'HSC te English e minimum B grade thakte hobe', 'bank, investment company, stock market, insurance o corporate finance e kaj korte paro', null],
  ['Marketing', 'Marketing', 'bus', 120, 450, 'BBA', 4, null, 'brand management, sales, digital marketing, advertising o multinational company te kaj korte paro', null],
  ['Banking and Insurance', 'Banking and Insurance', 'bus', 100, 700, 'BBA', 4, null, 'bank, insurance company, microfinance o financial institution e kaj korte paro', null],
  ['Tourism (THM)', 'Tourism and Hospitality Management', 'bus', 60, 1000, 'BBA', 4, 'HSC te English e minimum B grade thakte hobe', 'hotel, resort, airline, travel agency o tour operator e kaj korte paro', null],
].map(([short, name, facultyKey, seats, merit, degree, years, requirement, career, extraTest], index) => ({
  short, name, seats, merit, degree, years, requirement, career, extraTest,
  label: short === name ? name : `${name} (${short})`,
  faculty: FACULTIES[facultyKey],
  unit: FACULTIES[facultyKey].unit,
  floor: (index % 5) + 1,
}));

// Vary the question wording
const pick = (options, index) => options[index % options.length];

function departmentEntries(d, i) {
  const otherGroups = {
    A: [`Arts ba Commerce theke ki ${d.short} e porte parbo?`, `Na, ${d.label} A unit er department, tai shudhu Science group er student ra ekhane porte parbe.`],
    B: [`Science ba Commerce theke ki ${d.short} porte parbo?`, `Haan, B unit e shob group (Science, Humanities, Business) er student apply korte pare, tai jekono group theke ${d.label} e porte parbe.`],
    C: [`Science ba Arts theke ki ${d.short} porte parbo?`, `Haan, C unit e shob group er student apply korte pare. Business group na holeo ${d.label} e porte parbe.`],
  }[d.unit];

  return [
    {
      category: 'Seats',
      question: pick([`${d.short} e koyta seat ache?`, `${d.short} department e mot seat koto?`, `${d.short} e koto jon student vorti ney?`], i),
      answer: `${d.label} department e mot ${d.seats} ta seat ache. ${d.unit} unit er merit list theke ei seat gulote student vorti kora hoy.`,
    },
    {
      category: 'Eligibility',
      question: pick([`${d.short} e porte ki requirement lagbe?`, `${d.short} e vorti hote koto GPA lage?`, `${d.short} pete ki ki joggota lage?`], i),
      answer: `${d.label} e porar requirement: SSC o HSC mile minimum GPA 7.00 lagbe (proti ta te alada kore minimum 3.50). ` +
        (d.requirement ? `Er sathe ${d.requirement}.` : `Er baire ${d.short} er jonno alada kono subject requirement nai.`),
    },
    {
      category: 'Departments',
      question: pick([`${d.short} e porte kon unit e exam dite hobe?`, `${d.short} kon unit er under e?`], i),
      answer: `${d.label} ${d.unit} unit er department, ${d.faculty.name} faculty er under e. Tai ${d.short} e porte chaile ${d.unit} unit e apply kore exam dite hobe.`,
    },
    {
      category: 'Departments',
      question: pick([`${d.short} er course koto bochorer?`, `${d.short} e koyta semester?`, `${d.short} porle ki degree pabo?`], i),
      answer: `${d.label} e ${d.degree} degree deya hoy. Course ${d.years} bochorer, mot ${d.years * 2} ta semester.`,
    },
    {
      category: 'Fees',
      question: pick([`${d.short} e semester fee koto?`, `${d.short} e porte proti semester e koto taka lage?`], i),
      answer: `${d.label} e proti semester er fee prai ${d.faculty.fee} taka (tuition, lab o exam fee shoho). Vortir somoy ekbar admission fee prai ${ADMISSION_FEE} taka dite hoy, jar moddhe 1st semester er fee dhora ache.`,
    },
    {
      category: 'Departments',
      question: pick([`${d.short} department kothay?`, `${d.short} er office kon building e?`], i),
      answer: `${d.label} department er office ${d.faculty.building} er ${d.floor} tolay. Office khola thake Sunday theke Thursday, sokal 9 ta theke bikal 4 ta.`,
    },
    {
      category: 'Results',
      question: pick([`${d.short} pete merit e koto position lage?`, `Gotobar ${d.short} er sesh merit position koto chilo?`], i),
      answer: `Gotobar ${d.unit} unit e ${d.label} er sesh merit position chilo prai ${d.merit}. Eta proti bochor seat, student der choice o result er upor change hoy.`,
    },
    { category: 'Eligibility', question: otherGroups[0], answer: otherGroups[1] },
    {
      category: 'Departments',
      question: pick([`${d.short} porle ki chakri pabo?`, `${d.short} er career scope kemon?`], i),
      answer: `${d.label} porar por ${d.career}. Er pashapashi BCS o onnano govt job e o apply korte parbe.`,
    },
    {
      category: 'Exam',
      question: pick([`${d.short} e ki alada kono test ache?`, `${d.short} e vortir jonno ki practical ba viva lage?`], i),
      answer: d.extraTest
        ? `Haan. ${d.label} e ${d.unit} unit er MCQ exam er pore ekta ${d.extraTest} hoy. Ei test e pass korle tobei merit onujayi seat deya hoy.`
        : `Na, ${d.label} e alada kono test nai. ${d.unit} unit er MCQ exam er merit position diyei subject deya hoy.`,
    },
  ];
}

module.exports = {
  DEPARTMENTS,
  departmentKb: () => DEPARTMENTS.flatMap(departmentEntries),
};
