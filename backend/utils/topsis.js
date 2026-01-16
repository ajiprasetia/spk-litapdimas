// backend/utils/topsis.js
const math = require('mathjs');

class TOPSIS {
  constructor(matrix, weights, criteria_types) {
    this.matrix = matrix;
    this.weights = weights;
    this.criteria_types = criteria_types; // array of 'benefit' or 'cost'
    this.normalized = null;
    this.weighted = null;
    this.ideal_pos = null;
    this.ideal_neg = null;
    this.distances_pos = null;
    this.distances_neg = null;
    this.scores = null;
  }

  normalize() {
    const m = this.matrix.length;
    const n = this.matrix[0].length;
    this.normalized = math.zeros([m, n]);

    // Calculate normalization using vector magnitude
    for (let j = 0; j < n; j++) {
      const col = this.matrix.map(row => row[j]);
      const magnitude = Math.sqrt(col.reduce((sum, val) => sum + val * val, 0));
      
      for (let i = 0; i < m; i++) {
        this.normalized[i][j] = this.matrix[i][j] / magnitude;
      }
    }

    return this.normalized;
  }

  weight() {
    if (!this.normalized) {
      this.normalize();
    }

    const m = this.normalized.length;
    const n = this.normalized[0].length;
    this.weighted = math.zeros([m, n]);

    // Apply weights
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        this.weighted[i][j] = this.normalized[i][j] * this.weights[j];
      }
    }

    return this.weighted;
  }

  ideal_solutions() {
    if (!this.weighted) {
      this.weight();
    }

    const n = this.weighted[0].length;
    this.ideal_pos = new Array(n);
    this.ideal_neg = new Array(n);

    for (let j = 0; j < n; j++) {
      const col = this.weighted.map(row => row[j]);
      
      if (this.criteria_types[j] === 'benefit') {
        this.ideal_pos[j] = Math.max(...col);
        this.ideal_neg[j] = Math.min(...col);
      } else { // cost criteria
        this.ideal_pos[j] = Math.min(...col);
        this.ideal_neg[j] = Math.max(...col);
      }
    }

    return {
      positive: this.ideal_pos,
      negative: this.ideal_neg
    };
  }

  distances() {
    if (!this.ideal_pos || !this.ideal_neg) {
      this.ideal_solutions();
    }

    const m = this.weighted.length;
    this.distances_pos = new Array(m);
    this.distances_neg = new Array(m);

    for (let i = 0; i < m; i++) {
      let sum_pos = 0;
      let sum_neg = 0;

      for (let j = 0; j < this.weighted[0].length; j++) {
        sum_pos += Math.pow(this.weighted[i][j] - this.ideal_pos[j], 2);
        sum_neg += Math.pow(this.weighted[i][j] - this.ideal_neg[j], 2);
      }

      this.distances_pos[i] = Math.sqrt(sum_pos);
      this.distances_neg[i] = Math.sqrt(sum_neg);
    }

    return {
      positive: this.distances_pos,
      negative: this.distances_neg
    };
  }

  closeness() {
    if (!this.distances_pos || !this.distances_neg) {
      this.distances();
    }

    const m = this.distances_pos.length;
    this.scores = new Array(m);

    for (let i = 0; i < m; i++) {
      this.scores[i] = this.distances_neg[i] / (this.distances_pos[i] + this.distances_neg[i]);
    }

    return this.scores;
  }

  rank() {
    if (!this.scores) {
      this.closeness();
    }

    // Create array of indices and sort by scores
    const indices = Array.from(Array(this.scores.length).keys());
    indices.sort((a, b) => this.scores[b] - this.scores[a]);

    return indices;
  }

  // Get full results including all intermediate calculations
  getResults() {
    this.closeness();

    return {
      normalized_matrix: this.normalized,
      weighted_matrix: this.weighted,
      ideal_positive: this.ideal_pos,
      ideal_negative: this.ideal_neg, 
      distances_positive: this.distances_pos,
      distances_negative: this.distances_neg,
      preference_values: this.scores,
      rankings: this.rank()
    };
  }
}

module.exports = TOPSIS;