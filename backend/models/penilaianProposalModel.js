// backend/models/penilaianProposalModel.js
const db = require('../config/database');

class PenilaianProposal {
  // Get daftar penugasan untuk reviewer
  static async findByReviewer(userId) {
    try {
      const [reviewer] = await db.execute(
        'SELECT id FROM reviewer WHERE user_id = ?',
        [userId]
      );
      
      if (!reviewer[0]) {
        throw new Error('Reviewer tidak ditemukan');
      }

      // Query yang di-update untuk handle JSON array reviewer_ids
      const [rows] = await db.execute(`
        SELECT
          p.*,
          k.nama_klaster,
          u.nama as nama_peneliti,
          CONCAT('Peneliti ID: ', pl.id) as peneliti_id_display,
          COALESCE(SUM(CASE WHEN pp.reviewer_id = ? THEN pp.nilai ELSE 0 END), 0) as nilai,
          CASE
            WHEN COUNT(CASE WHEN pp.reviewer_id = ? THEN pp.id END) > 0 THEN 'Sudah Direview'
            ELSE 'Belum Direview'
          END as status_penilaian
        FROM proposal p
        LEFT JOIN penilaian_proposal pp ON p.id = pp.proposal_id
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN peneliti pl ON p.peneliti_id = pl.id
        LEFT JOIN users u ON pl.user_id = u.id
        WHERE JSON_CONTAINS(p.reviewer_id, ?, '$')
          AND p.status IN ('Tahap Review', 'Dalam Evaluasi Akhir', 'Lolos Pendanaan', 'Tidak Lolos Pendanaan')
        GROUP BY p.id, k.nama_klaster, u.nama, pl.id
        ORDER BY p.created_at DESC`,
        [reviewer[0].id, reviewer[0].id, JSON.stringify(reviewer[0].id)]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get detail penilaian proposal
  static async findByProposalId(proposalId) {
  try {
    const [rows] = await db.execute(
      `SELECT
        pp.*,
        k.kode_kriteria,
        k.nama_kriteria,
        k.bobot as bobot_kriteria,
        sk.tipe,
        sk.skor,
        sk.deskripsi,
        u.nama as reviewer_nama
      FROM penilaian_proposal pp
      JOIN kriteria k ON pp.kriteria_id = k.id
      JOIN sub_kriteria sk ON pp.sub_kriteria_id = sk.id
      JOIN reviewer r ON pp.reviewer_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE pp.proposal_id = ?
      ORDER BY k.kode_kriteria ASC, pp.reviewer_id ASC`,
      [proposalId]
    );

    // Calculate total nilai (sum all reviewer scores)
    const totalNilai = rows.reduce((sum, row) => sum + parseFloat(row.nilai), 0);

    return {
      detail: rows,
      total_nilai: totalNilai.toFixed(2)
    };
  } catch (error) {
    throw error;
  }
}

  // Get detail penilaian untuk reviewer tertentu
  static async findByProposalAndReviewer(proposalId, reviewerId) {
    try {
      const [rows] = await db.execute(
        `SELECT
          pp.*,
          k.kode_kriteria,
          k.nama_kriteria,
          k.bobot as bobot_kriteria,
          sk.tipe,
          sk.skor,
          sk.deskripsi
        FROM penilaian_proposal pp
        JOIN kriteria k ON pp.kriteria_id = k.id
        JOIN sub_kriteria sk ON pp.sub_kriteria_id = sk.id
        WHERE pp.proposal_id = ? AND pp.reviewer_id = ?
        ORDER BY k.kode_kriteria ASC`,
        [proposalId, reviewerId]
      );

      const totalNilai = rows.reduce((sum, row) => sum + parseFloat(row.nilai), 0);

      return {
        detail: rows,
        total_nilai: totalNilai.toFixed(2)
      };
    } catch (error) {
      throw error;
    }
  }

  // Create penilaian proposal
  static async create(data) {
    const {
      proposal_id,
      reviewer_id,
      penilaian
    } = data;

    const connection = await db.getConnection();
    try {
      // Check if already exists
      const [existing] = await connection.execute(
        'SELECT id FROM penilaian_proposal WHERE proposal_id = ? AND reviewer_id = ?',
        [proposal_id, reviewer_id]
      );

      if (existing.length > 0) {
        throw new Error('Proposal sudah dinilai oleh reviewer ini');
      }

      // Begin transaction
      await connection.beginTransaction();

      try {
        // Insert penilaian for each kriteria
        for (const nilai of penilaian) {
          await connection.execute(
            `INSERT INTO penilaian_proposal (
              proposal_id,
              reviewer_id,
              kriteria_id,
              sub_kriteria_id,
              nilai
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              proposal_id,
              reviewer_id,
              nilai.kriteria_id,
              nilai.sub_kriteria_id,
              nilai.nilai
            ]
          );
        }

        // Check if all assigned reviewers have completed their review
        const [proposal] = await connection.execute(
          'SELECT reviewer_id FROM proposal WHERE id = ?',
          [proposal_id]
        );

        if (proposal[0] && proposal[0].reviewer_id) {
          const assignedReviewers = JSON.parse(proposal[0].reviewer_id);
          
          // Count completed reviews
          const [completedReviews] = await connection.execute(
            `SELECT DISTINCT reviewer_id 
             FROM penilaian_proposal 
             WHERE proposal_id = ?`,
            [proposal_id]
          );

          const completedReviewerIds = completedReviews.map(r => r.reviewer_id);
          const allReviewsCompleted = assignedReviewers.every(id => 
            completedReviewerIds.includes(id)
          );

          // Update proposal status if all reviews are completed
          if (allReviewsCompleted) {
            await connection.execute(
              'UPDATE proposal SET status = "Dalam Evaluasi Akhir" WHERE id = ?',
              [proposal_id]
            );
          }
        }

        // Commit transaction
        await connection.commit();
        return true;
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    } finally {
      // Release connection back to pool
      connection.release();
    }
  }
}

module.exports = PenilaianProposal;