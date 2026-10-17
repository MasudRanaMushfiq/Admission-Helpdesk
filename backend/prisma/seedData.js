const { banglishKbEntries } = require('./kb');

const studentRecords = [
  // Registered (password: student123)
  { fullName: 'Rahim Uddin', rollNo: '2001001', registrationNo: '9001001', demoPassword: 'student123' },
  { fullName: 'Karima Akter', rollNo: '2001002', registrationNo: '9001002', demoPassword: 'student123' },
  // Free, for testing Register
  { fullName: 'Tanvir Hasan', rollNo: '2001003', registrationNo: '9001003' },
  { fullName: 'Nusrat Jahan', rollNo: '2001004', registrationNo: '9001004' },
  { fullName: 'Arif Hossain', rollNo: '2001005', registrationNo: '9001005' },
];

const categories = [
  'Eligibility', 'Fees', 'Deadlines', 'Documents', 'Exam',
  'Admission Process', 'Results', 'Seats', 'Departments', 'Exam Centers',
  'Quota', 'Scholarship', 'Halls', 'Campus Life',
];

const englishKbEntries = [
  {
    category: 'Eligibility',
    question: 'What is the minimum GPA required to apply for admission?',
    answer: 'You need a minimum combined GPA of 7.0 in SSC and HSC, with at least GPA 3.5 in each exam.',
  },
  {
    category: 'Eligibility',
    question: 'Can students from the science group apply to business studies programs?',
    answer: 'Yes. Science group students can apply to business studies programs if they meet the general GPA requirement.',
  },
  {
    category: 'Eligibility',
    question: 'Can I apply if I passed HSC two years ago?',
    answer: 'Students who passed HSC in the current year or the previous year are eligible. Older HSC passes are not accepted.',
  },
  {
    category: 'Fees',
    question: 'How much is the application fee?',
    answer: 'The application fee is 1,200 BDT per unit. It is non-refundable.',
  },
  {
    category: 'Fees',
    question: 'How can I pay the application fee?',
    answer: 'You can pay the application fee online with bKash, Nagad, Rocket or a debit/credit card from the admission portal.',
  },
  {
    category: 'Fees',
    question: 'What is the admission fee after selection?',
    answer: 'Selected students pay an admission fee of about 15,000 BDT, which includes the first semester tuition and library fee.',
  },
  {
    category: 'Deadlines',
    question: 'When does the online application start and end?',
    answer: 'Online applications open on 1 November and close on 30 November at 11:59 PM.',
  },
  {
    category: 'Deadlines',
    question: 'When will the admit card be available for download?',
    answer: 'Admit cards can be downloaded from the admission portal from 10 December until the day of the exam.',
  },
  {
    category: 'Deadlines',
    question: 'When will the admission result be published?',
    answer: 'Results are usually published within 15 days after the admission exam on the admission portal.',
  },
  {
    category: 'Documents',
    question: 'What documents are required for the application?',
    answer: 'You need your SSC and HSC roll and registration numbers, a recent passport-size photo and a signature image.',
  },
  {
    category: 'Documents',
    question: 'What is the required photo size for the application form?',
    answer: 'Upload a color photo of 300x300 pixels (max 100 KB) and a signature of 300x80 pixels (max 60 KB), both in JPG format.',
  },
  {
    category: 'Documents',
    question: 'Which documents should I bring on admission day after selection?',
    answer: 'Bring the original SSC and HSC certificates and mark sheets, the admit card, two photos and the payment receipt.',
  },
  {
    category: 'Exam',
    question: 'What is the format of the admission exam?',
    answer: 'The exam has 100 multiple choice questions in 90 minutes. Each wrong answer deducts 0.25 marks.',
  },
  {
    category: 'Exam',
    question: 'Where is the admission test center?',
    answer: 'The exam is held on the main campus. Your exact building and room number are printed on your admit card.',
  },
];

// + 1000 Banglish entries (see prisma/kb/)
const kbEntries = [...englishKbEntries, ...banglishKbEntries];

module.exports = { studentRecords, categories, englishKbEntries, banglishKbEntries, kbEntries };
