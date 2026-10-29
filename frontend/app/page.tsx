"use client";

import { useEffect, useState } from "react";

// Shape of a task as returned by the backend API (MongoDB document)
type Task = { _id: string; title: string; completed: boolean };

export default function Home() {
  // List of tasks fetched from the API
  const [tasks, setTasks] = useState<Task[]>([]);
  // Current value of the "new task" input field
  const [title, setTitle] = useState("");
  // Error message shown to the user (empty string = no error)
  const [error, setError] = useState("");

  // Fetch all tasks from the API and store them in state
  async function loadTasks() {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      setTasks(await res.json());
      setError("");
    } catch {
      setError("Kunde inte hämta uppgifter");
    }
  }

  // Load tasks once when the component first mounts
  useEffect(() => {
    void loadTasks();
  }, []);

  // Handle form submit: create a new task, then reload the list
  async function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Ignore empty or whitespace-only titles
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create task");

      // Clear the input and refresh the list
      setTitle("");
      await loadTasks();
    } catch {
      setError("Kunde inte skapa uppgiften");
    }
  }

  // Delete a task by id, then reload the list
  async function deleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      await loadTasks();
    } catch {
      setError("Kunde inte ta bort uppgiften");
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "50px auto", padding: 20 }}>
      <h1>Docker Todo App</h1>
      <p>Next.js + Express + MongoDB Atlas</p>

      {/* Form for adding a new task */}
      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ny uppgift"
          aria-label="Ny uppgift"
        />
        <button type="submit">Lägg till</button>
      </form>

      {/* Show error message only if there is one */}
      {error && <p role="alert">{error}</p>}

      {/* Task list with a delete button for each task */}
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.title}{" "}
            <button onClick={() => deleteTask(task._id)}>Ta bort</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
