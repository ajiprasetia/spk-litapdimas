// backend/controllers/proposalController.js
const Proposal = require('../models/proposalModel');
const Peneliti = require('../models/penelitiModel');
const Reviewer = require('../models/reviewerModel');
const fs = require('fs').promises;
const path = require('path');

exports.getAllProposal = async (req, res) => {
  try {
    // Get peneliti status using PenelitiModel
    const penelitiStatus = await Peneliti.findByUserId(req.user.id);
    
    if (!penelitiStatus || penelitiStatus.status_peneliti !== 'Terdaftar') {
      return res.status(403).json({ message: 'Akses ditolak. Anda bukan peneliti terdaftar.' });
    }

    const { tahun_anggaran_id } = req.query;

    let proposals;
    if (tahun_anggaran_id) {
      proposals = await Proposal.findByPenelitiIdAndTahunAnggaran(penelitiStatus.id, tahun_anggaran_id);
    } else {
      proposals = await Proposal.findByPenelitiId(penelitiStatus.id);
    }

    res.json(proposals);
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ message: 'Gagal memuat data proposal' });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal tidak ditemukan' });
    }

    // Get peneliti status
    const penelitiStatus = await Peneliti.findByUserId(req.user.id);
    
    // Get reviewer status if needed
    let isReviewer = false;
    if (proposal.reviewer_ids && proposal.reviewer_ids.length > 0) {
      const reviewerStatus = await Reviewer.findByUserId(req.user.id);
      if (reviewerStatus && reviewerStatus.status_reviewer === 'Terdaftar') {
        isReviewer = proposal.reviewer_ids.includes(reviewerStatus.id);
      }
    }

    // Allow access for:
    // 1. Admin
    // 2. Owner of proposal (peneliti)
    // 3. Assigned reviewer (with active status)
    if (
      req.user.role === 'Admin' ||
      (penelitiStatus && proposal.peneliti_id === penelitiStatus.id) ||
      isReviewer
    ) {
      res.json(proposal);
    } else {
      res.status(403).json({ message: 'Tidak memiliki akses' });
    }
  } catch (error) {
    console.error('Get proposal detail error:', error);
    res.status(500).json({ message: 'Gagal memuat detail proposal' });
  }
};

