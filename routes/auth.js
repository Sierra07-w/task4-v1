const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../data/store');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).render('login', { error: 'Invalid credentials' });
    const user = await store.user.findOne({ username });
    if (!user) return res.status(401).render('login', { error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).render('login', { error: 'Invalid credentials' });
    req.session.userId = user._id.toString();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(()=>{
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).render('signup', { error: 'Invalid input' });
    const exists = await store.user.findOne({ username }) || await store.user.findOne({ email });
    if (exists) return res.status(400).render('signup', { error: 'Invalid input' });
    const hash = await bcrypt.hash(password, 10);
    const user = await store.user.create({ username, email, passwordHash: hash });
    req.session.userId = user._id.toString();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('signup', { error: 'Server error' });
  }
});

module.exports = router;
