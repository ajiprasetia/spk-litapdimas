// backend/models/rankingProposalModel.js
const db = require('../config/database');

class RankingProposal {
  static async findByKlasterId(klasterId) {
  try {
    const [rows] = await db.execute(`
      SELECT
        rp.*,
        p.judul,
        p.bidang_ilmu,
        u.nama as nama_peneliti,
        k.nama_klaster,
        k.kuota_pendanaan
      FROM ranking_proposal rp
      JOIN proposal p ON rp.proposal_id = p.id
      JOIN peneliti pl ON p.peneliti_id = pl.id
      JOIN users u ON pl.user_id = u.id
      JOIN klaster k ON rp.klaster_id = k.id
      WHERE rp.klaster_id = ?
      ORDER BY rp.peringkat ASC
    `, [klasterId]);

    // Get reviewer details for each ranked proposal
    const rankings = await Promise.all(rows.map(async (ranking) => {
      // Get proposal to access reviewer_id
      const [proposalRows] = await db.execute(
        'SELECT reviewer_id FROM proposal WHERE id = ?',
        [ranking.proposal_id]
      );

      let reviewers = [];
      let reviewer_names = '';

      if (proposalRows[0] && proposalRows[0].reviewer_id) {
        try {
          const reviewerIds = JSON.parse(proposalRows[0].reviewer_id);
          
          if (reviewerIds && reviewerIds.length > 0) {
            const placeholders = reviewerIds.map(() => '?').join(',');
            const [reviewerRows] = await db.execute(`
              SELECT 
                r.id,
                u.nama as reviewer_nama
              FROM reviewer r
              JOIN users u ON r.user_id = u.id
              WHERE r.id IN (${placeholders})
              ORDER BY r.id
            `, reviewerIds);
            
            reviewers = reviewerRows;
            reviewer_names = reviewerRows.map(r => r.reviewer_nama).join(', ');
          }
        } catch (parseError) {
          console.error('Error parsing reviewer_id JSON:', parseError);
        }
      }

      return {
        ...ranking,
        reviewers: reviewers,
        nama_reviewer: reviewer_names
      };
    }));

    return rankings;
  } catch (error) {
    throw error;
  }
}

