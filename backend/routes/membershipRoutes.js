const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/membershipController');

router.post('/submit',  ctrl.submit);
router.get('/getUnregisteredMembers', ctrl.getUnregisteredMembers);

module.exports = router;
