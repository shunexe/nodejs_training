var express = require('express');
var router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("../fb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://node-test-2bd44.firebaseio.com"
});
var db = admin.database();

//INDEXページ
router.get("/", function (req, res, next) {
  console.log('INDEXのトップ')
  // if (req.session.login == null) {
  //   console.log("req.session.login がnull")
  //   res.redirect("/users");
  // } else {
    res.redirect("/page1");
  //}
});

router.post("/", (req, res, next) => {
  if (req.session.login == undefined) {
    res.redirect('/page1');
  } else {
    var rec = {
      message: req.body.msg,
      user_id: req.session.login.id
    };
    var ref = db.ref(`messages`)
    ref.push({ user_id: rec.user_id, message: rec.message, created_at: Date.now() });
    ref.once("value", snapshot => {
      res.redirect("/");
    }),
      err => {
        console.log(err.code);
      };
  }
});

router.get("/page:page", (req, res, next) => {
  // if (req.session.login == null) {
  //   res.redirect("/users");
  //   return;
  // }
  var ref = db.ref(`messages`).orderByChild("created_at");
  var collection = [];
  var pagination = { page:0,pageCount:0};
  ref.once("value", snapshot => {
    var val = snapshot.val();
    var records = Object.values(val).reverse();
    if (records != null) {
      var numOfContentPerPage = 5;
      var numOfContent = records.length;
      var currentPage = Number(req.params.page);
      var smallestNumofContent = numOfContent % numOfContentPerPage;
      if (numOfContent % numOfContentPerPage != 0) {
        if (currentPage == 1) {
          collection = records.slice(
            0,
            smallestNumofContent
          )
        } else {
          collection = records.slice(
            smallestNumofContent + numOfContentPerPage * (currentPage - 1),
            smallestNumofContent + numOfContentPerPage * currentPage); 
        }
      } else {
       collection = records.slice(
         (currentPage - 1) * numOfContentPerPage,
         currentPage * numOfContentPerPage 
       ); 
      }
      pagination.page = currentPage;
      pagination.pageCount = Math.ceil(numOfContent/numOfContentPerPage);
    }
    var data = {
      title: "miniboard-with-Firebase",
      login: req.session.login,
      collection: collection,
      pagination: pagination,
    };
    res.render("index", data);
  }),
    err => {
      console.log(err.code);
    }; 

});

router.get('/logout', (req, res, next) => {
  req.session.login = false;
  res.redirect('/users');
});

module.exports = router;
