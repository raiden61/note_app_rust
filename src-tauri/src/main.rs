use rusqlite::{params, Connection, Result};
use serde::Serialize; // Pour sérialiser les données

#[derive(Serialize)] // Permet de sérialiser la struct en JSON
struct Note {
    id: i64,
    title: String,
    content: String,
}

#[tauri::command]
fn getnotes() -> Vec<Note> {
    // Connexion à la base de données
    let conn = Connection::open("../src/notes.db").expect("Failed to open database");

    // Récupérer les notes de la base de données
    match get_notes(&conn) {
        Ok(notes) => notes,
        Err(err) => {
            eprintln!("Failed to get notes: {:?}", err);
            vec![]
        }
    }
}

fn get_notes(conn: &Connection) -> Result<Vec<Note>> {
    let mut stmt = conn.prepare("SELECT id, title, content FROM notes")?;
    let notes_iter = stmt.query_map([], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
        })
    })?;

    let mut notes = Vec::new();
    for note in notes_iter {
        notes.push(note?);
    }

    Ok(notes)
}

fn init_db() -> Result<()> {
    let conn = Connection::open("../src/notes.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

#[tauri::command]
fn savenote(content: String, title: String) -> String {
    // Connexion à la base de données
    let conn = Connection::open("../src/notes.db").expect("Failed to open database");
    println!("save note");
    println!("content = {}", content);
    println!("title = {}", title);

    // Sauvegarder la note dans la base de données
    match create_note(&conn, &title, &content) {
        Ok(_) => format!("Note saved successfully: {} - {}", title, content),
        Err(err) => format!("Failed to save note: {}", err),
    }
}

// Créer une note
fn create_note(conn: &Connection, title: &str, content: &str) -> Result<()> {
    println!("create note");
    conn.execute(
        "INSERT INTO notes (title, content) VALUES (?1, ?2)",
        params![title, content],
    )?;
    Ok(())
}

#[tauri::command]
fn updatenote(id: i64, content: String, title: String) -> String {
    // Connexion à la base de données
    let conn = Connection::open("../src/notes.db").expect("Failed to open database");

    // Mettre à jour la note dans la base de données
    match update_note(&conn, id, &title, &content) {
        Ok(_) => format!("Note updated successfully: {} - {}", title, content),
        Err(err) => format!("Failed to update note: {}", err),
    }
}

// Mettre à jour une note
fn update_note(conn: &Connection, id: i64, title: &str, content: &str) -> Result<()> {
    println!("update note");
    conn.execute(
        "UPDATE notes SET title = ?1, content = ?2 WHERE id = ?3",
        params![title, content, id],
    )?;
    Ok(())
}

#[tauri::command]
fn deletenote(id: i64) -> String {
    // Connexion à la base de données
    let conn = Connection::open("../src/notes.db").expect("Failed to open database");

    // Supprimer la note de la base de données
    match delete_note(&conn, id) {
        Ok(_) => format!("Note deleted successfully"),
        Err(err) => format!("Failed to delete note: {}", err),
    }
}

// Supprimer une note
fn delete_note(conn: &Connection, id: i64) -> Result<()> {
    println!("delete note");
    conn.execute("DELETE FROM notes WHERE id = ?1", params![id])?;
    Ok(())
}

fn main() {
    match init_db() {
        Ok(_) => println!("Database initialized successfully"),
        Err(err) => eprintln!("Error initializing database: {:?}", err),
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            savenote, getnotes, updatenote, deletenote
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
