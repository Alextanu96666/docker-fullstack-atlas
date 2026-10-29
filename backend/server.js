const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
});
const Task = mongoose.model("Task", taskSchema);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: mongoose.connection.readyState === 1
        ? "connected" : "disconnected"
    });
});


app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ _id: -1 });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch tasks" });
    }
});


app.post("/api/tasks", async (req, res) => {

const { title } = req.body;
    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }
    try {
        const task = await Task.create({ title: title.trim() });
        console.log("Task created:", task);
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create task" });
    }
});



app.delete("/api/tasks/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid task ID" });
    }
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not delete task" });
    }
});


async function start() {
    try {
    if (!process.env.MONGO_URL) throw new Error("MONGO_URL missing");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB Atlas");
        app.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend running on port ${PORT}`);
    });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}


start();