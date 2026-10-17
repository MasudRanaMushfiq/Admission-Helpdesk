const { APPLICATION_FEE, MIN_TOTAL_GPA, MIN_EACH_GPA } = require('./facts');

const entry = (category, question, answer) => ({ category, question, answer });

// ---------- Payment methods (3 entries each) ----------
const PAYMENTS = [
  ['bKash', 'bKash app e "Payment" option e giye'],
  ['Nagad', 'Nagad app e "Bill Pay" option e giye'],
  ['Rocket', 'Rocket app ba *322# dial kore "Bill Pay" option e giye'],
  ['Upay', 'Upay app e "Payment" option e giye'],
  ['Debit/Credit card', 'portal er payment page e Visa ba Mastercard select kore'],
  ['Internet banking', 'portal er payment page e nijer bank select kore'],
];

function paymentKb() {
  return PAYMENTS.flatMap(([method, how]) => [
    entry('Fees', `${method} diye kivabe application fee dibo?`, `Application submit korar por ${how} admission portal er dewa merchant/biller number ar tomar Application ID diye ${APPLICATION_FEE} taka pay korbe. Payment hole SMS ashbe.`),
    entry('Fees', `${method} e payment korle ki extra charge lage?`, `${method} e payment korle sadharonoto 1.5% er moto service charge lage, ja payment page e dekhano hoy. Application fee ${APPLICATION_FEE} taka er sathe ei charge jog hoy.`),
    entry('Fees', `${method} e taka kete geche kintu payment success dekhacche na, ki korbo?`, `24 ghonta opekkha koro, onek somoy status pore update hoy. Tarpor o na hole ${method} er transaction ID ar Application ID niye admission office er helpline e jogajog koro. Abar pay korar dorkar nai.`),
  ]);
}

// ---------- What can I take into the exam hall? ----------
const EXAM_ITEMS = [
  ['calculator', false, 'Calculator kono unit er exam e allowed na.'],
  ['mobile phone', false, 'Mobile phone hall e nishiddho. Mobile shoho dhora porle exam batil hobe.'],
  ['smart watch', false, 'Smart watch ba kono digital device allowed na.'],
  ['hater ghori (analog watch)', true, 'Shadharon analog ghori nite parbe, kintu smart ba digital watch na.'],
  ['kalo kalir ballpoint kolom', true, 'Haan, OMR fill up er jonno kalo kalir ballpoint kolom niye ashte hobe. Ekta extra kolom rakha bhalo.'],
  ['pencil o eraser', false, 'OMR sheet e pencil use kora jay na, tai pencil o eraser lagbe na.'],
  ['scale', false, 'Scale er dorkar nai, MCQ exam e scale allowed na.'],
  ['bag', false, 'Bag niye hall e dhuka jabe na. Bag bairer nirdishto jaygay rakhte hobe ba sathe na ana bhalo.'],
  ['earphone ba headphone', false, 'Earphone, headphone ba kono electronic device allowed na.'],
  ['panir botol', true, 'Transparent panir botol nite parbe, botol e kono lekha thakle hobe na.'],
  ['admit card', true, 'Admit card obosshoi niye ashte hobe. Admit card chara hall e dhukte dewa hobe na.'],
  ['HSC registration card', true, 'Haan, verification er jonno HSC registration card er original copy sathe rakhte hobe.'],
  ['wallet ba taka', true, 'Alpo taka o wallet rakha jay, kintu exam er somoy pocket e rakhte hobe.'],
  ['pen drive', false, 'Pen drive ba kono storage device allowed na.'],
  ['mask', true, 'Mask porte paro, kintu identity check er somoy mask khulte hobe.'],
];

function examItemKb() {
  return EXAM_ITEMS.map(([item, allowed, note]) =>
    entry('Exam', `Exam hall e ki ${item} nite parbo?`, `${allowed ? 'Haan' : 'Na'}. ${note}`),
  );
}

// ---------- Clubs (2 entries each) ----------
const CLUBS = [
  ['Debating Club', 'English o Bangla debate competition, workshop'],
  ['Science Club', 'science fair, olympiad o seminar'],
  ['Programming Club', 'programming contest, hackathon o coding workshop'],
  ['Robotics Club', 'robot banano, robotics competition o workshop'],
  ['Photography Club', 'photo walk, exhibition o photography workshop'],
  ['Cultural Club', 'gaan, nach, abritti o cultural program'],
  ['Sports Club', 'cricket, football, badminton o athletics tournament'],
  ['BNCC', 'military training, parade o national program e onsho neya'],
  ['Rover Scout', 'camping, volunteering o social service'],
  ['Blood Donation Club', 'blood donation campaign o emergency blood managing'],
];