exports.createProposal = async (req, res) => {
  try {
    const {
      tahun_anggaran_id,
      judul,
      klaster_id,
      bidang_ilmu,
      outline
    } = req.body;

    // Basic validation
    if (!tahun_anggaran_id) {
      return res.status(400).json({ message: 'Tahun anggaran harus dipilih' });
    }

    if (!judul) {
      return res.status(400).json({ message: 'Judul proposal harus diisi' });
    }

    if (!klaster_id) {
      return res.status(400).json({ message: 'Klaster harus dipilih' });
    }

    if (!bidang_ilmu) {
      return res.status(400).json({ message: 'Bidang ilmu harus dipilih' });
    }

    if (!outline) {
      return res.status(400).json({ message: 'Outline harus diisi' });
    }

    // Validate required files
    if (!req.files || !req.files.file_proposal) {
      return res.status(400).json({ message: 'File proposal harus diupload' });
    }

    if (!req.files.file_rab) {
      return res.status(400).json({ message: 'File RAB harus diupload' });
    }

    // Get peneliti status
    const penelitiStatus = await Peneliti.findByUserId(req.user.id);
    if (!penelitiStatus || penelitiStatus.status_peneliti !== 'Terdaftar') {
      return res.status(403).json({
        message: 'Anda harus terdaftar sebagai peneliti untuk mengajukan proposal'
      });
    }

    const fileProposal = req.files.file_proposal[0];
    const fileRAB = req.files.file_rab[0];

    const data = {
      peneliti_id: penelitiStatus.id,
      tahun_anggaran_id: parseInt(tahun_anggaran_id),
      judul,
      klaster_id: parseInt(klaster_id),
      bidang_ilmu,
      outline,
      file_proposal: fileProposal.filename,
      file_rab: fileRAB.filename
    };

    const id = await Proposal.create(data);
    const newProposal = await Proposal.findById(id);

    res.status(201).json({
      message: 'Proposal berhasil diajukan',
      data: newProposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      if (req.files.file_proposal) {
        try {
          await fs.unlink(req.files.file_proposal[0].path);
        } catch (unlinkError) {
          console.error('Error deleting file_proposal:', unlinkError);
        }
      }
      if (req.files.file_rab) {
        try {
          await fs.unlink(req.files.file_rab[0].path);
        } catch (unlinkError) {
          console.error('Error deleting file_rab:', unlinkError);
        }
      }
    }

    res.status(500).json({ 
      message: error.message || 'Gagal mengajukan proposal' 
    });
  }
};

// Admin controllers
exports.getAllProposalAdmin = async (req, res) => {
  try {
    const { tahun_anggaran_id } = req.query;

    let proposals;
    if (tahun_anggaran_id) {
      proposals = await Proposal.findByTahunAnggaran(tahun_anggaran_id);
    } else {
      proposals = await Proposal.findAll();
    }

    res.json(proposals);
  } catch (error) {
    console.error('Get all proposals error:', error);
    res.status(500).json({ message: 'Gagal memuat data proposal' });
  }
};

exports.getAvailableReviewers = async (req, res) => {
  try {
    const proposalId = req.params.id;
    
    // Get proposal info untuk konteks
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal tidak ditemukan' });
    }

    // Get list of available reviewers dengan workload info
    const reviewers = await Proposal.getAvailableReviewers(proposalId);
    
    // Filter active reviewers dan format data
    const activeReviewers = [];
    for (const reviewer of reviewers) {
      if (reviewer.user_id) {
        const reviewerStatus = await Reviewer.findByUserId(reviewer.user_id);
        if (reviewerStatus && reviewerStatus.status_reviewer === 'Terdaftar') {
          activeReviewers.push({
            id: reviewer.user_id,
            reviewer_id: reviewer.reviewer_id,
            nama: reviewer.nama,
            bidang_ilmu: reviewer.bidang_ilmu || 'Bidang ilmu tidak diisi',
            current_workload: reviewer.current_workload,
            unreviewed_proposals: reviewer.unreviewed_proposals
          });
        }
      }
    }

    // Sort berdasarkan workload (yang paling sedikit dulu)
    activeReviewers.sort((a, b) => a.current_workload - b.current_workload);

    res.json({
      proposal_info: {
        id: proposal.id,
        judul: proposal.judul,
        bidang_ilmu: proposal.bidang_ilmu,
        peneliti: proposal.nama_user,
        klaster: proposal.nama_klaster,
        tahun_anggaran: proposal.tahun_anggaran,
        outline: proposal.outline
      },
      available_reviewers: activeReviewers
    });
  } catch (error) {
    console.error('Get reviewers error:', error);
    res.status(500).json({ message: 'Gagal memuat daftar reviewer' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, catatan, reviewer_ids } = req.body; // Ubah dari reviewer_id ke reviewer_ids (array)
    const id = req.params.id;

    // Validate status
    const validStatuses = [
      'Belum Diperiksa',
      'Ditolak',
      'Tahap Review',
      'Dalam Evaluasi Akhir',
      'Lolos Pendanaan',
      'Tidak Lolos Pendanaan'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    if (status === 'Tahap Review' && (!reviewer_ids || reviewer_ids.length === 0)) {
      return res.status(400).json({
        message: 'Minimal 1 reviewer harus dipilih untuk tahap review'
      });
    }

    // Validasi maksimal 2 reviewer
    if (reviewer_ids && reviewer_ids.length > 2) {
      return res.status(400).json({
        message: 'Maksimal 2 reviewer yang dapat ditugaskan'
      });
    }

    // Validasi reviewer yang dipilih
    let actualReviewerIds = null;
    if (reviewer_ids && reviewer_ids.length > 0) {
      actualReviewerIds = [];
      
      for (const reviewerId of reviewer_ids) {
        const reviewer = await Reviewer.findByUserId(reviewerId);
        if (!reviewer || reviewer.status_reviewer !== 'Terdaftar') {
          return res.status(400).json({
            message: `Reviewer dengan ID ${reviewerId} tidak valid atau tidak aktif`
          });
        }
        actualReviewerIds.push(reviewer.id);
      }
    }

    await Proposal.updateStatusAndReviewers(id, {
      status,
      catatan,
      reviewer_ids: status === 'Tahap Review' ? actualReviewerIds : null
    });

    res.json({
      message: 'Status proposal berhasil diupdate'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Gagal mengupdate status' });
  }
};

exports.getFileUrl = (filename, type) => {
  if (!filename) return null;
  return `/uploads/${type}/${filename}`;
};