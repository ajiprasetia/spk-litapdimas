// backend/controllers/penilaianProposalController.js
const PenilaianProposal = require('../models/penilaianProposalModel');
const Proposal = require('../models/proposalModel');
const Kriteria = require('../models/kriteriaModel');
const SubKriteria = require('../models/subKriteriaModel');
const Reviewer = require('../models/reviewerModel');

exports.getDaftarPenugasan = async (req, res) => {
  try {
    const proposals = await PenilaianProposal.findByReviewer(req.user.id);
    res.json(proposals);
  } catch (error) {
    console.error('Get penugasan error:', error);
    res.status(500).json({
      message: error.message || 'Gagal memuat daftar penugasan'
    });
  }
};

exports.getDetailPenilaian = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get proposal detail
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        message: 'Proposal tidak ditemukan'
      });
    }

    // Verify reviewer access
    const reviewer = await Reviewer.findByUserId(req.user.id);
    if (!reviewer || !proposal.reviewer_ids.includes(reviewer.id)) {
      return res.status(403).json({
        message: 'Tidak memiliki akses'
      });
    }

    // Get existing penilaian for this reviewer
    const penilaianData = await PenilaianProposal.findByProposalAndReviewer(id, reviewer.id);
    
    // Get kriteria and sub-kriteria for form
    const kriteriaList = await Kriteria.findAll();
    
    // Get sub-kriteria for each kriteria
    const kriteriaWithSub = await Promise.all(
      kriteriaList.map(async (k) => {
        const subKriteria = await SubKriteria.findByKriteria(k.id);
        return {
          ...k,
          sub_kriteria: subKriteria.map(sub => ({
            ...sub,
            nilai: penilaianData?.detail?.find(p =>
              p.kriteria_id === k.id &&
              p.sub_kriteria_id === sub.id
            )?.nilai || 0
          }))
        };
      })
    );

    res.json({
      proposal,
      kriteria: kriteriaWithSub,
      penilaian: penilaianData?.detail?.length ? {
        total_nilai: penilaianData.total_nilai,
        detail: penilaianData.detail
      } : null
    });
  } catch (error) {
    console.error('Get detail penilaian error:', error);
    res.status(500).json({
      message: error.message || 'Gagal memuat detail penilaian'
    });
  }
};

exports.submitPenilaian = async (req, res) => {
  try {
    const {
      proposal_id,
      penilaian
    } = req.body;

    // Get proposal
    const proposal = await Proposal.findById(proposal_id);
    if (!proposal) {
      return res.status(404).json({
        message: 'Proposal tidak ditemukan'
      });
    }

    // Verify reviewer access
    const reviewer = await Reviewer.findByUserId(req.user.id);
    if (!reviewer || !proposal.reviewer_ids.includes(reviewer.id)) {
      return res.status(403).json({
        message: 'Tidak memiliki akses'
      });
    }

    // Submit penilaian
    await PenilaianProposal.create({
      proposal_id,
      reviewer_id: reviewer.id,
      penilaian
    });

    res.status(201).json({
      message: 'Penilaian berhasil disimpan'
    });
  } catch (error) {
    console.error('Submit penilaian error:', error);
    res.status(500).json({
      message: error.message || 'Gagal menyimpan penilaian'
    });
  }
};