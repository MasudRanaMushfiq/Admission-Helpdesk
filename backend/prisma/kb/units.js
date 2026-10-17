const { APPLICATION_FEE, PASS_MARK, RESULT_DAYS, SCORE_RULE } = require('./facts');
const { DEPARTMENTS } = require('./departments');

const UNITS = [
  {
    code: 'A',
    faculties: 'Engineering, Science, Life and Earth Science o Agriculture',
    groups: 'shudhu Science group er student ra',
    date: '20 December',
    subjects: 'Physics 25, Chemistry 25, Math 20, Biology 20 o English 10',
    syllabus: 'HSC er Physics, Chemistry, Math, Biology o English boi',
    resultDate: '4 January',
    extra: 'Er sathe HSC te Physics, Chemistry ar Math ba Biology thakte hobe.',
  },
  {
    code: 'B',
    faculties: 'Arts, Fine Arts, Social Science o Law',
    groups: 'Science, Humanities o Business - shob group er student ra',
    date: '21 December',
    subjects: 'Bangla 30, English 30 o General Knowledge 40',
    syllabus: 'HSC er Bangla o English boi, ar Bangladesh o international affairs er general knowledge',
    resultDate: '5 January',
    extra: 'Jekono group theke HSC pass korlei hobe.',
  },
  {
    code: 'C',
    faculties: 'Business Studies',
    groups: 'Science, Humanities o Business - shob group er student ra',
    date: '22 December',
    subjects: 'Accounting 25, Management 25, English 25 o Bangla 25',
    syllabus: 'HSC er Accounting, Business Organization and Management, English o Bangla boi',
    resultDate: '6 January',
    extra: 'Jekono group theke HSC pass korlei hobe, kintu exam e Accounting o Management er proshno answer korte hobe.',
  },
];

function unitEntries(u) {
  const departments = DEPARTMENTS.filter((d) => d.unit === u.code);
  const seats = departments.reduce((sum, d) => sum + d.seats, 0);
  const U = `${u.code} unit`;

  return [
    ['Exam', `${U} er exam kobe?`, `${U} er admission exam hobe ${u.date}, sokal 10:00 theke 11:30 porjonto. Exact time o room number admit card e deya thakbe.`],
    ['Exam', `${U} e kon kon subject theke proshno ashe?`, `${U} er exam e 100 ta MCQ thake: ${u.subjects}.`],
    ['Eligibility', `${U} e kon group er student apply korte parbe?`, `${U} e ${u.groups} apply korte parbe. ${u.extra}`],
    ['Seats', `${U} e mot koyta seat ache?`, `${U} e ${departments.length} ta department e mot ${seats} ta seat ache.`],
    ['Departments', `${U} e kon kon department ache?`, `${U} (${u.faculties}) er department gulo holo: ${departments.map((d) => d.short).join(', ')}.`],
    ['Fees', `${U} er application fee koto?`, `${U} er application fee ${APPLICATION_FEE} taka. Eta ferot deya hoy na.`],
    ['Exam', `${U} e pass mark koto?`, `${U} e 100 er moddhe minimum ${PASS_MARK} pele pass dhora hoy. Pass na korle merit list e naam ashe na.`],
    ['Exam', `${U} e ki negative marking ache?`, `Haan, ${U} e proti ta bhul uttor er jonno 0.25 number kete neya hoy. Uttor na dile kono number kata hoy na.`],
    ['Exam', `${U} er exam koto minute er?`, `${U} er exam 90 minute er, 100 ta MCQ proshno thake, proti ta 1 number.`],
    ['Exam', `${U} er syllabus ki?`, `${U} er syllabus holo ${u.syllabus}. Proshno HSC level er hoy.`],
    ['Results', `${U} er result kobe dibe?`, `${U} er result exam er ${RESULT_DAYS} din er moddhe, sombhoboto ${u.resultDate} e admission portal e publish kora hobe.`],
    ['Eligibility', `${U} e apply korte minimum GPA koto lagbe?`, `${U} e apply korte SSC o HSC mile minimum GPA 7.00 lagbe, ar proti ta te alada kore minimum 3.50. ${u.extra}`],
    ['Exam', `${U} er exam e reporting time koyta?`, `${U} er exam e sokal 9:30 er moddhe hall e dhukte hobe, mane exam shuru'r 30 minute age. 10 tar por kauke dhukte dewa hoy na.`],
    ['Eligibility', `${U} e ki second time exam dite parbo?`, `Haan, jodi tumi ager bochor HSC pass kore thako tahole ${U} e second time exam dite parbe. Second timer der kono number kata hoy na.`],
    ['Results', `${U} er merit list kivabe banano hoy?`, `${U} er merit list banano hoy final score diye: ${SCORE_RULE}. Jar score beshi, tar position age.`],
    ['Admission Process', `${U} er subject choice kobe dite hobe?`, `${U} er result er por 7 din er moddhe admission portal e login kore subject choice form fill up korte hobe.`],
  ].map(([category, question, answer]) => ({ category, question, answer }));
}

module.exports = { UNITS, unitKb: () => UNITS.flatMap(unitEntries) };
