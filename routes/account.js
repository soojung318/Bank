const router = require('express').Router();
const setup = require('../db_setup');

const sha = require('sha256');
const svgCaptcha = require('svg-captcha');

// CAPTCHA 이미지 생성
router.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

// 로그아웃 처리
router.get('/account/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// 로그인 처리
router.post("/account/login", async (req, res) => {
if (req.body.captcha !== req.session.captcha) {
    return res.render('index.ejs', { data: { alertMsg: 'CAPTCHA 확인 실패. 다시 시도해주세요.' } });
  }

  const { mongodb, mysqldb } = await setup();
  try {
    const result = await mongodb.collection("account").findOne({ userid: req.body.userid });

    if (result) {
      const sql = `SELECT salt FROM UserSalt WHERE userid=?`;
      mysqldb.query(sql, [req.body.userid], async (err, rows, fields) => {
        if (err) {
          res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
          return;
        }
        try {
          const salt = rows[0].salt;
          const hashPw = sha(req.body.userpw + salt);
          if (result.userpw == hashPw) {
            const userRole = result.userrole; // MongoDB에서 role 가져오기

            req.session.user = {
              userid: req.body.userid,
              userpw: hashPw,
              role: userRole // 세션에 role 저장
            };
            res.cookie("uid", req.body.userid);
            res.render("index.ejs");
          } else {
            res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
          }
        } catch (err) {
          res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
        }
      });
    } else {
      res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
    }
  } catch (err) {
    res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
  }
});


// 회원 가입 처리
router.post('/account/save', async (req, res) => {
  const { mongodb, mysqldb } = await setup();

  // 비밀번호 입력값 검증
  if (pw_check(req.body.userpw) == false){
    return res.render('login_enter.ejs', { data: { pwMsg: '비밀번호는 8 ~ 16자 이내로 영문, 숫자, 특수문자를 최소 한가지씩 사용하여 설정해주세요.' } });
  }
  try {
    const result = await mongodb.collection('account').findOne({ userid: req.body.userid });
    if (result && id_check(req.body.userid)) {
      return res.render('login_enter.ejs', { data: { msg: '다른 아이디를 사용해주세요.' } });
    } else {
      const generateSalt = (length = 16) => {
        const crypto = require('crypto');
        return crypto.randomBytes(length).toString('hex');
      };
      const salt = generateSalt();
      const role = req.body.userrole.toLowerCase(); // 권한 소문자로 변환

      // 만약 권한이 'admin'이면 관리자 권한 인증 코드를 검증
      if (role === 'admin') {
        const adminPassword = req.body.adminPassword; // 클라이언트에서 전송한 관리자 비밀번호
        if (adminPassword !== 'admin1234') {
          return res.render('index.ejs', { data: { alertMsg: '관리자 인증에 실패하였습니다.' } });
        }
      }

      // 회원가입 처리
      req.body.userpw = sha(req.body.userpw + salt);
      const insertResult = await mongodb.collection('account').insertOne(req.body);

      if (insertResult) {
        console.log("회원가입 성공");
        const sql = `INSERT INTO usersalt(userid, salt) VALUES (?, ?)`;
        mysqldb.query(sql, [req.body.userid, salt], (err, rows, fields) => {
          if (err) {
            console.log(err);
          } else {
            console.log("salt 저장 성공");
          }
        });
        return res.redirect('/');
      } else {
        console.log("회원가입 실패");
        return res.render('index.ejs', { data: { alertMsg: '회원 가입 실패' } });
      }
    }
  } catch (err) {
    console.log(err);
    return res.render('index.ejs', { data: { alertMsg: '회원 가입 실패' } });
  }
});

// 회원 가입 화면 보기
router.get('/account/enter', (req, res) => {
  res.render('login_enter.ejs');
});

const pw_check = (password) => {
  var check = /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/; //정규식으로 비밀번호 체크
 
	return check.test(password);
};

const id_check = (sentence) => {
  var check = sentence.replaceAll(' ', ''); //띄어쓰기 제거
  var checks = check.test(password) && true;  //더 추가할거 있으면 확인
  
  return checks;  
};

module.exports = router;