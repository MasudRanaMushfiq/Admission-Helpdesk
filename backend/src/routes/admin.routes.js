const express = require('express');
const controller = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { auth, requireRole } = require('../middleware/auth');
const validators = require('../validators/admin.validators');

const router = express.Router();

// Admin only
router.use(auth, requireRole('admin'));

router.get('/student-records', controller.listStudentRecords);
router.post('/student-records', validate(validators.studentRecord), controller.createStudentRecord);
router.put('/student-records/:id', validate(validators.studentRecord), controller.updateStudentRecord);
router.delete('/student-records/:id', controller.deleteStudentRecord);

router.get('/categories', controller.listCategories);
router.post('/categories', validate(validators.category), controller.createCategory);
router.put('/categories/:id', validate(validators.category), controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

router.get('/kb', controller.listKb);
router.post('/kb', validate(validators.kbEntry), controller.createKb);
router.put('/kb/:id', validate(validators.kbEntry), controller.updateKb);
router.delete('/kb/:id', controller.deleteKb);

router.get('/inbox', controller.listInbox);
router.post('/inbox/:id/reply', validate(validators.inboxReply), controller.replyInbox);

router.get('/stats', controller.getStats);

module.exports = router;
