// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDUrMm2ExlhcSpQ1-sROzy_7oIY4mpu3Eo",
    authDomain: "smart-attendance-ai-4bc4f.firebaseapp.com",
    databaseURL: "https://smart-attendance-ai-4bc4f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-attendance-ai-4bc4f",
    storageBucket: "smart-attendance-ai-4bc4f.appspot.com",
    messagingSenderId: "267157518712",
    appId: "1:267157518712:web:2404a9cab8d7e0d522b08d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();


// LOGIN FUNCTION
function login() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    auth.signInWithEmailAndPassword(email, pass)
    .then(async (userCredential) => {
        const uid = userCredential.user.uid;

        const roleSnap = await db.ref("users/" + uid + "/role").once("value");
        const role = roleSnap.val();

        if (!role) {
            msg.innerHTML = "Role not assigned!";
            return;
        }

        if (role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }

    })
    .catch(error => {
        msg.innerHTML = error.message;
    });
}


// LOGOUT FUNCTION
function logout() {
    auth.signOut()
    .then(() => window.location.href = "login.html")
    .catch(err => alert("Logout failed: " + err.message));
}


// PAGE PROTECTION
function protectPage() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}
