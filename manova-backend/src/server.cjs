const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());

const allowedOrigins = [
  'https://manova.life',
  'https://www.manova.life',
  'http://localhost:3000'
];
const corsOptions = {
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Mount vector routes
const vector = require('./routes/vectorRoutes.cjs'); 
app.use('/api/vector', vector);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
