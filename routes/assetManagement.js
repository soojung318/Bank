const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

// 환경 변수 설정
const dotenv = require("dotenv");
dotenv.config();

const mongoDbUrl = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;

// MongoDB 클라이언트 설정
let db;
MongoClient.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
  })
  .catch(error => console.error(error));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// 로그인 된 사용자만 자산관리 페이지 보여주기
router.get("/myAsset/asset", async (req, res) => {
  if (req.session.user) {
    myAssets(req, res);
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});

async function myAssets(req, res) {
  let page = parseInt(req.query.page ? req.query.page : 1);
  const limit = 3;
  const skip = (page - 1) * limit;

  try {
    const totalPosts = await db.collection("asset").countDocuments({});
    const totalPages = Math.ceil(totalPosts / limit);

    const result = await db.collection("asset")
      .find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.render("myAsset/asset.ejs", { data: result, currentPage: page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send("서버 오류가 발생했습니다.");
  }
}

// 입금 처리
router.post("/deposit", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "로그인 먼저 해주세요" });
  }

  const { id, amount } = req.body;

  if (!id || !amount) {
    return res.status(400).json({ success: false, message: "유효하지 않은 요청입니다." });
  }

  try {
    const asset = await db.collection("asset").findOne({ _id: new ObjectId(id) });
    if (!asset) {
      return res.status(404).json({ success: false, message: "자산을 찾을 수 없습니다." });
    }

    const newTotal = parseFloat(asset.total) + parseFloat(amount);

    await db.collection("asset").updateOne(
      { _id: new ObjectId(id) },
      { $set: { total: newTotal, transactionDate: new Date() } }
    );

    res.json({ success: true, message: "입금이 성공적으로 완료되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

// 출금 처리
router.post("/withdraw", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "로그인 먼저 해주세요" });
  }

  const { id, amount } = req.body;

  if (!id || !amount) {
    return res.status(400).json({ success: false, message: "유효하지 않은 요청입니다." });
  }

  try {
    const asset = await db.collection("asset").findOne({ _id: new ObjectId(id) });
    if (!asset) {
      return res.status(404).json({ success: false, message: "자산을 찾을 수 없습니다." });
    }

    if (parseFloat(asset.total) < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: "출금 금액이 자산 총액을 초과합니다." });
    }

    const newTotal = parseFloat(asset.total) - parseFloat(amount);

    await db.collection("asset").updateOne(
      { _id: new ObjectId(id) },
      { $set: { total: newTotal, transactionDate: new Date() } }
    );

    res.json({ success: true, message: "출금이 성공적으로 완료되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
