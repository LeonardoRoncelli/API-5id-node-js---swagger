const API = "https://mio-server.onrender.com/api/users";
let cacheMap = new Map();
const POLL = 2000;

// --- UTILS ---

function idOf(u) {
  return u?.id ?? u?._id ?? u?.name ?? null;
}

// --- FETCH FUNCTIONS ---

function fetchAll() {
  return fetch(API, { headers: { accept: "/" } })
    .then(res => {
      if (!res.ok) throw new Error("GET /users status " + res.status);
      return res.json().catch(() => []);
    })
    .catch(e => {
      console.error("fetchAll error", e);
      return null;
    });
}

function fetchOne(id) {
  return fetch(`${API}/${encodeURIComponent(id)}`, { headers: { accept: "/" } })
    .then(res => {
      if (!res.ok) throw new Error("GET user status " + res.status);
      return res.json().catch(() => null);
    })
    .catch(e => {
      console.error("fetchOne error", e);
      return null;
    });
}

function addUtente(body) {
  return fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "/",
      Authorization: "Bearer 5IDtoken"
    },
    body: JSON.stringify(body)
  })
    .then(res => {
      if (!res.ok) throw new Error("POST status " + res.status);
      return res.text().catch(() => null).then(t => {
        if (t) {
          try { return JSON.parse(t); } catch {}
        }
        return body;
      });
    })
    .catch(e => { throw e; });
}

function aggiornaUtente(id, body) {
  return fetch(`${API}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "/",
      Authorization: "Bearer 5IDtoken"
    },
    body: JSON.stringify(body)
  })
    .then(res => {
      if (!res.ok) throw new Error("PUT status " + res.status);
      return res.text().catch(() => null).then(t => {
        if (t) {
          try { return JSON.parse(t); } catch {}
        }
        return body;
      });
    })
    .catch(e => { throw e; });
}

function deliteUser(id) {
  return fetch(`${API}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { accept: "/", Authorization: "Bearer 5IDtoken" }
  })
    .then(res => {
      if (res.ok) return true;
      if (res.status === 404) return false;
      throw new Error("DELETE status " + res.status);
    })
    .catch(e => { throw e; });
}

// --- RENDER ---

function renderOne(u) {
  const tpl = document.getElementById("template").content.cloneNode(true);
  const card = tpl.querySelector(".card");

  const id = idOf(u) ?? String(Math.random());
  card.dataset.id = id;

  tpl.querySelector(".card-title").textContent = u.name ?? "Nome non disponibile";
  tpl.querySelector(".card-subtitle").textContent =
    u.role ? `Ruolo: ${u.role}` : (u.age ? `Età: ${u.age}` : "");

  if (u.age || u.role) {
    tpl.querySelector(".card-text").textContent = u.age ? `Età: ${u.age}` : "";
  } else {
    tpl.querySelector(".card-text").innerHTML =
      `<pre style="white-space:pre-wrap; max-height:100px; overflow:auto;">${JSON.stringify(u, null, 2)}</pre>`;
  }

  const btnArea = tpl.querySelector(".bottoni_spazio");

  // Dettagli
  const btnDet = document.createElement("button");
  btnDet.className = "btn btn-info";
  btnDet.textContent = "Dettagli";
  btnDet.onclick = () =>
    fetchOne(id)
      .then(data => {
        if (!data) return alert("Errore caricamento dettagli");
        alert(JSON.stringify(data, null, 2));
      })
      .catch(() => alert("Errore caricamento dettagli"));

  // Modifica
  const btnMod = document.createElement("button");
  btnMod.className = "btn btn-warning";
  btnMod.textContent = "Modifica";
  btnMod.onclick = () => modificaUtente(u);

  // Elimina
  const btnDel = document.createElement("button");
  btnDel.className = "btn btn-danger";
  btnDel.textContent = "Elimina";
  btnDel.onclick = () =>
    deliteUser(id)
      .then(ok => {
        if (ok) {
          const c = document.querySelector(`.card[data-id="${id}"]`);
          if (c) c.remove();
          cacheMap.delete(id);
        } else {
          alert("Elemento non trovato sul server (404).");
        }
      })
      .catch(() => alert("Errore eliminazione. Controlla console."));

  btnArea.append(btnDet, btnMod, btnDel);

  const container = document.getElementById("contenitore");
  const existing = container.querySelector(`.card[data-id="${id}"]`);
  if (existing) existing.remove();

  container.appendChild(tpl);
}

