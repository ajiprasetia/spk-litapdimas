// backend/models/proposalModel.js
const db = require('../config/database');

class Proposal {
  static async findByPenelitiId(penelitiId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.*, 
          k.nama_klaster,
          ta.tahun_anggaran,
          ta.status as tahun_status
        FROM proposal p
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN tahun_anggaran ta ON p.tahun_anggaran_id = ta.id
        WHERE p.peneliti_id = ?
        ORDER BY p.created_at DESC
      `, [penelitiId]);
      
      return rows.map(row => ({
        ...row,
        reviewer_ids: row.reviewer_id ? JSON.parse(row.reviewer_id) : []
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findByTahunAnggaran(tahunAnggaranId) {
    try {
      const [rows] = await db.execute(`
        SELECT
          p.*,
          k.nama_klaster,
          u.nama as nama_user,
          CONCAT('Peneliti ID: ', pl.id) as peneliti_id_display,
          up.bidang_ilmu as peneliti_bidang_ilmu,
          ta.tahun_anggaran,
          ta.status as tahun_status
        FROM proposal p
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN peneliti pl ON p.peneliti_id = pl.id
        LEFT JOIN users u ON pl.user_id = u.id
        LEFT JOIN user_profile up ON pl.user_id = up.user_id
        LEFT JOIN tahun_anggaran ta ON p.tahun_anggaran_id = ta.id
        WHERE p.tahun_anggaran_id = ?
        ORDER BY p.created_at DESC
      `, [tahunAnggaranId]);

      // Get reviewer details for each proposal
      const proposals = await Promise.all(rows.map(async (proposal) => {
        let reviewers = [];
        if (proposal.reviewer_id) {
          try {
            const reviewerIds = JSON.parse(proposal.reviewer_id);
            
            if (Array.isArray(reviewerIds) && reviewerIds.length > 0) {
              const placeholders = reviewerIds.map(() => '?').join(',');
              const [reviewerRows] = await db.execute(`
                SELECT 
                  r.id,
                  u.nama as reviewer_nama,
                  CONCAT('Reviewer ID: ', r.id) as reviewer_id_display
                FROM reviewer r
                JOIN users u ON r.user_id = u.id
                WHERE r.id IN (${placeholders})
              `, reviewerIds);
              reviewers = reviewerRows;
            }
          } catch (parseError) {
            // Handle old format (single reviewer_id as number)
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
              reviewers = reviewerRows;
            }
          }
        }

        return {
          ...proposal,
          reviewer_ids: proposal.reviewer_id ? 
            (Array.isArray(JSON.parse(proposal.reviewer_id || '[]')) ? 
              JSON.parse(proposal.reviewer_id) : [proposal.reviewer_id]) : [],
          reviewers: reviewers,
          reviewer_names: reviewers.map(r => r.reviewer_nama).join(', ')
        };
      }));

      return proposals;
    } catch (error) {
      throw error;
    }
  }

  static async findByPenelitiIdAndTahunAnggaran(penelitiId, tahunAnggaranId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.*, 
          k.nama_klaster,
          ta.tahun_anggaran,
          ta.status as tahun_status
        FROM proposal p
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN tahun_anggaran ta ON p.tahun_anggaran_id = ta.id
        WHERE p.peneliti_id = ? AND p.tahun_anggaran_id = ?
        ORDER BY p.created_at DESC
      `, [penelitiId, tahunAnggaranId]);
      
