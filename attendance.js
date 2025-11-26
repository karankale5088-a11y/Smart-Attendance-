console.log("attendance.js loaded");

const db = firebase.database();
const auth = firebase.auth();

function logout() {
    auth.signOut().then(() => window.location = "login.html");
}

const table = document.getElementById("attendanceTable");

db.ref("attendance").once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) return;

    Object.keys(data).forEach(date => {
        Object.keys(data[date]).forEach(name => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${date}</td>
                <td>${name}</td>
                <td>Present</td>
            `;

            table.appendChild(tr);
        });
    });
});
