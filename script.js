console.log("script.js loaded");

// Firebase
const db = firebase.database();
const auth = firebase.auth();

// Logout
function logout() {
    auth.signOut().then(() => window.location.href = "login.html");
}

// DOM
const photoInput = document.getElementById("photoInput");
const previewImg = document.getElementById("previewImg");
const overlayCanvas = document.getElementById("overlayCanvas");
const statusMsg = document.getElementById("statusMsg");
const presentList = document.getElementById("presentList");

// Load models
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("models/"),
    faceapi.nets.faceLandmark68Net.loadFromUri("models/"),
    faceapi.nets.faceRecognitionNet.loadFromUri("models/")
]).then(() => {
    console.log("Face API Loaded");
});

// Load dataset from Firebase
async function loadDataset() {
    const snap = await db.ref("students").once("value");
    const data = snap.val();

    if (!data) {
        statusMsg.innerHTML = "❌ No registered students found!";
        return [];
    }

    const final = [];

    for (let id in data) {
        const s = data[id];
        if (!s.images || s.images.length === 0) continue;

        const descriptors = [];
        for (let base64 of s.images) {
            const img = await faceapi.fetchImage(base64);
            const det = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (det) descriptors.push(det.descriptor);
        }

        if (descriptors.length > 0) {
            final.push(
                new faceapi.LabeledFaceDescriptors(id, descriptors)
            );
        }
    }

    return final;
}

// On photo upload
photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;

    presentList.innerHTML = "";
    statusMsg.innerHTML = "Analyzing image…";

    previewImg.src = URL.createObjectURL(file);
    previewImg.style.display = "block";

    previewImg.onload = async () => {
        const dataset = await loadDataset();
        if (dataset.length === 0) return;

        const matcher = new faceapi.FaceMatcher(dataset, 0.6);

        overlayCanvas.width = previewImg.width;
        overlayCanvas.height = previewImg.height;

        const detections = await faceapi
            .detectAllFaces(previewImg)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const ctx = overlayCanvas.getContext("2d");
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        const today = new Date().toISOString().split("T")[0];

        for (let det of detections) {
            const best = matcher.findBestMatch(det.descriptor);
            const box = det.detection.box;

            ctx.strokeStyle = "lime";
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            ctx.fillStyle = "yellow";
            ctx.font = "18px Arial";
            ctx.fillText(best.toString(), box.x, box.y - 5);

            if (best.label !== "unknown") {
                // Save attendance
                await db.ref(`attendance/${today}/${best.label}`).set(true);

                // Load student details for roll display
                const snap = await db.ref(`students/${best.label}`).once("value");
                const student = snap.val();

                const li = document.createElement("li");
                li.textContent = `${student.name} — Roll No: ${student.roll}`;
                presentList.appendChild(li);
            }
        }

        statusMsg.innerHTML = "✅ Attendance Updated Successfully!";
    };
});