      return rows.map(row => ({
        ...row,
        reviewer_ids: row.reviewer_id ? JSON.parse(row.reviewer_id) : []
      }));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT
          p.*,
          k.nama_klaster,
          u.nama as nama_user,
          u.email as peneliti_email,
          up.nip_niy,
          up.jenis_kelamin,
          up.nomor_whatsapp,
          CONCAT('Peneliti ID: ', pl.id) as peneliti_id_display,
          up.bidang_ilmu as peneliti_bidang_ilmu,
          ta.tahun_anggaran,
          ta.status as tahun_status
        FROM proposal p
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN peneliti pl ON p.peneliti_id = pl.id
        LEFT JOIN users u ON pl.user_id = u.id
        LEFT JOIN user_profile up ON pl.user_id = up.user_id
        LEFT JOIN tahun_anggaran ta ON p.tahun_anggaran_id = ta.id
        WHERE p.id = ?
      `, [id]);

      if (rows[0]) {
        const proposal = rows[0];
        
        // Parse reviewer_id JSON and get reviewer details
        let reviewers = [];
        if (proposal.reviewer_id) {
          try {
            const reviewerIds = JSON.parse(proposal.reviewer_id);
            
            if (Array.isArray(reviewerIds) && reviewerIds.length > 0) {
              const placeholders = reviewerIds.map(() => '?').join(',');
              const [reviewerRows] = await db.execute(`
                SELECT 
                  r.id,
                  u.nama as reviewer_nama,
                  CONCAT('Reviewer ID: ', r.id) as reviewer_id_display
                FROM reviewer r
                JOIN users u ON r.user_id = u.id
                WHERE r.id IN (${placeholders})
              `, reviewerIds);
              reviewers = reviewerRows;
            }
          } catch (parseError) {
            // Handle old format (single reviewer_id as number)
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
              reviewers = reviewerRows;
            }
          }
        }

        return {
          ...proposal,
          reviewer_ids: proposal.reviewer_id ? 
            (Array.isArray(JSON.parse(proposal.reviewer_id || '[]')) ? 
              JSON.parse(proposal.reviewer_id) : [proposal.reviewer_id]) : [],
          reviewers: reviewers
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    const {
      peneliti_id,
      tahun_anggaran_id,
      judul,
      klaster_id,
      bidang_ilmu,
      outline,
      file_proposal,
      file_rab
    } = data;

    try {
      // Validate tahun_anggaran exists
      if (tahun_anggaran_id) {
        const [tahunCheck] = await db.execute(
          'SELECT id FROM tahun_anggaran WHERE id = ?',
          [tahun_anggaran_id]
        );
        if (tahunCheck.length === 0) {
          throw new Error('Tahun anggaran tidak ditemukan');
        }
      }

      // Validate klaster exists and belongs to the same tahun_anggaran
      const [klasterCheck] = await db.execute(
        'SELECT tahun_anggaran_id FROM klaster WHERE id = ?',
        [klaster_id]
      );
      if (klasterCheck.length === 0) {
        throw new Error('Klaster tidak ditemukan');
      }
      if (klasterCheck[0].tahun_anggaran_id !== tahun_anggaran_id) {
        throw new Error('Klaster tidak sesuai dengan tahun anggaran yang dipilih');
      }

      // Check if peneliti already has proposal for this klaster in the same tahun_anggaran
      const [existingProposal] = await db.execute(`
        SELECT id FROM proposal 
        WHERE peneliti_id = ? AND klaster_id = ? AND tahun_anggaran_id = ?
      `, [peneliti_id, klaster_id, tahun_anggaran_id]);

      if (existingProposal.length > 0) {
        throw new Error('Anda sudah mengajukan proposal untuk klaster ini di tahun anggaran yang sama');
      }

      const [result] = await db.execute(
        `INSERT INTO proposal (
          peneliti_id, tahun_anggaran_id, judul, klaster_id, bidang_ilmu, outline,
          file_proposal, file_rab, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Belum Diperiksa')`,
        [peneliti_id, tahun_anggaran_id, judul, klaster_id, bidang_ilmu, outline, file_proposal, file_rab]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, reviewerIds = null, catatanAdmin = null) {
    try {
      const [result] = await db.execute(`
        UPDATE proposal 
        SET status = ?, reviewer_id = ?, catatan_admin = ?
        WHERE id = ?
      `, [
        status,
        reviewerIds ? JSON.stringify(reviewerIds) : null,
        catatanAdmin,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatusAndReviewers(id, { status, catatan = null, reviewer_ids = null }) {
    try {
      // Convert reviewer_ids array to JSON
      const reviewerJson = reviewer_ids && reviewer_ids.length > 0 ? 
        JSON.stringify(reviewer_ids) : null;
      
      const [result] = await db.execute(
        `UPDATE proposal SET
          status = ?,
          reviewer_id = ?,
          catatan_admin = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [status, reviewerJson, catatan, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Admin methods
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT
          p.*,
          k.nama_klaster,
          u.nama as nama_user,
          CONCAT('Peneliti ID: ', pl.id) as peneliti_id_display,
          up.bidang_ilmu as peneliti_bidang_ilmu,
          ta.tahun_anggaran,
          ta.status as tahun_status
        FROM proposal p
        LEFT JOIN klaster k ON p.klaster_id = k.id
        LEFT JOIN peneliti pl ON p.peneliti_id = pl.id
        LEFT JOIN users u ON pl.user_id = u.id
        LEFT JOIN user_profile up ON pl.user_id = up.user_id
        LEFT JOIN tahun_anggaran ta ON p.tahun_anggaran_id = ta.id
        ORDER BY p.created_at DESC
      `);

      // Get reviewer details for each proposal
      const proposals = await Promise.all(rows.map(async (proposal) => {
        let reviewers = [];
        if (proposal.reviewer_id) {
          try {
            const reviewerIds = JSON.parse(proposal.reviewer_id);
            
            if (Array.isArray(reviewerIds) && reviewerIds.length > 0) {
              const placeholders = reviewerIds.map(() => '?').join(',');
              const [reviewerRows] = await db.execute(`
                SELECT 
                  r.id,
                  u.nama as reviewer_nama,
                  CONCAT('Reviewer ID: ', r.id) as reviewer_id_display
                FROM reviewer r
                JOIN users u ON r.user_id = u.id
                WHERE r.id IN (${placeholders})
              `, reviewerIds);
              reviewers = reviewerRows;
            }
          } catch (parseError) {
            // Handle old format (single reviewer_id as number)
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
              reviewers = reviewerRows;
            }
          }
        }

        return {
          ...proposal,
          reviewer_ids: proposal.reviewer_id ? 
            (Array.isArray(JSON.parse(proposal.reviewer_id || '[]')) ? 
              JSON.parse(proposal.reviewer_id) : [proposal.reviewer_id]) : [],
          reviewers: reviewers,
          reviewer_names: reviewers.map(r => r.reviewer_nama).join(', ')
        };
      }));

      return proposals;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableReviewers(proposalId) {
    try {
      // Get proposal dengan bidang ilmu
      const [proposal] = await db.execute(
        'SELECT bidang_ilmu, peneliti_id FROM proposal WHERE id = ?',
        [proposalId]
      );
      
      if (!proposal[0]) {
        throw new Error('Proposal tidak ditemukan');
      }

      const proposalBidangIlmu = proposal[0].bidang_ilmu;

      // Get reviewers yang sesuai bidang ilmu dan exclude proposal owner
      const [reviewers] = await db.execute(`
        SELECT 
          u.id as user_id,
          u.nama,
          up.bidang_ilmu,
          r.id as reviewer_id
        FROM users u
        JOIN reviewer r ON u.id = r.user_id
        JOIN user_profile up ON u.id = up.user_id
        WHERE r.status_reviewer = 'Terdaftar'
        AND up.bidang_ilmu = ?
        AND u.id != (
          SELECT user_id 
          FROM peneliti 
          WHERE id = ?
        )
        ORDER BY u.nama ASC
      `, [proposalBidangIlmu, proposal[0].peneliti_id]);

      // Get workload dan proposal yang belum direview untuk setiap reviewer
      const reviewersWithWorkload = await Promise.all(
        reviewers.map(async (reviewer) => {
          // Hitung total proposal yang sedang di-review oleh reviewer ini
          const [currentWorkload] = await db.execute(`
            SELECT COUNT(DISTINCT p.id) as total_reviewing
            FROM proposal p
            WHERE JSON_CONTAINS(p.reviewer_id, ?, '$')
            AND p.status IN ('Tahap Review', 'Dalam Evaluasi Akhir')
          `, [JSON.stringify(reviewer.reviewer_id)]);

          // Get daftar proposal yang belum direview oleh reviewer ini
          const [unreviewed] = await db.execute(`
            SELECT 
              p.id,
              p.judul,
              p.status,
              pl.nama as peneliti_nama
            FROM proposal p
            JOIN peneliti pen ON p.peneliti_id = pen.id
            JOIN users pl ON pen.user_id = pl.id
            WHERE JSON_CONTAINS(p.reviewer_id, ?, '$')
            AND p.status IN ('Tahap Review', 'Dalam Evaluasi Akhir')
            AND NOT EXISTS (
              SELECT 1 FROM penilaian_proposal pp 
              WHERE pp.proposal_id = p.id 
              AND pp.reviewer_id = ?
            )
            ORDER BY p.created_at ASC
          `, [JSON.stringify(reviewer.reviewer_id), reviewer.reviewer_id]);

          return {
            ...reviewer,
            current_workload: currentWorkload[0].total_reviewing,
            unreviewed_proposals: unreviewed
          };
        })
      );

      return reviewersWithWorkload;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Proposal;