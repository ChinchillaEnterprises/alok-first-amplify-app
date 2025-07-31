"use client";

import { useState } from "react";
import "./../app/app.css";

export default function App() {
  const [todos, setTodos] = useState<Array<{ id: number; content: string }>>([
    { id: 1, content: "Learn AWS Amplify" },
    { id: 2, content: "Build my first app" },
    { id: 3, content: "Deploy to the cloud" }
  ]);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      setTodos([...todos, { id: Date.now(), content }]);
    }
  }

  return (
    <main>
      <h1>Alok's First Amplify App</h1>
      <h2>My todos</h2>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 Welcome to Chinchilla Academy Day 3!
        <br />
        This is your first AWS Amplify app deployed to the cloud.
      </div>
    </main>
  );
}