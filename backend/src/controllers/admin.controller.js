const studentRecordService = require('../services/studentRecord.service');
const categoryService = require('../services/category.service');
const kbService = require('../services/kb.service');
const inboxService = require('../services/inbox.service');
const statsService = require('../services/stats.service');
const { sendOk, parseId } = require('../utils/helpers');

// ----- Student records -----
async function listStudentRecords(req, res) {
  sendOk(res, await studentRecordService.list());
}
async function createStudentRecord(req, res) {
  sendOk(res, await studentRecordService.create(req.body), 201);
}
async function updateStudentRecord(req, res) {
  sendOk(res, await studentRecordService.update(parseId(req.params.id), req.body));
}
async function deleteStudentRecord(req, res) {
  await studentRecordService.remove(parseId(req.params.id));
  sendOk(res, { message: 'Student record deleted' });
}

// ----- Categories -----
async function listCategories(req, res) {
  sendOk(res, await categoryService.list());
}
async function createCategory(req, res) {
  sendOk(res, await categoryService.create(req.body), 201);
}
async function updateCategory(req, res) {
  sendOk(res, await categoryService.update(parseId(req.params.id), req.body));
}
async function deleteCategory(req, res) {
  await categoryService.remove(parseId(req.params.id));
  sendOk(res, { message: 'Category deleted' });
}

// ----- Knowledge base -----
async function listKb(req, res) {
  sendOk(res, await kbService.list());
}
async function createKb(req, res) {
  sendOk(res, await kbService.create(req.body, req.user.id), 201);
}
async function updateKb(req, res) {
  sendOk(res, await kbService.update(parseId(req.params.id), req.body));
}
async function deleteKb(req, res) {
  await kbService.remove(parseId(req.params.id));
  sendOk(res, { message: 'KB entry deleted' });
}

// ----- Inbox -----
async function listInbox(req, res) {
  sendOk(res, await inboxService.listPending());
}
async function replyInbox(req, res) {
  const result = await inboxService.reply(parseId(req.params.id), req.user.id, req.body);
  sendOk(res, result, 201);
}

// ----- Dashboard -----
async function getStats(req, res) {
  sendOk(res, await statsService.getStats());
}

module.exports = {
  listStudentRecords,
  createStudentRecord,
  updateStudentRecord,
  deleteStudentRecord,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listKb,
  createKb,
  updateKb,
  deleteKb,
  listInbox,
  replyInbox,
  getStats,
};
