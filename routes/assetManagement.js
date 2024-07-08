const router = require("express").Router();
const setup = require("../db_setup");
const { ObjectId } = require("mongodb");


//로그인 된 사용자만 자산관리 페이지 보여주기
router.get("/myAsset/asset", async (req, res) => {
  if (req.session.user) {
    const { mongodb } = await setup();
    //res.render("myAsset/asset.ejs");
    myAssets(mongodb, req, res);
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});

function myAssets(mongodb, req, res) {
  let page = parseInt(req.query.page ? req.query.page : 1);
  console.log(page);
  const limit = 3;
  const skip = (page - 1) * limit;

  // 총자산 조회 페이지 계산
  mongodb
    .collection("asset")
    .countDocuments({})
    .then((totalPosts) => {

      const totalPages = Math.ceil(totalPosts / limit);

      // 총자산 조회
      mongodb
        .collection("post")
        .find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
        .then((result) => {
          res.render("myAsset/asset.ejs", { data: result, currentPage: page, totalPages });
        });
    });
}

module.exports = router;