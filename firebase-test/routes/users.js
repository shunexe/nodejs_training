var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("../fb.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://node-test-2bd44.firebaseio.com"
// });
var db = admin.database();
var ref = db.ref("users");

//USERSトップページ
router.get("/", (req, res, next) => {
  console.log("users/loginのレンダリングなう");
  console.log(req.session.login)
  var data = {
    title: "Users/Login",
    form: { name: "", password: "" },
    content: "名前とパスワードを入力してください"
  };
  res.render("users/login", data);
});

router.post("/", (req, res, next) => {
  var request = req;
  var response = res;
  req.check("name", "NAME は必ず入力してください").notEmpty();
  req.check("password", "PASSWORD は必ず入力してください").notEmpty();
  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      var content = '<ul class ="error">';
      var result_arr = result.array();
      for (var n in result_arr) {
        content += "<li>" + result_arr[n].msg + "<li>";
      }
      content += "</ul>";
      var data = {
        title: "Users/Login",
        content: content,
        form: req.body
      };
      response.render("users/login", data);
    } else {
      var nm = req.body.name;
      var pw = req.body.password;
      var ref = db.ref(`users/${nm}/password`);
      ref.on("value", snapshot => {
        const fetchedPas = snapshot.val();
        if (pw == fetchedPas) {
          request.session.login = { "id":nm,"password":pw};
          var data = {
            title: "Users/Login",
            content:
              "<p> ログインしました！<br>トップページに戻ってメッセージを送信してください．</p>",
            form: req.body
          };
          response.render("users/login", data);
        } else {
          var data = {
            title: "再入力",
            content: '<p class ="error" >名前またはパスワードが違います．</p>',
            form: req.body
          };
          response.render("users/login", data);
        }
      }),
        err => {
          console.log(err.code);
        };
    }
  });
});

///////アカウント作成ページ////
router.get("/add", function(req, res, next) {
  var data = {
    title: "Users/Add",
    form: {
      name: "",
      password: "",
      comment: ""
    },
    content: "※登録する名前・パスワード・コメントを入力してください"
  };
  res.render("users/add", data);
});

// add.ejsアカウント作成画面でPOST
router.post("/add", (req, res, next) => {
  var request = req;
  var response = res;
  req.check("name", "NAME は必ず入力してください").notEmpty();
  req.check("password", "PASSWORD は必ず入力してください").notEmpty();
  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      var content = '<ul class ="error">';
      var result_arr = result.array();
      for (var n in result_arr) {
        content += "<li>" + result_arr[n].msg + "<li>";
      }
      content += "</ul>";
      var data = {
        title: "Users/Add",
        content: content,
        form: req.body
      };
      response.render("users/add", data);
    } else {
      console.log(req.body);
      request.session.login = null;
      var path = ref.child(req.body.name);
      path.set({ id: req.body.name, password: req.body.password,comment: req.body.comment});
      ref.on("value", snapshot => {
        console.log("SUCCESS");
        console.log(snapshot.val());
        response.redirect('/users');
      }),
        err => {
          console.log(err.code);
        };
    }
  });
});

module.exports = router;
