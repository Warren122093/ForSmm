

// === CONFIGURATION ===
const AIRTABLE_BASE_ID = "appisb00ZAuU3fJeQ";
const AIRTABLE_TABLE_NAME = "AccountsDB"; // Use your table name
const AIRTABLE_TOKEN = "patpATMJbSIJqRT6I.4aaa59fb8adbbdfe037c481daec30f0221d1eef4f8ace937cb3a399b9951072b";

let currentUser = null;
let currentRecordId = null;

// === HELPERS ===
function showMsg(msg, color="red") {
  const div = document.getElementById("msg");
  div.textContent = msg;
  div.style.color = color;
}

function clearForms() {
  document.getElementById("reg-username").value = "";
  document.getElementById("reg-email").value = "";
  document.getElementById("reg-password").value = "";
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
}

// === REGISTER ===
function register() {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  if (!username || !email || !password) {
    showMsg("Please fill in all fields.");
    return;
  }
  // Check if user/email already exists
  fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=OR({Name}='${username}',{Email}='${email}')`, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.records && data.records.length > 0) {
      showMsg("Name or Email already exists.", "red");
    } else {
      // Register new user
      fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: {
            Name: username,
            Email: email,
            Pass: password,
            Points: 0
          }
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          showMsg("Registration successful! Please login.", "green");
          clearForms();
        } else {
          showMsg("Registration failed.", "red");
        }
      });
    }
  });
}

// === LOGIN ===
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) {
    showMsg("Please enter email and password.");
    return;
  }
  fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=AND({Email}='${email}',{Pass}='${password}')`, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
  })
  .then(res => res.json())
  .then(data => {
    if (data.records && data.records.length === 1) {
      currentUser = data.records[0].fields;
      currentRecordId = data.records[0].id;
      document.getElementById("auth-forms").style.display = "none";
      document.getElementById("dashboard").style.display = "";
      document.getElementById("user-name").textContent = currentUser.Name;
      document.getElementById("user-points").textContent = currentUser.Points || 0;
      showMsg("");
      clearForms();
    } else {
      showMsg("Invalid email or password.", "red");
    }
  });
}

// === ADD POINTS ===
function addPoints(amount) {
  if (!currentRecordId) return;
  const newPoints = (currentUser.Points || 0) + amount;
  fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${currentRecordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: { Points: newPoints }
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.fields) {
      currentUser.Points = data.fields.Points;
      document.getElementById("user-points").textContent = currentUser.Points;
      showMsg("Points updated!", "green");
    } else {
      showMsg("Failed to update points.", "red");
    }
  });
}

// === LOGOUT ===
function logout() {
  currentUser = null;
  currentRecordId = null;
  document.getElementById("auth-forms").style.display = "";
  document.getElementById("dashboard").style.display = "none";
  showMsg("Logged out.", "green");
  clearForms();
}
