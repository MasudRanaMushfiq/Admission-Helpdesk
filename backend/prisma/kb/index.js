const { departmentKb } = require('./departments');
const { unitKb } = require('./units');
const { hallKb, centerKb } = require('./places');
const { paymentKb, examItemKb, clubKb, gpaKb, boardKb, quotaKb } = require('./lists');
const { generalKb } = require('./general');

const banglishKbEntries = [
  ...generalKb(),
  ...unitKb(),
  ...departmentKb(),
  ...hallKb(),
  ...centerKb(),
  ...paymentKb(),
  ...examItemKb(),
  ...clubKb(),
  ...gpaKb(),
  ...boardKb(),
  ...quotaKb(),
];

module.exports = { banglishKbEntries };
