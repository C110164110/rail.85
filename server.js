const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 讓 Express 提供 nuloop-site 目錄下的所有檔案
app.use(session({ secret: 'nuloop_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// 連接 MongoDB
mongoose.connect('mongodb://localhost:27017/nuloop', { useNewUrlParser: true, useUnifiedTopology: true });

// 資料模型
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  createdAt: { type: Date, default: Date.now }
}));

const Rental = mongoose.model('Rental', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  productId: String,
  startDate: Date,
  endDate: Date,
  status: String
}));

// JWT middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登入' });
  try {
    req.user = jwt.verify(token, 'nuloop_secret');
    next();
  } catch {
    res.status(401).json({ error: '驗證失敗' });
  }
}

// Google OAuth 設定
passport.use(new GoogleStrategy({
  clientID: '141053130631-d8d9estlsiq88ukk7k2dl7abumgk5bsl.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ email: profile.emails[0].value });
  if (!user) {
    user = await User.create({ email: profile.emails[0].value, name: profile.displayName });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google 登入路由
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: req.user._id, name: req.user.name, email: req.user.email }, 'nuloop_secret', { expiresIn: '7d' });
    res.redirect(`/login.html?token=${token}`);
  }
);

// 註冊
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ error: 'Email 已註冊' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, name });
  res.json({ success: true });
});

// 登入
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ error: '帳號或密碼錯誤' });
  const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, 'nuloop_secret', { expiresIn: '7d' });
  res.json({ token });
});

// 取得會員資料
app.get('/api/member', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// 編輯會員資料
app.post('/api/member/update', auth, async (req, res) => {
  const { name } = req.body;
  await User.findByIdAndUpdate(req.user.id, { name });
  res.json({ success: true });
});

// 取得租賃清單
app.get('/api/rentals', auth, async (req, res) => {
  const rentals = await Rental.find({ userId: req.user.id });
  res.json(rentals);
});

// 新增租賃（下單）
app.post('/api/rentals', auth, async (req, res) => {
  const { productId, startDate, endDate } = req.body;
  await Rental.create({ userId: req.user.id, productId, startDate, endDate, status: '租用中' });
  res.json({ success: true });
});

// 啟動伺服器
app.listen(3000, () => console.log('API server running on http://localhost:3000'));