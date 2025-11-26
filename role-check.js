firebase.auth().onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await firebase.database().ref("users/" + user.uid).once("value");
  const data = snap.val();

  if (!data || !data.role) return; // FIXED

  if (!window.ALLOWED_ROLES.includes(data.role)) {
    alert("Unauthorized!");
    window.location.href = "index.html";
  }
});
