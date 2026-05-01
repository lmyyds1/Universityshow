import express from 'express';
import cors from 'cors';
import * as db from './database';
import universitiesRouter from './routes/universities';
import ratingsRouter from './routes/ratings';
import tagsRouter from './routes/tags';
import commentsRouter from './routes/comments';
import templatesRouter from './routes/templates';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/universities', universitiesRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/templates', templatesRouter);

app.get('/api/stats', (_req, res) => {
  const stats = db.getStats();
  res.json({ success: true, data: stats });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