  static async getProposalsByKlaster(klasterId) {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.*,
        u.nama as nama_peneliti,
        CONCAT('Peneliti ID: ', pl.id) as peneliti_id_display,
        pp.total_nilai,
        CASE
          WHEN pp.total_nilai IS NULL THEN 'Belum Direview'
          ELSE 'Sudah Direview'
        END as status_review
      FROM proposal p
      JOIN peneliti pl ON p.peneliti_id = pl.id
      JOIN users u ON pl.user_id = u.id
      LEFT JOIN (
        SELECT
          proposal_id,
          SUM(nilai) as total_nilai
        FROM penilaian_proposal
        GROUP BY proposal_id
      ) pp ON p.id = pp.proposal_id
      WHERE p.klaster_id = ?
      AND p.status IN ('Tahap Review', 'Dalam Evaluasi Akhir', 'Lolos Pendanaan', 'Tidak Lolos Pendanaan')
      ORDER BY p.created_at DESC
    `, [klasterId]);

    // Get reviewer details for each proposal
    const proposals = await Promise.all(rows.map(async (proposal) => {
      let reviewers = [];
      let reviewer_names = '';
      let reviewer_id_displays = '';

      if (proposal.reviewer_id) {
        try {
          const reviewerIds = JSON.parse(proposal.reviewer_id);
          
          if (reviewerIds && reviewerIds.length > 0) {
            const placeholders = reviewerIds.map(() => '?').join(',');
            const [reviewerRows] = await db.execute(`
              SELECT 
                r.id,
                u.nama as reviewer_nama,
                CONCAT('Reviewer ID: ', r.id) as reviewer_id_display
              FROM reviewer r
              JOIN users u ON r.user_id = u.id
              WHERE r.id IN (${placeholders})
              ORDER BY r.id
            `, reviewerIds);
            
            reviewers = reviewerRows;
            reviewer_names = reviewerRows.map(r => r.reviewer_nama).join(', ');
            reviewer_id_displays = reviewerRows.map(r => r.reviewer_id_display).join(', ');
          }
        } catch (parseError) {
          console.error('Error parsing reviewer_id JSON:', parseError);
          // Handle legacy single reviewer ID
          if (typeof proposal.reviewer_id === 'number') {
            const [reviewerRows] = await db.execute(`
              SELECT 
                r.id,
                u.nama as reviewer_nama,
                CONCAT('Reviewer ID: ', r.id) as reviewer_id_display
              FROM reviewer r
              JOIN users u ON r.user_id = u.id
              WHERE r.id = ?
            `, [proposal.reviewer_id]);
            
            if (reviewerRows.length > 0) {
              reviewers = reviewerRows;
              reviewer_names = reviewerRows[0].reviewer_nama;
              reviewer_id_displays = reviewerRows[0].reviewer_id_display;
            }
          }
        }
      }

      return {
        ...proposal,
        reviewer_ids: proposal.reviewer_id ? 
          (typeof proposal.reviewer_id === 'string' ? JSON.parse(proposal.reviewer_id) : [proposal.reviewer_id]) 
          : [],
        reviewers: reviewers,
        nama_reviewer: reviewer_names,
        reviewer_id_display: reviewer_id_displays
      };
    }));

    return proposals;
  } catch (error) {
    throw error;
  }
}

static async getDetailPenilaianProposal(proposalId) {
  try {
    // Get basic proposal info
    const [proposalInfo] = await db.execute(`
      SELECT 
        p.id,
        p.judul,
        p.bidang_ilmu,
        u.nama as nama_peneliti,
        k.nama_klaster
      FROM proposal p
      JOIN peneliti pl ON p.peneliti_id = pl.id
      JOIN users u ON pl.user_id = u.id
      JOIN klaster k ON p.klaster_id = k.id
      WHERE p.id = ?
    `, [proposalId]);

    if (!proposalInfo[0]) {
      throw new Error('Proposal tidak ditemukan');
    }

    // Get detailed penilaian from each reviewer
    const [detailPenilaian] = await db.execute(`
      SELECT 
        pp.reviewer_id,
        u.nama as reviewer_nama,
        pp.kriteria_id,
        k.kode_kriteria,
        k.nama_kriteria,
        k.bobot,
        pp.sub_kriteria_id,
        sk.tipe,
        sk.skor,
        sk.deskripsi,
        pp.nilai,
        pp.created_at
      FROM penilaian_proposal pp
      JOIN reviewer r ON pp.reviewer_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN kriteria k ON pp.kriteria_id = k.id
      JOIN sub_kriteria sk ON pp.sub_kriteria_id = sk.id
      WHERE pp.proposal_id = ?
      ORDER BY pp.reviewer_id, k.kode_kriteria
    `, [proposalId]);

    // Group by reviewer
    const penilaianByReviewer = {};
    let totalNilaiKeseluruhan = 0;
    const reviewerTotals = {};

    detailPenilaian.forEach(item => {
      if (!penilaianByReviewer[item.reviewer_id]) {
        penilaianByReviewer[item.reviewer_id] = {
          reviewer_id: item.reviewer_id,
          reviewer_nama: item.reviewer_nama,
          penilaian: [],
          total_nilai: 0
        };
        reviewerTotals[item.reviewer_id] = 0;
      }

      penilaianByReviewer[item.reviewer_id].penilaian.push({
        kriteria_id: item.kriteria_id,
        kode_kriteria: item.kode_kriteria,
        nama_kriteria: item.nama_kriteria,
        bobot: item.bobot,
        sub_kriteria_id: item.sub_kriteria_id,
        tipe: item.tipe,
        skor: item.skor,
        deskripsi: item.deskripsi,
        nilai: parseFloat(item.nilai),
        created_at: item.created_at
      });

      reviewerTotals[item.reviewer_id] += parseFloat(item.nilai);
    });

    // Calculate totals and averages
    Object.keys(reviewerTotals).forEach(reviewerId => {
      penilaianByReviewer[reviewerId].total_nilai = reviewerTotals[reviewerId];
      totalNilaiKeseluruhan += reviewerTotals[reviewerId];
    });

    const jumlahReviewer = Object.keys(reviewerTotals).length;
    const rataRataNilai = jumlahReviewer > 0 ? totalNilaiKeseluruhan / jumlahReviewer : 0;

    // Get criteria list for reference
    const [kriteriaList] = await db.execute(`
      SELECT id, kode_kriteria, nama_kriteria, bobot
      FROM kriteria
      ORDER BY kode_kriteria
    `);

    return {
      proposal: proposalInfo[0],
      kriteria: kriteriaList,
      penilaian_by_reviewer: Object.values(penilaianByReviewer),
      summary: {
        total_nilai_keseluruhan: totalNilaiKeseluruhan,
        rata_rata_nilai: rataRataNilai,
        jumlah_reviewer: jumlahReviewer
      }
    };
  } catch (error) {
    throw error;
  }
}

  static async create(rankingData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert ranking data
      const [result] = await connection.execute(`
        INSERT INTO ranking_proposal (
          klaster_id,
          proposal_id,
          peringkat,
          matriks_keputusan,
          matriks_normalisasi,
          matriks_terbobot,
          solusi_ideal_positif,
          solusi_ideal_negatif,
          jarak_positif,
          jarak_negatif,
          nilai_preferensi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        rankingData.klaster_id,
        rankingData.proposal_id,
        rankingData.peringkat,
        JSON.stringify(rankingData.matriks_keputusan),
        JSON.stringify(rankingData.matriks_normalisasi),
        JSON.stringify(rankingData.matriks_terbobot),
        JSON.stringify(rankingData.solusi_ideal_positif),
        JSON.stringify(rankingData.solusi_ideal_negatif),
        rankingData.jarak_positif,
        rankingData.jarak_negatif,
        rankingData.nilai_preferensi
      ]);

      // Update proposal status based on ranking and kuota
      const [klaster] = await connection.execute(
        'SELECT kuota_pendanaan FROM klaster WHERE id = ?',
        [rankingData.klaster_id]
      );

      const status = rankingData.peringkat <= klaster[0].kuota_pendanaan
        ? 'Lolos Pendanaan'
        : 'Tidak Lolos Pendanaan';

      await connection.execute(
        'UPDATE proposal SET status = ? WHERE id = ?',
        [status, rankingData.proposal_id]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteByKlaster(klasterId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Reset proposal status
      await connection.execute(`
        UPDATE proposal 
        SET status = 'Dalam Evaluasi Akhir'
        WHERE klaster_id = ? 
        AND status IN ('Lolos Pendanaan', 'Tidak Lolos Pendanaan')
      `, [klasterId]);

      // Delete rankings
      await connection.execute(
        'DELETE FROM ranking_proposal WHERE klaster_id = ?',
        [klasterId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = RankingProposal;