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

router.post('/sign_up', function (req, res) {
  let user_name = req.body.user_name;
  let user_pwd = req.body.user_pwd;
  var user_info = { 'user_name': user_name, 'user_pwd': user_pwd, 'room_ids': [] };

  console.log('[LOG:] >>> /sign_up');
  console.log('[LOG:] /sign_up, user_name = ' + user_name + ' user_pwd = ' + user_pwd);

  dbmgr.query_user_info(user_info, (is_success, result) => {
    console.log("[LOG:] /sign_up, query_user_info, result = " + result);

    if (is_success) {
      if (result) {
        res.status(200).json({
          'status': 200,
          'payload': {
            'user_id': result.user_id,
            'user_name': result.user_name,
            'user_pwd': result.user_pwd,
            'room_ids': result.room_ids
          }
        });
        console.log('[LOG:] <<< /sign_up');
      } else {
        dbmgr.create_user_info(user_info, (is_success, result) => {
          if (is_success) {

            console.log("[LOG:] create new user, result = " + result);

            res.status(200).json({
              'status': 200,
              'payload': {
                'user_id': result.user_id,
                'user_name': result.user_name,
                'user_pwd': result.user_pwd,
                'room_ids': []
              }
            });
          } else {
            res.status(404).json({
              'status': 404,
              'message': 'request error'
            });
          }
          console.log('[LOG:] <<< /sign_up');
        });
      }
    } else {
      res.status(404).json({
        'status': 404,
        'message': 'request error'
      });
      console.log('[LOG:] <<< /sign_up');
    }
  });
});

router.post('/sign_in', function (req, res) {
  let user_name = req.body.user_name;
  let user_pwd = req.body.user_pwd;

  console.log('[LOG:] >>> /sign_in');
  console.log('[LOG:] /sign_in, user_name = ' + user_name + ' user_pwd = ' + user_pwd);

  dbmgr.query_user_info({ 'user_name': user_name, 'user_pwd': user_pwd }, (is_success, result) => {

    if (is_success && result) {
      console.log("[LOG:] /sign_in, query_user_info, result = " + result);

      let payload = {
        'user_id': result.user_id,
        'user_name': result.user_name,
        'user_pwd': result.user_pwd,
        'room_ids': result.room_ids
      };

      res.status(200).json({
        'status': 200,
        'payload': payload
      });
    } else {
      res.status(400).json({
        'status': 400,
        'message': 'request error'
      });
    }

    console.log('[LOG:] <<< /sign_in');
  });
});

/* GET users listing. */
router.get('/user_info_list', function (req, res) {
  console.log('[LOG:] >>> /user_info_list');

  dbmgr.query_all_user_info_list((is_success, result) => {
    if (is_success) {
      let payload = {
        "user_info_list":result
      }

      res.status(200).json({
        'status': 200,
        'payload': payload
      });

      console.log('[LOG:] /user_info_list, user_info_list = ' + result);
    } else {
      res.status(400).json({
        'status': 400,
        'message': 'request error'
      });
    }

    console.log('[LOG:] <<< /user_info_list');
  });

});

module.exports = router;
