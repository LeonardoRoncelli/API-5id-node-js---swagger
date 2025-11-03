const apiBase = "/api/users";
const usersTableBody = document.querySelector("#usersTable tbody");
const addUserForm = document.querySelector("#addUserForm");


async function fetchUsers() {
  const res = await fetch(apiBase);
  const users = await res.json();
  return users;
}

async function updateUsersTable() {
  const users = await fetchUsers();

  usersTableBody.innerHTML = ""; // Pulisce la tabella

  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.dataset.id = user.id;

    tr.innerHTML = `
      <td>${user.id}</td>
      <td><input type="text" value="${user.name}" data-field="name"></td>
      <td><input type="email" value="${user.email}" data-field="email"></td>
      <td>
        <button class="viewBtn">View</button>
        <button class="updateBtn">Update</button>
      </td>
    `;

   
    tr.querySelector(".viewBtn").addEventListener("click", async () => {
      const res = await fetch(`${apiBase}/${user.id}`);
      const userDetails = await res.json();
      alert(JSON.stringify(userDetails, null, 2));
    });

    
    tr.querySelector(".updateBtn").addEventListener("click", async () => {
      const updatedData = {
        name: tr.querySelector('[data-field="name"]').value,
        email: tr.querySelector('[data-field="email"]').value
      };
      await fetch(`${apiBase}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      alert("User updated!");
    });

    usersTableBody.appendChild(tr);
  });
}


addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(addUserForm);
  const newUser = {
    name: formData.get("name"),
    email: formData.get("email")
  };
  const res = await fetch(apiBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  });
  const createdUser = await res.json();
  console.log("Created:", createdUser);
  addUserForm.reset();
  await updateUsersTable();
});

setInterval(updateUsersTable, 2000);

updateUsersTable();
