// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const berkasUserRoutes = require('./routes/berkasUserRoutes');
const riwayatPendidikanRoutes = require('./routes/riwayatPendidikanRoutes');
const penelitiRoutes = require('./routes/penelitiRoutes');
const reviewerRoutes = require('./routes/reviewerRoutes');
const userRoutes = require('./routes/userRoutes');
const klasterRoutes = require('./routes/klasterRoutes');
const kriteriaRoutes = require('./routes/kriteriaRoutes');
const bobotKriteriaRoutes = require('./routes/bobotKriteriaRoutes');
const subKriteriaRoutes = require('./routes/subKriteriaRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const penilaianProposalRoutes = require('./routes/penilaianProposalRoutes');
const rankingProposalRoutes = require('./routes/rankingProposalRoutes');
const riwayatLoginRoutes = require('./routes/riwayatLoginRoutes');
const tahunAnggaranRoutes = require('./routes/tahunAnggaranRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/berkas-user', berkasUserRoutes);
app.use('/api/riwayat-pendidikan', riwayatPendidikanRoutes);
app.use('/api/peneliti', penelitiRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/klaster', klasterRoutes);
app.use('/api/kriteria', kriteriaRoutes);
app.use('/api/bobot-kriteria', bobotKriteriaRoutes);
app.use('/api/sub-kriteria', subKriteriaRoutes);
app.use('/api/proposal', proposalRoutes);
app.use('/api/penilaian-proposal', penilaianProposalRoutes);
app.use('/api/ranking-proposal', rankingProposalRoutes);
app.use('/api/riwayat-login', riwayatLoginRoutes);
app.use('/api/tahun-anggaran', tahunAnggaranRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});