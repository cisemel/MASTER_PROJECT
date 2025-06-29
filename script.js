const modelURL = "./model/";
let model;
let uploadedImage = new Image();

window.onload = async () => {
  model = await tmImage.load(modelURL + "model.json", modelURL + "metadata.json");
  console.log("✅ Model loaded successfully.");
};

function loadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedImage.src = URL.createObjectURL(file);

  uploadedImage.onload = () => {
    const preview = document.getElementById("preview-image");
    preview.src = uploadedImage.src;
    preview.style.display = "block";

    // Hemen tahmin başlat
    predictImage();
  };
}

async function predictImage() {
  if (!model || !uploadedImage.complete) return;

  const prediction = await model.predict(uploadedImage);
  const top = prediction.sort((a, b) => b.probability - a.probability)[0];
  const label = top.className;
  const confidence = Math.round(top.probability * 100);

  let message = "";

  if (label === "normal_one") {
    message = `✅ No visible cracks detected (${confidence}%).<br><b>This is a surface-level AI analysis. For safety, a professional evaluation is still recommended.</b>`;
  } else if (label === "plaster_cracked") {
    message = `⚠️ Plaster crack detected (${confidence}%).<br><b>May appear minor, but hidden structural risks cannot be ruled out. Monitoring is advised.</b>`;
  } else if (label === "deep_cracked") {
    message = `🚨 Deep crack identified (${confidence}%).<br><b>This may indicate structural damage. Please consult a professional as soon as possible.</b>`;
  } else {
    message = `🧐 Unable to interpret the result. Please try uploading a clearer image.`;
  }

  // 🔍 CLASS BREAKDOWN
  let breakdown = "<br><br><b>Class Breakdown:</b><br>";
  prediction.forEach(p => {
    breakdown += `– ${p.className}: ${Math.round(p.probability * 100)}%<br>`;
  });

  // 💥 CRACK INTENSITY SCORE
  let crackedTotal = 0;
  prediction.forEach(p => {
    if (p.className !== "normal_one") crackedTotal += p.probability;
  });
  crackedTotal = Math.round(crackedTotal * 100);

  const intensity = `<br><br><b>Total Crack Intensity:</b> ${crackedTotal}%`;

  // SONUÇLARI YAZDIR
  document.getElementById("result-label").innerText = `Prediction: ${label}`;
  document.getElementById("advice-message").innerHTML = message + breakdown + intensity;
}