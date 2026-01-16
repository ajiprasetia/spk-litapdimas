// backend/controllers/rankingProposalController.js
const RankingProposal = require('../models/rankingProposalModel');
const TOPSIS = require('../utils/topsis');
const Kriteria = require('../models/kriteriaModel');
const PenilaianProposal = require('../models/penilaianProposalModel');

exports.getProposalsByKlaster = async (req, res) => {
    try {
        const { klaster_id } = req.params;
        const proposals = await RankingProposal.getProposalsByKlaster(klaster_id);
        res.json(proposals);
    } catch (error) {
        console.error('Get proposals error:', error);
        res.status(500).json({
            message: error.message || 'Gagal memuat data proposal'
        });
    }
};

exports.getRankingByKlaster = async (req, res) => {
    try {
        const { klaster_id } = req.params;
        const ranking = await RankingProposal.findByKlasterId(klaster_id);
        res.json(ranking);
    } catch (error) {
        console.error('Get ranking error:', error);
        res.status(500).json({
            message: error.message || 'Gagal memuat data ranking'
        });
    }
};

// Endpoint untuk mendapatkan detail perhitungan saja
exports.getDetailPerhitungan = async (req, res) => {
    try {
        const { klaster_id } = req.params;
        
        // Cari ranking yang sudah ada
        const ranking = await RankingProposal.findByKlasterId(klaster_id);
        
        // Jika tidak ada ranking, kembalikan pesan error
        if (!ranking || ranking.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada ranking yang tersedia untuk klaster ini'
            });
        }

        // Ambil data pertama untuk mendapatkan matriks dan hasil perhitungan
        const firstRanking = ranking[0];
        
        // Get kriteria with weights
        const kriteria = await Kriteria.findAll();
        
        // Pastikan semua nilai dikonversi ke nilai numerik
        const convertToNumber = (val) => {
            if (typeof val === 'string') {
                return parseFloat(val);
            }
            return val;
        };
        
        // Format detail perhitungan dari data yang tersimpan
        const detailPerhitungan = {
            kriteria: kriteria.map(k => ({
                kode: k.kode_kriteria,
                nama: k.nama_kriteria,
                bobot: convertToNumber(k.bobot)
            })),
            matriks_keputusan: ranking.map(r => {
                const matrix = JSON.parse(r.matriks_keputusan);
                return Array.isArray(matrix) ? matrix.map(convertToNumber) : [];
            }),
            matriks_normalisasi: ranking.map(r => {
                const matrix = JSON.parse(r.matriks_normalisasi);
                return Array.isArray(matrix) ? matrix.map(convertToNumber) : [];
            }),
            matriks_terbobot: ranking.map(r => {
                const matrix = JSON.parse(r.matriks_terbobot);
                return Array.isArray(matrix) ? matrix.map(convertToNumber) : [];
            }),
            solusi_ideal: {
                positif: JSON.parse(firstRanking.solusi_ideal_positif).map(convertToNumber),
                negatif: JSON.parse(firstRanking.solusi_ideal_negatif).map(convertToNumber)
            },
            jarak_solusi: {
                positif: ranking.map(r => convertToNumber(r.jarak_positif)),
                negatif: ranking.map(r => convertToNumber(r.jarak_negatif))
            },
            nilai_preferensi: ranking.map(r => convertToNumber(r.nilai_preferensi))
        };

        res.json({
            message: 'Detail perhitungan berhasil diambil',
            ranking,
            detail_perhitungan: detailPerhitungan
        });
    } catch (error) {
        console.error('Get calculation details error:', error);
        res.status(500).json({
            message: error.message || 'Gagal mendapatkan detail perhitungan'
        });
    }
};

exports.getDetailPenilaianProposal = async (req, res) => {
  try {
    const { proposal_id } = req.params;
    
    const detailPenilaian = await RankingProposal.getDetailPenilaianProposal(proposal_id);
    
    res.json({
      message: 'Detail penilaian berhasil diambil',
      data: detailPenilaian
    });
  } catch (error) {
    console.error('Get detail penilaian error:', error);
    res.status(500).json({
      message: error.message || 'Gagal mendapatkan detail penilaian'
    });
  }
};

