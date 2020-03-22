var express = require("express");
var router = express.Router();
var admin = require("firebase-admin");
var db = admin.database();

/* GET home page. */
router.get("/", function (req, res, next) {
    console.log('homeのroot');
});

router.get('/:id', (req, res, next) => {
    res.redirect('/home/' + req.params.id + '/1');
});

router.get("/:id/:page", (req, res, next) => {
  // console.log('id/pageにきた')
  // var id = req.params.id;
  // id *= 1;
  // var pg = req.params.page;
  // pg *= 1;
  // if (pg < 1) {
  //   pg = 1;
  // }
  // new Message()
  //   .orderBy("created_at", "DESC")
  //   .where('user_id','=',id)
  //   .fetchPage({ page: pg, pageSize: 10, withRelated: ["user"] })
  //   .then(collection => {
  //     var data = {
  //       title: "miniboard",
  //       login: req.session.login,
  //       user_id: id,
  //       collection: collection.toArray(),
  //       pagination: collection.pagination
  //     };
  //     res.render("home", data);
  //   })
  //   .catch(err => {
  //     res.status(500).json({ error: true, data: { message: err.message } });
  //   });
  var ref = db.ref(`messages`).orderByChild("user_id").equalTo(req.params.id);
  var collection = [];
  var pagination = { page: 0, pageCount: 0 };
  ref.once("value", snapshot => {
    var val = snapshot.val();
    var records = Object.values(val).reverse();
    console.log(records)
    if (records != null) {
      var numOfContentPerPage = 5;
      var numOfContent = records.length;
      var currentPage = Number(req.params.page);
      var smallestNumofContent = numOfContent % numOfContentPerPage;
      if (numOfContent % numOfContentPerPage != 0) {
        if (currentPage == 1) {
          collection = records.slice(0, smallestNumofContent);
        } else {
          collection = records.slice(
            smallestNumofContent + numOfContentPerPage * (currentPage - 1),
            smallestNumofContent + numOfContentPerPage * currentPage
          );
        }
      } else {
        collection = records.slice(
          (currentPage - 1) * numOfContentPerPage,
          currentPage * numOfContentPerPage
        );
      }
      pagination.page = currentPage;
      pagination.pageCount = Math.ceil(numOfContent / numOfContentPerPage);
    }
    var data = {
      title: "HOME",
      login: req.session.login,
      user_id:req.params.id,
      collection: collection,
      pagination: pagination
    };
    res.render("home", data);
  }),
    err => {
      console.log(err.code);
    }; 
});

module.exports = router;
