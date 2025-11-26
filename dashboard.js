console.log("dashboard.js loaded");

const db = firebase.database();
const auth = firebase.auth();

function logout() {
    auth.signOut().then(() => window.location = "login.html");
}

db.ref("attendance").once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) return;

    let dates = Object.keys(data);

    document.getElementById("totalDays").innerText = dates.length;

    let trendData = [];
    let studentCount = {};

    dates.forEach(date => {
        let count = Object.keys(data[date]).length;
        trendData.push(count);

        Object.keys(data[date]).forEach(student => {
            studentCount[student] = (studentCount[student] || 0) + 1;
        });
    });

    let avg = (trendData.reduce((a,b) => a+b, 0) / trendData.length).toFixed(1);
    document.getElementById("avgAttendance").innerText = avg + "%";

    let best = Object.keys(studentCount).reduce((a,b) => studentCount[a] > studentCount[b] ? a : b);
    document.getElementById("topStudent").innerText = best;

    new Chart(document.getElementById("trendChart"), {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Students Present",
                data: trendData,
                borderColor: "blue",
                fill: false,
                borderWidth: 2
            }]
        },
        options: { responsive:true }
    });
});