function clubKb() {
  return CLUBS.flatMap(([club, activities]) => [
    entry('Campus Life', `Campus e ki ${club} ache?`, `Haan, campus e active ${club} ache. Ora ${activities} kore.`),
    entry('Campus Life', `${club} e kivabe join korbo?`, `Proti bochor 1st year er class shuru'r por ${club} member recruitment kore. TSC (student center) e tader booth theke ba Facebook page theke form fill up kore join korte parbe.`),
  ]);
}

// ---------- SSC + HSC GPA combinations ----------
const GPAS = [5.0, 4.75, 4.5, 4.25, 4.0, 3.75, 3.5, 3.25, 3.0];

function gpaKb() {
  const entries = [];
  for (const ssc of GPAS) {
    for (const hsc of [5.0, 4.5, 4.0, 3.5, 3.0]) {
      const total = ssc + hsc;
      const reasons = [];
      if (ssc < MIN_EACH_GPA) reasons.push(`SSC te minimum ${MIN_EACH_GPA.toFixed(2)} lagbe`);
      if (hsc < MIN_EACH_GPA) reasons.push(`HSC te minimum ${MIN_EACH_GPA.toFixed(2)} lagbe`);
      if (total < MIN_TOTAL_GPA) reasons.push(`duita mile minimum ${MIN_TOTAL_GPA.toFixed(2)} lagbe`);

      const answer = reasons.length === 0
        ? `SSC ${ssc.toFixed(2)} + HSC ${hsc.toFixed(2)} = ${total.toFixed(2)}. Haan, tumi apply korte parbe (lage mot 7.00, proti ta te 3.50).`
        : `SSC ${ssc.toFixed(2)} + HSC ${hsc.toFixed(2)} = ${total.toFixed(2)}. Dukkhito, tumi apply korte parbe na, karon ${reasons.join(' ar ')}.`;
      entries.push(entry('Eligibility', `SSC ${ssc.toFixed(2)} ar HSC ${hsc.toFixed(2)} hole ki apply korte parbo?`, answer));
    }
  }
  return entries;
}

// ---------- Education boards ----------
const BOARDS = ['Dhaka', 'Rajshahi', 'Cumilla (Comilla)', 'Jashore (Jessore)', 'Chattogram (Chittagong)', 'Barishal (Barisal)', 'Sylhet', 'Dinajpur', 'Mymensingh'];

function boardKb() {
  return [
    ...BOARDS.map((board) =>
      entry('Eligibility', `${board} board theke HSC pass korle ki apply korte parbo?`, `Haan, ${board} board shoho Bangladesh er shob general education board theke HSC pass korle apply korte parbe. Application form e board er naam select korte hobe.`),
    ),
    entry('Eligibility', 'Madrasah board theke Alim pass korle ki apply korte parbo?', 'Haan, Madrasah board er Alim pass student ra B o C unit e apply korte parbe. Alim e Science group thakle A unit eo apply korte parbe.'),
    entry('Eligibility', 'Technical board theke HSC (BM/Vocational) pass korle ki apply korte parbo?', 'Haan, Technical board er HSC (BM) student ra C unit e ar HSC (Vocational) student ra B unit e apply korte parbe, jodi GPA requirement puron kore.'),
  ];
}

// ---------- Quotas (3 entries each) ----------
const QUOTAS = [
  ['Muktijoddha (freedom fighter) quota', 'muktijoddhar sontan ba nati-natni', 'muktijoddha certificate, gazette copy o sompoorker proman (birth certificate)'],
  ['Adibashi (ethnic minority) quota', 'khudro nri-gosthi (adibashi) community er student', 'Deputy Commissioner (DC) office ba community leader er certificate'],
  ['Protibondhi (disabled) quota', 'protibondhi (disabled) student', 'Social Services theke dewa protibondhi ID card ba medical board er certificate'],
  ['Ward (employee) quota', 'university er teacher o staff der sontan', 'university office er employment certificate'],
  ['Khelowar (sports) quota', 'national ba divisional level e khela student', 'sports federation ba board er certificate'],
  ['Dalit/Harijan quota', 'Dalit ba Harijan community er student', 'local govt (UNO/ward councillor) er certificate'],
];

function quotaKb() {
  return QUOTAS.flatMap(([quota, who, documents]) => [
    entry('Quota', `${quota} e koyta seat ache?`, `${quota} ${who} der jonno. Proti unit e ei quota te kichu seat (sadharonoto 1% er moto) songrokkhito thake, exact sonkhya circular e deya hoy.`),
    entry('Quota', `${quota} e apply korte ki document lagbe?`, `${quota} er jonno ${documents} lagbe. Document gulo vortir somoy original o photocopy duitai dekhate hobe.`),
    entry('Quota', `${quota} e kivabe apply korbo?`, `Application form e quota option e "${quota}" select korbe. Exam e pass korle quota er alada merit list hoy, tarpor document verification kore seat deya hoy.`),
  ]);
}

module.exports = { paymentKb, examItemKb, clubKb, gpaKb, boardKb, quotaKb };