exports.calculateRanking = async (req, res) => {
  try {
    const { klaster_id } = req.params;
    const onlyGetDetails = req.query.onlyGetDetails === 'true';

    if (onlyGetDetails) {
      return this.getDetailPerhitungan(req, res);
    }

    // Get proposals with their scores
    const proposals = await RankingProposal.getProposalsByKlaster(klaster_id);

    if (proposals.length === 0) {
      return res.status(400).json({
        message: 'Tidak ada proposal untuk dihitung'
      });
    }

    // Check if all proposals have been reviewed
    const pendingReview = proposals.some(p => p.status_review === 'Belum Direview');
    if (pendingReview) {
      return res.status(400).json({
        message: 'Tidak dapat menghitung ranking karena masih ada proposal yang belum direview'
      });
    }

    // Get criteria with weights
    const kriteria = await Kriteria.findAll();
    const weights = kriteria.map(k => k.bobot / 100);

    // Get detailed penilaian for each proposal (rata-rata jika multiple reviewer)
    const proposalScores = await Promise.all(
      proposals.map(async (proposal) => {
        try {
          const penilaian = await PenilaianProposal.findByProposalId(proposal.id);
          
          // Jika ada multiple reviewer, hitung rata-rata per kriteria
          if (penilaian?.detail && penilaian.detail.length > 0) {
            const groupedByKriteria = {};
            
            // Group penilaian by kriteria_id
            penilaian.detail.forEach(p => {
              if (!groupedByKriteria[p.kriteria_id]) {
                groupedByKriteria[p.kriteria_id] = [];
              }
              groupedByKriteria[p.kriteria_id].push(parseFloat(p.nilai));
            });
            
            // Calculate average for each kriteria
            const avgScores = [];
            kriteria.forEach(k => {
              if (groupedByKriteria[k.id]) {
                const avg = groupedByKriteria[k.id].reduce((sum, val) => sum + val, 0) / groupedByKriteria[k.id].length;
                avgScores.push({ kriteria_id: k.id, nilai: avg });
              } else {
                avgScores.push({ kriteria_id: k.id, nilai: 0 });
              }
            });
            
            return avgScores;
          }
          
          return [];
        } catch (error) {
          return [];
        }
      })
    );

    // Prepare decision matrix
    const matrix = proposalScores.map(scores => {
      return kriteria.map(k => {
        const nilai = scores.find(s => s.kriteria_id === k.id)?.nilai || 0;
        return parseFloat(nilai);
      });
    });

    // All criteria are benefit type (higher is better)
    const criteriaTypes = kriteria.map(() => 'benefit');

    // Calculate TOPSIS
    const topsis = new TOPSIS(matrix, weights, criteriaTypes);
    const results = topsis.getResults();

    // Format detail perhitungan
    const detailPerhitungan = {
      kriteria: kriteria.map(k => ({
        kode: k.kode_kriteria,
        nama: k.nama_kriteria,
        bobot: parseFloat(k.bobot)
      })),
      matriks_keputusan: matrix,
      matriks_normalisasi: results.normalized_matrix,
      matriks_terbobot: results.weighted_matrix,
      solusi_ideal: {
        positif: results.ideal_positive,
        negatif: results.ideal_negative
      },
      jarak_solusi: {
        positif: results.distances_positive,
        negatif: results.distances_negative
      },
      nilai_preferensi: results.preference_values
    };

    // Delete existing rankings if any
    await RankingProposal.deleteByKlaster(klaster_id);

    // Save rankings and update proposal status
    for (let i = 0; i < results.rankings.length; i++) {
      const idx = results.rankings[i];
      const proposal = proposals[idx];
      
      await RankingProposal.create({
        klaster_id: parseInt(klaster_id),
        proposal_id: proposal.id,
        peringkat: i + 1,
        matriks_keputusan: matrix[idx],
        matriks_normalisasi: results.normalized_matrix[idx],
        matriks_terbobot: results.weighted_matrix[idx],
        solusi_ideal_positif: results.ideal_positive,
        solusi_ideal_negatif: results.ideal_negative,
        jarak_positif: results.distances_positive[idx],
        jarak_negatif: results.distances_negative[idx],
        nilai_preferensi: results.preference_values[idx]
      });
    }

    // Get updated rankings with detailed info
    const finalRanking = await RankingProposal.findByKlasterId(klaster_id);

    const response = {
      message: 'Ranking berhasil dihitung',
      ranking: finalRanking,
      detail_perhitungan: detailPerhitungan
    };

    res.json(response);
  } catch (error) {
    console.error('Calculate ranking error:', error);
    res.status(500).json({
      message: error.message || 'Gagal menghitung ranking'
    });
  }
};

exports.resetRanking = async (req, res) => {
    try {
        const { klaster_id } = req.params;
        await RankingProposal.deleteByKlaster(klaster_id);
        res.json({
            message: 'Ranking berhasil direset'
        });
    } catch (error) {
        console.error('Reset ranking error:', error);
        res.status(500).json({
            message: error.message || 'Gagal mereset ranking'
        });
    }
};