const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fidelity API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  return res.status(500).json({ message: 'Unexpected server error', error: err.message });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Fidelity server running on port ${PORT}`);
});
