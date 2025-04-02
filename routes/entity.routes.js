const express = require('express');
const router = express.Router();
const controller = require('../controllers/entity.controller');
const validateName = require('../middlewares/validateName');

router.post('/', validateName, controller.create);
router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.put('/:id', validateName, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;