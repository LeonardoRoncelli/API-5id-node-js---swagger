const API_URL = '/api/users';
const TOKEN = '5IDtoken';
const tableBody = document.querySelector('#usersTable tbody');
const addUserForm = document.querySelector('#addUserForm');

let usersCache = [];

async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    const users = await res.json();

    if (JSON.stringify(users) !== JSON.stringify(usersCache)) {
      usersCache = users;
      renderUsers(users);
    }
  } catch (err) {
    console.error('Errore fetch utenti:', err);
  }
}

function renderUsers(users) {
  tableBody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.age}</td>
      <td>
        <button class="details-btn">Dettagli</button>
        <button class="edit-btn">Modifica</button>
        <button class="delete-btn">Elimina</button>
      </td>
    `;

    tr.querySelector('.details-btn').addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_URL}/${user.name}`);
        if (!res.ok) throw new Error('Errore GET dettagli');
        const details = await res.json();
        alert(`Dettagli utente:\nNome: ${details.name}\nEtà: ${details.age}`);
      } catch (err) {
        alert('Errore nel recupero dettagli.');
      }
    });

    tr.querySelector('.edit-btn').addEventListener('click', async () => {
      const newName = prompt('Nuovo nome:', user.name);
      const newAge = prompt('Nuova età:', user.age);
      if (!newName || !newAge) return;

      try {
        const res = await fetch(`${API_URL}/${user.name}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({ name: newName, age: parseInt(newAge, 10) })
        });
        if (!res.ok) throw new Error('Errore PUT');
        await fetchUsers();
      } catch (err) {
        alert('Errore nella modifica utente.');
      }
    });

    tr.querySelector('.delete-btn').addEventListener('click', async () => {
      if (!confirm(`Sei sicuro di voler eliminare ${user.name}?`)) return;
      try {
        const res = await fetch(`${API_URL}/${user.name}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        });
        if (!res.ok) throw new Error('Errore DELETE');
        await fetchUsers();
      } catch (err) {
        alert('Errore nell\'eliminazione.');
      }
    });

    tableBody.appendChild(tr);
  });
}

addUserForm.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(addUserForm);
  const newUser = {
    name: formData.get('name'),
    age: parseInt(formData.get('age'), 10)
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(newUser)
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Errore POST');
    }

    addUserForm.reset();
    await fetchUsers();
  } catch (err) {
    alert('Errore nell\'aggiunta utente.');
    console.error(err);
  }
});

setInterval(fetchUsers, 2000);
fetchUsers();
