const express = require('express')
const user = require('../user.model');
const connection = require('../conexion');

const { body, param, validationResult } = require('express-validator');
var router = express.Router();

// router.get('/user', [], (req, res) => {
//    user.getAll(connection, (data => {
//       res.json(data);
//    }))
// });

router.get('/', function(req,res) {
    res.sendFile(process.cwd() + '/public/index.html');
})

router.post('/user', [
    body('name').not().isEmpty().isString(),
    body('lastname').not().isEmpty().isString(),
    body('contact').not().isEmpty().isString(),
    body('cellphone').not().isEmpty().isString(),
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.json({success:false, err:JSON.stringify(errors)})
        return;
    }
    let body = req.body;
    user.create(connection, body, (data => {
        res.json(data);
    }))
});

module.exports = router;    