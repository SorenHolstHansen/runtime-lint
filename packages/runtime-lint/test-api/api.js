import express from "express";
import todos from "./todos.json" with { type: "json" };
const app = express();
app.get("/todos", (_, res) => res.send(JSON.stringify(todos)));
app.get("/todos/:id", (req, res) =>
	res.send(JSON.stringify(todos[req.params.id - 1])),
);
app.listen(3000);
