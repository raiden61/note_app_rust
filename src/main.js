const { invoke } = window.__TAURI__.tauri;

let savecontentInputEl;
let savecontentMsgEl;
let savetitleInputEl;
let savetitleMsgEl;

let savedNoteId = null;


async function savenote() {
  const content = savecontentInputEl.value;
  const title = savetitleInputEl.value;

  // Appeler la commande "savenote" avec les valeurs des champs de formulaire
  const result = await invoke("savenote", { content, title });

  // Mettre à jour le contenu des balises <p> avec le résultat retourné
  savecontentMsgEl.textContent = `Content: ${content}`;
  savetitleMsgEl.textContent = `Title: ${title}`;

  // Recharger la liste des notes
  loadnote();
}



async function loadnote() {
  // Appeler la commande "getnotes"
  const notes = await invoke("getnotes");

  // Mettre à jour le contenu de la liste des notes
  const notesEl = document.querySelector("#notes-list");
  notesEl.innerHTML = ""; // Vider la liste existante avant de la remplir

  // Parcourir le tableau des notes et construire la liste
  notes.forEach((note) => {
    const noteEl = document.createElement("div"); // Use <div> instead of <li>
    noteEl.classList.add("note-item"); // Add a class for styling

    // Créer un élément <h2> pour l'ID et le titre
    const headerEl = document.createElement("div");
    headerEl.classList.add("note-header");
    headerEl.textContent = `${note.title}`;
    // Ajouter le titre à la noteEl
    noteEl.appendChild(headerEl);

    // Créer un élément <p> pour le contenu
    const contentEl = document.createElement("textarea");
    contentEl.classList.add("note-content");
    contentEl.textContent = note.content;
    // Ajouter le contenu à la noteEl
    noteEl.appendChild(contentEl);

    const divbuttonEl = document.createElement("div");
    divbuttonEl.classList.add("div-button");
    // Ajouter la divbuttonEl à la noteEl
    noteEl.appendChild(divbuttonEl);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("button-delete");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      // Appeler la commande "deletenote" avec l'ID de la note
      const result = await invoke("deletenote", { id: note.id });
      // Réinitialiser les champs de saisie
      savecontentInputEl.value = "";
      savetitleInputEl.value = "";
      // Réinitialiser l'ID sauvegardé
      savedNoteId = null;
      // Recharger la liste des notes
      loadnote();
    });
    // Ajouter le bouton de suppression à la divbuttonEl
    divbuttonEl.appendChild(deleteBtn);
    // Ajouter un event listener au clic
    noteEl.addEventListener("click", () => {
      // Remplis les champs de saisie avec les valeurs de la note
      savetitleInputEl.value = note.title;
      savecontentInputEl.value = note.content;

      if (savedNoteId === note.id) {
        // Supprimer la classe "selected-note" de toutes les notes
        document.querySelectorAll('.note-item').forEach(item => {
          item.classList.remove('selected-note');
        });
        // Réinitialiser les champs de saisie
        savetitleInputEl.value = null;
        savecontentInputEl.value = null;
        // Réinitialiser l'ID sauvegardé
        savedNoteId = null;
      } else {
        savedNoteId = note.id;// Variable globale pour l'ID de la note
        // Supprimer la classe "selected-note" de toutes les notes
        document.querySelectorAll('.note-item').forEach(item => {
          item.classList.remove('selected-note');
        });
        // Ajouter la classe "selected-note" à la note sélectionnée
        noteEl.classList.add('selected-note');
      }
    });
    // Ajouter la note à la liste
    notesEl.appendChild(noteEl);
  });
}

async function updatenote() {
  const content = savecontentInputEl.value;
  const title = savetitleInputEl.value;

  // Appeler la commande "updatenote" avec les valeurs des champs de formulaire
  const result = await invoke("updatenote", { content, title, id: savedNoteId });

  // Mettre à jour le contenu des balises <p> avec le résultat retourné
  savecontentMsgEl.textContent = `Content: ${content}`;
  savetitleMsgEl.textContent = `Title: ${title}`;

  // Recharger la liste des notes
  loadnote();

}


// Fonction appelée lorsque le DOM est chargé
window.addEventListener("DOMContentLoaded", () => {
  savecontentInputEl = document.querySelector("#savecontent-input");
  savecontentMsgEl = document.querySelector("#savecontent-msg");
  savetitleInputEl = document.querySelector("#savetitle-input");
  savetitleMsgEl = document.querySelector("#savetitle-msg");

  // Charger les notes existantes
  loadnote();

  document.querySelector("#savenote-form").addEventListener("click", (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire

    if (e.target.type === "submit") {
      savenote();
    } else if (e.target.id === "update-note-btn") {
      updatenote();
    }
  });

});
