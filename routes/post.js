const router = require("express").Router();
const setup = require("../db_setup");
const sha = require("sha256");
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const multer = require('multer');

const storage=multer.diskStorage({
  destination: (req, file, done) => {
  done(null, '/image')
  }, filename: (req, file, done) => {
    done(null, file.originalname)
  }, limit : 5*1024*1024
});

const upload = multer({ storage });


////////파일 첨부 처리
let imagepath = '';
router.post('/post/photo',upload.single('picture') , (req, res) => {
  console.log('서버에 파일 첨부하기', req.file.path);
  imagepath =  req.file.originalname;
});


////로그인 된 사용자만 게시물 삭제해주기. 이때 자기글에 대해서만 삭제 가능하도록 해야함.
router.post("/post/delete", async (req, res) => {
  //console.log(req.body, "\n===============");
  if (req.session.user) {
    // 로그인 된 사용자라면
    const { mongodb } = await setup();
    mongodb
      .collection("post")
      .findOne({ _id: new ObjectId(req.body._id) }) //자기글인지 확인
      .then((result) => {
        //console.log(result, "\n", req.session);
        if (result && result.id == req.session.user.userid) {
          mongodb
            .collection("post")
            .deleteOne({ _id: new ObjectId(req.body._id) })
            .then((result) => {
              console.log("글 삭제 완료");
              list(mongodb, req, res);
            })
            .catch((err) => {
              res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
            });
        } else {
          res.render("index.ejs", { data: { alertMsg: "글이 없거나 글쓴이가 일치하지 않습니다 " } });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
      });
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});
////관리자 삭제
router.post("/post/admin_delete", async (req, res) => {
  //console.log(req.body, "\n===============");
  if (req.session.user) {
    // 로그인 된 사용자라면
    const { mongodb } = await setup();
    mongodb
      .collection("post")
      .findOne({ _id: new ObjectId(req.body._id) }) //자기글인지 확인
      .then((result) => {
        //console.log(result, "\n", req.session);
        if (result) {
          mongodb
            .collection("post")
            .deleteOne({ _id: new ObjectId(req.body._id) })
            .then((result) => {
              console.log("글 삭제 완료");
              admin_list(mongodb, req, res);
            })
            .catch((err) => {
              res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
            });
        } else {
          res.render("index.ejs", { data: { alertMsg: "글이 없거나 글쓴이가 일치하지 않습니다 " } });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
      });
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});

////로그인 된 사용자만 게시물 수정해주기. 이때 자기글에 대해서만 수정 가능하도록 해야함.
router.post("/post/update", async (req, res) => {
  //console.log(req.body, "\n===============");
  if (req.session.user) {
    // 로그인 된 사용자라면
    const { mongodb } = await setup();
    mongodb
      .collection("post")
      .findOne({ _id: new ObjectId(req.body._id) }) //자기글인지 확인
      .then((result) => {
        //console.log(result, "\n", req.session);
        if (result && result.id == req.session.user.userid) {
          mongodb
            .collection("post")
            .updateOne({ _id: new ObjectId(req.body._id) }, { $set: { title: req.body.title, content: req.body.content, date: req.body.someDate } })
            .then((result) => {
              console.log("글 수정 완료");
              list(mongodb, req, res);
            })
            .catch((err) => {
              res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
            });
        } else {
          res.render("board/board.ejs", { data: { alertMsg: "글이 없거나 글수정자가 일치하지 않습니다 " } });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
      });
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});
////로그인 된 사용자만 게시물 수정해주기. 이때 자기글에 대해서만 수정 가능하도록 해야함.
router.post("/post/admin_update", async (req, res) => {
  //console.log(req.body, "\n===============");
  if (req.session.user) {
    // 로그인 된 사용자라면
    const { mongodb } = await setup();
    mongodb
      .collection("post")
      .findOne({ _id: new ObjectId(req.body._id) }) //자기글인지 확인
      .then((result) => {
        //console.log(result, "\n", req.session);
        if (result) {
          mongodb
            .collection("post")
            .updateOne({ _id: new ObjectId(req.body._id) }, { $set: { title: req.body.title, content: req.body.content, date: req.body.someDate } })
            .then((result) => {
              console.log("글 수정 완료");
              admin_list(mongodb, req, res);
            })
            .catch((err) => {
              res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
            });
        } else {
          res.render("board/admin_board.ejs", { data: { alertMsg: "글이 없거나 글수정자가 일치하지 않습니다 " } });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
      });
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});

//글쓰기 처리
router.post("/post/save", async (req, res) => {
  console.log(req.body);
  if (req.session.user) {
    if (req.session.user.userid == req.body.id) {
      console.log('req.session.csrf_token', req.session.csrf_token)
      if (typeof req.session.csrf_token != 'undefined' &&  typeof req.body.frsc != 'undefined' &&  req.session.csrf_token==req.body.frsc) { //csrf_token이 맞으면
        const { mongodb } = await setup();
        mongodb
        .collection("post")
          .insertOne({
            id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            date: new Date(),
            path:imagepath
          })
        .then((result) => {
          //console.log(result);
          console.log("데이터 추가 성공");
          delete req.session.csrf_token;
          list(mongodb, req, res);
        });
      } else {
        console.log("글쓰기 csrf 해킹 시도 발생...");
        res.render("index.ejs", { data: { alertMsg: "글쓰기 csrf 해킹 시도 발생! 주의요망!!" } });
      }      
    } else {
      console.log("글쓰기 해킹 시도 발생...");
      res.render("index.ejs", { data: { alertMsg: "로그인 사용자와 글작성자가 일치하지 않습니다 " } });
    }
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});


// 로그인 된 사용자만 글쓰기 화면 보여주기
router.get("/board/board_enter", function (req, res) {
  if (req.session.user) {
    req.session.csrf_token = crypto.randomBytes(32).toString('hex');
    // csrf_token과 role을 함께 전달
    res.render("board/board_enter.ejs", {
      data: {
        id: req.session.user.userid,
        role : req.session.user.role
      },
      csrf_token: req.session.csrf_token
    });
  } else {
    res.redirect("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});

//로그인 된 사용자만 게시물 목록을 보여주기
router.get("/board/board", async (req, res) => {
  if (req.session.user) {//게스트용 화면 보여주기
    const { mongodb } = await setup();
    list(mongodb, req, res);
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인 먼저 해주세요" } });
  }
});


//게시글 관리 접근
router.get("/board/admin_board", async (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      try {
        const { mongodb } = await setup();
        // 관리자 권한으로 접근 가능한 게시물 목록을 가져오는 함수
        admin_list(mongodb, req, res);
      } catch (err) {
        console.error("MongoDB 연결 오류:", err);
        res.render("index.ejs", { data: { alertMsg: "서버 오류: 잠시 후 다시 시도해주세요." } });
      }
    } else {
      res.render("index.ejs", { data: { alertMsg: "권한이 없습니다." } });
    }
  } else {
    res.render("index.ejs", { data: { alertMsg: "로그인이 필요합니다." } });
  }
});
////답변 안된 게시물만 답변해주기. 관리자 권한 확인.
router.post("/post/answer", async (req, res) => {
  //console.log(req.body, "\n===============");
  const answer=0;
  if (req.session.user&&req.session.user.role=='admin') {
    // 로그인 된 사용자라면&관리자라면
    const { mongodb } = await setup();
    
    mongodb
      .collection("post")
      .findOne({  _id: new ObjectId(req.body._id), answer: { $exists: false } }) //답변이 안된건 지 확인
      .then((result) => {
        //console.log(result, "\n", req.session);
        answer=1;
        if (result) {
          mongodb
            .collection("answer")
            .insertOne({ _id: new ObjectId(req.body._id) }, { $set: { anwer_title: req.body.title, answer_content: req.body.content, answer_date: req.body.someDate } })
            .then((result) => {
              console.log("답변 완료");
              
              list(mongodb, req, res);
            })
            .catch((err) => {
              res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
            });
        } else {
          res.render("index.ejs", { data: { alertMsg: "이미 답변이 작성된 글입니다 " } });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("index.ejs", { data: { alertMsg: "서버오류: 잠시 뒤 다시 시도 해주세요" } });
      });
  } else {
    res.render("index.ejs", { data: { alertMsg: "관리자 권한이 필요합니다. 로그인 후 다시 시도해주세요." } });
  }
});
router.get('/product/product_list', async function (req, res) {
  const { mongodb } = await setup();
  mongodb.collection('product').find().toArray()
  .then(result =>{
      // ejs 로 랜더링
      res.render('product/product_list.ejs', {data : result});
  });
});
router.get('/product/product_intro', function (req, res) {
    res.render('product/product_intro.ejs');
});
function list(mongodb, req, res) {
  let page = parseInt(req.query.page ? req.query.page : 1);
  console.log(page);
  const limit = 3;
  const skip = (page - 1) * limit;

  // 게시물 총 개수 조회
  mongodb
    .collection("post")
    .countDocuments({})
    .then((totalPosts) => {
      // 총 페이지 수 계산
      const totalPages = Math.ceil(totalPosts / limit);

      // 현재 페이지의 게시물 목록 조회
      mongodb
        .collection("post")
        .find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
        .then((result) => {
          res.render("board/board.ejs", { data: result, currentPage: page, totalPages });
        });
    });
}
function admin_list(mongodb, req, res) {
  let page = parseInt(req.query.page ? req.query.page : 1);
  console.log(page);
  const limit = 3;
  const skip = (page - 1) * limit;

  // 게시물 총 개수 조회
  mongodb
    .collection("post")
    .countDocuments({})
    .then((totalPosts) => {
      // 총 페이지 수 계산
      const totalPages = Math.ceil(totalPosts / limit);

      // 현재 페이지의 게시물 목록 조회
      mongodb
        .collection("post")
        .find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
        .then((result) => {
          res.render("board/admin_board.ejs", { data: result, currentPage: page, totalPages });
        });
    });
}
// 검색 라우트 추가
router.get('/search', async (req, res) => {
  const { field, query } = req.query;

  if (!field || !query) {
      return res.status(400).json({ error: '필드와 검색어를 입력해주세요.' });
  }

  const { mongodb } = await setup();
  let searchCriteria = {};

  if (field === '_id') {
      try {
          searchCriteria[field] = new ObjectId(query);
      } catch (err) {
          return res.status(400).json({ error: '유효한 ObjectId를 입력해주세요.' });
      }
  } else {
      searchCriteria[field] = { $regex: query, $options: 'i' }; // 대소문자 구분 없이 검색
  }

  try {
      const results = await mongodb.collection('post').find(searchCriteria).toArray();
      res.json(results);
  } catch (err) {
      res.status(500).json({ error: '서버 오류: 잠시 뒤 다시 시도 해주세요.' });
  }
});
module.exports = router;
