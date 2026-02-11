import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { all, get, initDb, run } from './db.js';
import { authRequired, signToken } from './auth.js';
import { renderProjectHtml } from './render.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

const newProjectData = (name = 'Untitled Project') => ({
  name,
  pages: [{ id: nanoid(8), name: 'Home', elements: [] }],
  currentPageId: null,
  theme: { primary: '#5b7cfa', radius: 10 },
  globalStyles: {
    fontFamily: 'Inter, Arial, sans-serif',
    background: '#f5f7fb',
    color: '#0f172a'
  },
  reusableComponents: [],
  assets: []
});

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Email and password (min 6 chars) required' });
  }

  const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const id = nanoid();
  const passwordHash = await bcrypt.hash(password, 10);
  await run('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)', [id, email, passwordHash, new Date().toISOString()]);

  return res.json({ token: signToken({ id, email }), user: { id, email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  return res.json({ token: signToken({ id: user.id, email: user.email }), user: { id: user.id, email: user.email } });
});

app.get('/api/projects', authRequired, async (req, res) => {
  const projects = await all(
    'SELECT id, name, published_token, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
    [req.user.id]
  );
  res.json(projects);
});

app.post('/api/projects', authRequired, async (req, res) => {
  const id = nanoid();
  const name = req.body.name || 'Untitled Project';
  const now = new Date().toISOString();
  const data = JSON.stringify(newProjectData(name));
  await run('INSERT INTO projects (id, user_id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [
    id,
    req.user.id,
    name,
    data,
    now,
    now
  ]);

  res.status(201).json({ id, name });
});

app.get('/api/projects/:id', authRequired, async (req, res) => {
  const row = await get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ message: 'Project not found' });
  res.json({ ...row, data: JSON.parse(row.data) });
});

app.put('/api/projects/:id', authRequired, async (req, res) => {
  const { name, data } = req.body;
  const existing = await get('SELECT id FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ message: 'Project not found' });

  await run('UPDATE projects SET name = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?', [
    name,
    JSON.stringify(data),
    new Date().toISOString(),
    req.params.id,
    req.user.id
  ]);

  res.json({ success: true });
});

app.delete('/api/projects/:id', authRequired, async (req, res) => {
  await run('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

app.post('/api/projects/:id/publish', authRequired, async (req, res) => {
  const row = await get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ message: 'Project not found' });

  const token = row.published_token || nanoid(10);
  await run('UPDATE projects SET published_token = ?, updated_at = ? WHERE id = ?', [token, new Date().toISOString(), req.params.id]);

  res.json({ shareUrl: `${req.protocol}://${req.get('host')}/share/${token}` });
});

app.get('/api/projects/:id/export', authRequired, async (req, res) => {
  const row = await get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ message: 'Project not found' });
  const data = JSON.parse(row.data);
  const html = renderProjectHtml({ ...data, name: row.name });

  res.json({
    files: {
      'index.html': html,
      'README.txt': `Export generated at ${new Date().toISOString()}`
    }
  });
});

app.get('/share/:token', async (req, res) => {
  const row = await get('SELECT name, data FROM projects WHERE published_token = ?', [req.params.token]);
  if (!row) return res.status(404).send('Shared project not found');
  const data = JSON.parse(row.data);
  res.type('html').send(renderProjectHtml({ ...data, name: row.name }));
});

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

initDb().then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${port}`);
  });
});
