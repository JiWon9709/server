//const router = require("express").Router();

var express = require("express");
var router = express.Router();

const { schema } = require("../models/users_ingredients");
const Users_Ingredients = require("../models/users_ingredients");
const Users_Baskets = require("../models/users_baskets");

// 관리페이지
router.get("/", (req, res) => {
  const query = req.query;

  Users_Ingredients.find({
    user_id: query.user_id,
    check: 0,
  })
    .populate("ing")
    .select("ing_name ing_expir ing_frozen")
    .exec((err, data) => {
      console.log(data);
      res.status(200).json(data);
    });
});

// manage_edit_date
router.post("/", (req, res) => {
  const body = req.body;
  // console.log(body);
  Users_Ingredients.updateOne(
    {
      _id: body._id,
      user_id: body.user_id,
    },
    {
      $set: {
        ing_frozen: body.ing_frozen,
        ing_expir: body.ing_expir,
      },
    },
    function (err, result) {
      if (err) throw err;
      // console.log(result);
      res.status(200).json(result);
    }
  );
});

// 삭제하기
router.delete("/", (req, res) => {
  Users_Ingredients.findByIdAndDelete(
    { _id: req.body._id },
    function (err, result) {
      if (err) throw err;
      console.log("deleted");
      res.status(200).json(result);
    }
  );
});

// 기한초과
router.get("/manageover", (req, res) => {
  const query = req.query;

  let today = new Date();

  console.log("User id : " + query.user_id);

  Users_Ingredients.find(
    {
      user_id: query.user_id,
    },
    function (err, results) {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
      res.status(200).json(results);
    }
  )
    .where("ing_expir")
    .lt(today)
    .select("ing_name");
});

// 장바구니 담기
router.post("/managebasket", (req, res) => {
  const body = req.body;

  // console.log(body);

  var list = [];
  for (var i = 0; i < body.length; i++) {
    const li = {
      user_id: body[i].user_id,
      ing_name: body[i].ing_name,
    };
    list.push(li);
  }

  // 문제: 중복은 create이 안됨
  Users_Baskets.create(list, function (err, result) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log("inserted");
    res.json("basket insert success");
  });
});

// 장바구니 보여주기
router.get("/managebasket", (req, res) => {
  const query = req.query;
  Users_Baskets.find({
    user_id: query.user_id,
  },
  function (err, results) {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    res.status(200).json(results);
  }).select("ing_name");
});

module.exports = router;
