const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

module.exports = router;