function renderList(list) {
  const container = document.getElementById("contenitore");
  const newIds = new Set(list.map(u => idOf(u)));

  container.querySelectorAll(".card").forEach(card => {
    if (!newIds.has(card.dataset.id)) card.remove();
  });

  list.forEach(u => {
    const id = idOf(u) ?? String(Math.random());
    const str = JSON.stringify(u);
    if (cacheMap.get(id) === str) return;
    cacheMap.set(id, str);
    renderOne(u);
  });
}

// --- FORM / MODIFICA ---

function modificaUtente(u) {
  vista_aggiunta();
  document.getElementById("add_name").value = u.name ?? "";
  document.getElementById("add_age").value = u.age ?? "";

  const extra = document.getElementById("extra_fields");
  extra.innerHTML = "";

  for (const [k, v] of Object.entries(u)) {
    if (["name", "age", "id", "_id"].includes(k)) continue;

    const wrapper = document.createElement("div");
    wrapper.className = "d-flex gap-2 mb-2 align-items-center";

    const key = document.createElement("input");
    key.type = "text";
    key.value = k;
    key.className = "form-control campo-chiave";

    const val = document.createElement("input");
    val.type = "text";
    val.value = v;
    val.className = "form-control campo-valore";

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "btn btn-danger";
    rm.textContent = "X";
    rm.onclick = () => wrapper.remove();

    wrapper.append(key, val, rm);
    extra.appendChild(wrapper);
  }

  document.getElementById("vista_aggiunta").dataset.editingId = idOf(u);
}

function aggiungi() {
  const name = document.getElementById("add_name").value.trim();
  const age = document.getElementById("add_age").value.trim();

  if (!name || !age) return alert("Compila nome e età");

  const body = { name, age };
  const keys = document.getElementsByClassName("campo-chiave");
  const vals = document.getElementsByClassName("campo-valore");

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i].value.trim();
    const v = vals[i].value.trim();
    if (k) body[k] = v;
  }

  const form = document.getElementById("vista_aggiunta");
  const editingId = form.dataset.editingId || null;

  const op = editingId
    ? aggiornaUtente(editingId, body)
    : addUtente(body);

  op.then(result => {
    const id = idOf(result) ?? editingId ?? body.name ?? String(Date.now());
    cacheMap.set(id, JSON.stringify(result));
    renderOne(result);

    form.reset();
    form.style.display = "none";
    form.dataset.editingId = "";
    document.getElementById("extra_fields").innerHTML = "";
  }).catch(e => {
    console.error("aggiungi error", e);
    alert("Errore inserimento/modifica. Controlla console.");
  });
}

// --- INITIAL LOAD + POLLING ---

function initialLoad() {
  const cont = document.getElementById("contenitore");

  fetchAll().then(data => {
    if (data === null) {
      cont.innerHTML =
        `<div class="alert alert-danger">Errore caricamento dati da ${API}. Guarda la console per dettagli.</div>`;
      return;
    }

    cacheMap.clear();
    cont.innerHTML = "";

    data.forEach(u => {
      const id = idOf(u) ?? String(Math.random());
      cacheMap.set(id, JSON.stringify(u));
      renderOne(u);
    });
  });
}

function poll() {
  fetchAll()
    .then(data => {
      if (!data) return;

      const newMap = new Map();
      data.forEach(u => newMap.set(idOf(u), JSON.stringify(u)));

      for (const id of cacheMap.keys()) {
        if (!newMap.has(id)) {
          const c = document.querySelector(`.card[data-id="${id}"]`);
          if (c) c.remove();
          cacheMap.delete(id);
        }
      }

      for (const [id, str] of newMap.entries()) {
        if (cacheMap.get(id) !== str) {
          cacheMap.set(id, str);
          renderOne(JSON.parse(str));
        }
      }
    })
    .catch(e => console.error("poll error", e));
}

initialLoad();
setInterval(poll, POLL);

// --- GLOBAL EXPORTS ---

window.aggiungi = aggiungi;
window.vista_aggiunta = window.vista_aggiunta || (() => {
  const f = document.getElementById("vista_aggiunta");
  f.style.display = f.style.display === "none" ? "block" : "none";
});

window.aggiungiCampo = window.aggiungiCampo || (() => {
  const extra = document.getElementById("extra_fields");

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex gap-2 mb-2 align-items-center";

  const key = document.createElement("input");
  key.type = "text";
  key.placeholder = "Nome campo";
  key.className = "form-control campo-chiave";

  const val = document.createElement("input");
  val.type = "text";
  val.placeholder = "Valore campo";
  val.className = "form-control campo-valore";

  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "btn btn-danger";
  rm.textContent = "X";
  rm.onclick = () => wrapper.remove();

  wrapper.append(key, val, rm);
  extra.appendChild(wrapper);
});