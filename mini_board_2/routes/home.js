var express = require("express");
var router = express.Router();

var knex = require("knex")({
  dialect: "sqlite3",
  connection: {
    filename: "board_data.sqlite3"
  },
  useNullAsDefault: true
});

var Bookshelf = require("bookshelf")(knex);
Bookshelf.plugin("pagination");

var User = Bookshelf.Model.extend({
  tableName: "users"
});

var Message = Bookshelf.Model.extend({
  tableName: "messages",
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  }
});

/* GET home page. */
router.get("/", function (req, res, next) {
    console.log('homeのroot');
});

router.get('/:id', (req, res, next) => {
    res.redirect('/home/' + req.params.id + '/1');
});

router.get("/:id/:page", (req, res, next) => {
    var id = req.params.id;
    id *= 1;
  var pg = req.params.page;
  pg *= 1;
  if (pg < 1) {
    pg = 1;
  }
  new Message()
    .orderBy("created_at", "DESC")
    .where('user_id','=',id)
    .fetchPage({ page: pg, pageSize: 10, withRelated: ["user"] })
    .then(collection => {
      var data = {
        title: "miniboard",
        login: req.session.login,
        user_id: id,
        collection: collection.toArray(),
        pagination: collection.pagination
      };
      res.render("home", data);
    })
    .catch(err => {
      res.status(500).json({ error: true, data: { message: err.message } });
    });
});

module.exports = router;
