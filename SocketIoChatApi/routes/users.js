const express = require('express');
const dbmgr = require('../../db_packs/dbmgr');
const router = express.Router();

if (!dbmgr.is_connected()) {
  dbmgr.connect((isConnected) => {
    if (!isConnected) {
      console.log('[LOG:] Users API DB connect fail...');
    } else {
      console.log('[LOG:] Users API DB connect success...');
    }
  });
}

/* GET users listing. */
router.post('/sign_up', function (req, res) {
  let user_name = req.body.user_name;
  let user_pwd = req.body.user_pwd;
  var user_info = { 'user_name': user_name, 'user_pwd': user_pwd };

  console.log('[LOG: sign_up] user_name = ' + user_name + ' user_pwd = ' + user_pwd)

  dbmgr.query_user_info(user_info, (result) => {
    console.log("[LOG: sign_up] query_user_info, result = " + result);

    if (result) {
      res.status(200).json({
        'status': 200,
        'payload': {
          'user_id': result.user_id,
          'user_name': result.user_name,
          'user_pwd': result.user_pwd
        }
      });
      res.end();
    } else {
      dbmgr.create_user_info(user_info, (result) => {
        if (result) {
          console.log("[LOG: query_user_info] create new user, result = " + result);
          res.status(200).json({
            'status': 200,
            'payload': {
              'user_id': result.user_id,
              'user_name': result.user_name,
              'user_pwd': result.user_pwd
            }
          });
        } else {
          res.status(404).json({
            'status': 404,
            'message': 'request error'
          });
        }
        res.end();        
      });
    }
  });
});

router.post('/sign_in', function (req, res) {
  let user_name = req.body.user_name;
  let user_pwd = req.body.user_pwd;

  dbmgr.query_user_info({ 'user_name': user_name, 'user_pwd': user_pwd }, (result) => {
    console.log("[LOG: sign_in] query_user_info, result = " + result);

    if (result) {
      res.status(200).json({
        'status': 200,
        'payload': {
          'user_id': result.user_id,
          'user_name': result.user_name,
          'user_pwd': result.user_pwd
        }
      });
    } else {
      res.status(400).json({
        'status': 400,
        'message': 'request error'
      });
    }
    res.end();
  });
});

router.get('/fetch_user_list', function (req, res) {
  res.send('respond with fetch_user_data');
});

module.exports = router;
