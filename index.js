export default {
  async fetch(request, env, ctx) {
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Quiskuy | Belajar Cloudflare Workers</title>
  <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/64/616/616408.png" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(to bottom, #dbeafe, #93c5fd);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .quiz-container {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      max-width: 600px;
      width: 100%;
      text-align: center;
      position: relative;
      min-height: 320px;
    }
    .option {
      display: block;
      width: 100%;
      margin: 12px 0;
      padding: 14px 18px;
      background: #e0f2fe;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: 0.3s;
      font-size: 16px;
    }
    .option:hover {
      background: #bae6fd;
    }
    .correct {
      background: #86efac !important;
    }
    .wrong {
      background: #fca5a5 !important;
    }
    .feedback {
      font-size: 22px;
      margin: 20px 0;
      font-weight: bold;
      min-height: 32px;
    }
    .controls {
      margin-top: 20px;
    }
    .controls button {
      margin: 0 10px;
      padding: 10px 18px;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.3s;
      background-color: #3b82f6;
      color: white;
    }
    .controls button:hover {
      background-color: #2563eb;
    }
    .popup {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 36px;
      animation: pop 0.5s ease-out forwards;
    }
    @keyframes pop {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .timer {
      font-size: 20px;
      color: #ef4444;
      margin-bottom: 10px;
    }
    .result {
      font-size: 24px;
      font-weight: 600;
      margin-top: 10px;
    }
    .stars {
      margin-top: 15px;
      font-size: 36px;
      color: #fbbf24; /* gold */
    }
  </style>
</head>
<body>
  <div class="quiz-container" id="quiz">
    <div id="popup"></div>
    <h2 id="question">Memuat soal...</h2>
    <div id="options"></div>
    <div class="timer" id="timer">10</div>
    <div class="feedback" id="feedback"></div>
    <div class="controls">
      <button onclick="prevQuestion()">Kembali</button>
      <button onclick="nextQuestion()">Lanjutkan</button>
    </div>
  </div>

  <script>
    const questions = [
      { question: "Apa ibu kota provinsi Sulawesi Selatan?", options: ["Bandung", "Makassar", "Manado", "Banjarmasin"], answer: "Makassar" },
      { question: "Benda langit yang memancarkan cahaya sendiri disebut?", options: ["Planet", "Meteor", "Bintang", "Komet"], answer: "Bintang" },
      { question: "Lapisan atmosfer terluar disebut?", options: ["Stratosfer", "Termosfer", "Eksosfer", "Mesosfer"], answer: "Eksosfer" },
      { question: "Sungai Nil terdapat di benua?", options: ["Asia", "Afrika", "Eropa", "Amerika"], answer: "Afrika" },
      { question: "Planet terdekat dengan matahari?", options: ["Bumi", "Venus", "Mars", "Merkurius"], answer: "Merkurius" },
      { question: "Gunung tertinggi di Indonesia?", options: ["Kerinci", "Semeru", "Rinjani", "Puncak Jaya"], answer: "Puncak Jaya" },
      { question: "Apa nama alat untuk mengukur suhu?", options: ["Barometer", "Termometer", "Anemometer", "Altimeter"], answer: "Termometer" },
      { question: "Ibukota dari provinsi Kalimantan Timur adalah?", options: ["Samarinda", "Balikpapan", "Pontianak", "Banjarmasin"], answer: "Samarinda" },
      { question: "Apa fungsi akar bagi tumbuhan?", options: ["Menyerap air", "Fotosintesis", "Mengangkut oksigen", "Menyimpan cahaya"], answer: "Menyerap air" },
      { question: "Indonesia berada di benua?", options: ["Asia", "Afrika", "Australia", "Eropa"], answer: "Asia" },
      { question: "Negara tetangga Indonesia di sebelah utara?", options: ["Australia", "Malaysia", "Timor Leste", "Papua Nugini"], answer: "Malaysia" },
      { question: "Proklamasi Kemerdekaan Indonesia terjadi pada tahun?", options: ["1944", "1945", "1946", "1947"], answer: "1945" },
      { question: "Presiden pertama Indonesia adalah?", options: ["Soeharto", "BJ Habibie", "Sukarno", "Megawati"], answer: "Sukarno" },
      { question: "Zat yang dibutuhkan untuk fotosintesis?", options: ["Karbon dioksida", "Oksigen", "Hidrogen", "Nitrogen"], answer: "Karbon dioksida" },
      { question: "Alat untuk mengukur tekanan udara?", options: ["Termometer", "Higrometer", "Barometer", "Altimeter"], answer: "Barometer" },
      { question: "Wujud air saat dipanaskan menjadi gas disebut?", options: ["Es", "Embun", "Uap", "Awan"], answer: "Uap" },
      { question: "Laut terbesar di dunia adalah?", options: ["Laut China Selatan", "Laut Mediterania", "Samudra Pasifik", "Samudra Atlantik"], answer: "Samudra Pasifik" },
      { question: "Nama alat musik dari Papua adalah?", options: ["Angklung", "Sasando", "Tifa", "Kolintang"], answer: "Tifa" },
      { question: "Hewan pemakan tumbuhan disebut?", options: ["Karnivora", "Omnivora", "Herbivora", "Insektivora"], answer: "Herbivora" },
      { question: "Fungsi batang pada tumbuhan adalah?", options: ["Menyerap cahaya", "Tempat fotosintesis", "Mengangkut air dan zat hara", "Menyerap oksigen"], answer: "Mengangkut air dan zat hara" }
    ];

    let currentQuestion = 0;
    let timerInterval;
    let answered = Array(questions.length).fill(null); // null=belum jawab, true=benar, false=salah

    function loadQuestion() {
      clearInterval(timerInterval);
      document.getElementById("feedback").innerText = "";
      document.getElementById("popup").innerHTML = "";
      const q = questions[currentQuestion];
      document.getElementById("question").innerText = q.question;

      const optionsDiv = document.getElementById("options");
      optionsDiv.innerHTML = "";

      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option";
        btn.innerText = opt;
        btn.disabled = answered[currentQuestion] !== null; // disable if sudah jawab
        btn.onclick = () => selectAnswer(btn, q.answer);
        if (answered[currentQuestion] !== null) {
          // Jika sudah jawab, tandai benar atau salah
          if (opt === q.answer) btn.classList.add("correct");
          else if (answered[currentQuestion] === false && btn.innerText === answered[currentQuestion + "_selected"]) btn.classList.add("wrong");
        }
        optionsDiv.appendChild(btn);
      });

      let timeLeft = 10;
      const timer = document.getElementById("timer");
      timer.innerText = timeLeft;
      timerInterval = setInterval(() => {
        timeLeft--;
        timer.innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          if (answered[currentQuestion] === null) {
            answered[currentQuestion] = false;
            answered[currentQuestion + "_selected"] = null; // gak pilih apa2
            disableOptions();
            document.getElementById("feedback").innerText = "Waktu habis!";
          }
        }
      }, 1000);
    }

    function selectAnswer(btn, correctAnswer) {
      clearInterval(timerInterval);
      const allOptions = document.querySelectorAll(".option");
      allOptions.forEach(b => b.disabled = true);

      let isCorrect = btn.innerText === correctAnswer;
      answered[currentQuestion] = isCorrect;
      answered[currentQuestion + "_selected"] = btn.innerText;

      allOptions.forEach(b => {
        if (b.innerText === correctAnswer) b.classList.add("correct");
      });
      if (!isCorrect) btn.classList.add("wrong");

      const feedback = document.getElementById("feedback");
      const popup = document.getElementById("popup");
      if (isCorrect) {
        feedback.innerText = "✔ Jawaban benar!";
        popup.innerHTML = '<div class="popup" style="color:#16a34a;">✔</div>';
      } else {
        feedback.innerText = "✖ Jawaban salah!";
        popup.innerHTML = '<div class="popup" style="color:#dc2626;">✖</div>';
      }
    }

    function disableOptions() {
      document.querySelectorAll(".option").forEach(b => b.disabled = true);
    }

    function showResults() {
      const quizDiv = document.getElementById("quiz");
      const correctCount = answered.filter(a => a === true).length;
      const wrongCount = answered.filter(a => a === false).length;
      const total = questions.length;
      const starCount = Math.round((correctCount / total) * 5); // rating bintang 1-5

      let stars = "";
      for(let i=0; i<5; i++) {
        stars += i < starCount ? "★" : "☆";
      }

      quizDiv.innerHTML = \`
        <h2>Hasil Kuis</h2>
        <div class="result">Benar: \${correctCount}</div>
        <div class="result">Salah: \${wrongCount}</div>
        <div class="result stars">\${stars}</div>
      \`;
    }

    function nextQuestion() {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
      } else {
        showResults();
      }
    }

    function prevQuestion() {
      if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
      }
    }

    function restartQuiz() {
      currentQuestion = 0;
      answered.fill(null);
      loadQuestion();
    }

    loadQuestion();
  </script>
</body>
</html>
    `;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
