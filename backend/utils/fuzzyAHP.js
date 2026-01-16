// backend/utils/fuzzyAHP.js
const math = require('mathjs');

const SKALA_TFN = {
  '9': [7, 9, 9],    // Mutlak lebih penting
  '7': [5, 7, 9],    // Sangat lebih penting
  '5': [3, 5, 7],    // Lebih penting
  '3': [1, 3, 5],    // Sedikit lebih penting
  '1': [1, 1, 3],    // Sama penting
  '1/3': [1/5, 1/3, 1], // Sedikit kurang penting
  '1/5': [1/7, 1/5, 1/3], // Kurang penting
  '1/7': [1/9, 1/7, 1/5], // Sangat kurang penting
  '1/9': [1/9, 1/9, 1/7]  // Mutlak kurang penting
};

class FuzzyAHP {
  static getKebalikan(nilai) {
    if (nilai === '1') return '1';
    if (nilai.startsWith('1/')) return nilai.substring(2);
    return `1/${nilai}`;
  }

  static hitungMatriksFuzzy(matriksPerbandingan) {
    const n = matriksPerbandingan.length;
    const matriksFuzzy = {
      l: math.zeros([n, n]),
      m: math.zeros([n, n]),
      u: math.zeros([n, n])
    };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const nilai = matriksPerbandingan[i][j];
        const [l, m, u] = SKALA_TFN[nilai];
        matriksFuzzy.l[i][j] = l;
        matriksFuzzy.m[i][j] = m;
        matriksFuzzy.u[i][j] = u;
      }
    }

    return matriksFuzzy;
  }

  static hitungSintesisFuzzy(matriksFuzzy) {
    const n = matriksFuzzy.l.length;
    const sintesis = [];

    // Hitung jumlah per baris
    for (let i = 0; i < n; i++) {
      let sumL = 0, sumM = 0, sumU = 0;
      for (let j = 0; j < n; j++) {
        sumL += matriksFuzzy.l[i][j];
        sumM += matriksFuzzy.m[i][j];
        sumU += matriksFuzzy.u[i][j];
      }
      sintesis.push({ l: sumL, m: sumM, u: sumU });
    }

    // Hitung total
    const total = sintesis.reduce((acc, curr) => ({
      l: acc.l + curr.l,
      m: acc.m + curr.m,
      u: acc.u + curr.u
    }), { l: 0, m: 0, u: 0 });

    // Normalisasi
    return sintesis.map(s => ({
      l: s.l / total.u,
      m: s.m / total.m,
      u: s.u / total.l
    }));
  }

  static hitungDerajatKemungkinan(sintesis) {
    const n = sintesis.length;
    const derajat = math.zeros([n, n]);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          derajat[i][j] = this.hitungNilaiV(sintesis[i], sintesis[j]);
        } else {
          derajat[i][j] = 1;
        }
      }
    }

    return derajat;
  }

  static hitungNilaiV(M1, M2) {
    if (M1.m >= M2.m) return 1;
    if (M2.l >= M1.u) return 0;
    return (M2.l - M1.u) / ((M1.m - M1.u) - (M2.m - M2.l));
  }

  static hitungBobotFinal(derajat) {
    const n = derajat.length;
    const minDerajat = derajat.map((row, i) => 
      Math.min(...row.filter((_, j) => i !== j))
    );
    
    const total = math.sum(minDerajat);
    return minDerajat.map(d => d / total);
  }

  static hitungKonsistensiRasio(matriksPerbandingan) {
    const n = matriksPerbandingan.length;
    // Konversi string ke nilai numerik
    const matrix = matriksPerbandingan.map(row => 
      row.map(val => {
        if (val.includes('/')) {
          const [num, den] = val.split('/');
          return parseFloat(num) / parseFloat(den);
        }
        return parseFloat(val);
      })
    );

    // Hitung eigenvalue maksimum
    const eigenvalue = this.hitungEigenvalue(matrix);
    
    // Random Index (RI) untuk n = 1 sampai 10
    const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
    
    // Hitung Consistency Index (CI)
    const CI = (eigenvalue - n) / (n - 1);
    
    // Hitung Consistency Ratio (CR)
    const CR = CI / RI[n - 1];
    
    // Pastikan mengembalikan nilai numerik
    return Number(CR.toFixed(4));
}

static hitungEigenvalue(matrix) {
    const n = matrix.length;
    
    // Hitung jumlah setiap kolom
    const colSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            colSums[j] += matrix[i][j];
        }
    }
    
    // Normalisasi matriks
    const normalizedMatrix = matrix.map(row =>
        row.map((val, j) => val / colSums[j])
    );
    
    // Hitung rata-rata baris (eigenvektor)
    const eigenVector = normalizedMatrix.map(row =>
        row.reduce((sum, val) => sum + val, 0) / n
    );
    
    // Hitung AW
    const AW = matrix.map((row, i) =>
        row.reduce((sum, val, j) => sum + val * eigenVector[j], 0)
    );
    
    // Hitung λmax
    const lambdaMax = AW.reduce((sum, val, i) => 
        sum + val / eigenVector[i], 0
    ) / n;
    
    return lambdaMax;
  }

  static validasiKonsistensi(CR) {
    return CR <= 0.1; // CR harus <= 0.1 untuk dianggap konsisten
  }
}

module.exports = FuzzyAHP;