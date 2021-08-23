const router = require("express").Router();

const Users_Recipes = require("../models/users_recipes");
const Recipe = require("../models/recipes");

const { response } = require("express");

var Youtube = require("youtube-node");
var youtube = new Youtube();

// 요리하기
router.get("/", (req, res) => {
  // 요리할 식재료 체크한거 배열로 가져와서
  const array = req.body;
  console.log("ings_name: " + array.ings_name);
  // 만들수 있는 레시피 검색
  Recipe.find(
    {
      ings_name: array.ings_name
    },
      function (err, results) {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    res.status(200).json(results);
  }).select("ings_name recipe_name");
});

//db.receipes.findOne({'ing_id': {$regex: "^박력분"}});
// 유투브 영상 리스트
// 재료 선택 -> 요리하기 
router.post("/", (req, res) => {
  const body = req.body;

  console.log(body);

  Recipe.find(
    {
      recipe_name: body.recipe_name
    },
    function (err, recipes) {
      if (err) {
        return res.status(500).send({ error: err.message });
      }
      res.status(200).json(recipes);
    }).select("recipe_name");
  });


 // [유투브 영상으로 넘겨주기]
router.post("/cook", (req, res) => {
  const body = req.body;
  //var word = req.body; // 검색어 지정
  var limit = 5; // 출력 갯수

  youtube.setKey("AIzaSyCK0H1wFZltvI4093gwJoQ4Vh2atbZyTy8"); // API 키 입력

  var url = "https://www.youtube.com/results?search_query=" + body.recipe_name;

  //// 검색 옵션 시작
  youtube.addParam("order", "rating"); // 평점 순으로 정렬
  youtube.addParam("type", "video"); // 타입 지정
  youtube.addParam("videoLicense", "creativeCommon"); // 크리에이티브 커먼즈 아이템만 불러옴
  //// 검색 옵션 끝

  youtube.search(body.recipe_name, limit, function (err, result) {
    // 검색 실행
    if (err) {
      console.log(err);
      return;
    } // 에러일 경우 에러공지하고 빠져나감
      console.log("URL : " + url);
      console.log("-----------");
  });
    
    res.end(url);

    // 해당 유저가 본 레시피 체크 (users_recipes의 recipe_check=1)
    var myquery = { recipe_check: 0 };
    var newvalues = { $set: {recipe_check: 1} };

    Users_Recipes.updateOne(myquery, newvalues, function(err, res) {

      if (err) throw err;
      console.log("1 document 수정 완료.");
  
    });
  });

module.exports = router;
