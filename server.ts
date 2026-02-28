import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("clean_madurai.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen',
    name TEXT NOT NULL
  );

  -- Seed demo authority account
  INSERT OR IGNORE INTO users (email, password, role, name) 
  VALUES ('authority@mcc.tn.gov.in', 'admin123', 'authority', 'Municipal Officer');

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'garbage', 'missed_pickup', 'dead_animal'
    category TEXT,
    photo_before TEXT,
    photo_after TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'assigned', 'resolved'
    ai_analysis TEXT, -- JSON string
    urgency TEXT DEFAULT 'Medium',
    assigned_to INTEGER,
    assigned_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Auth Endpoints (Simplified for Demo)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, role, name } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(email, password, role, name);
      res.json({ user: { id: result.lastInsertRowid, email, role, name } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Complaint Endpoints
  app.post("/api/complaints", (req, res) => {
    const { citizen_id, type, category, photo_before, latitude, longitude, address, ai_analysis, urgency } = req.body;
    const result = db.prepare(`
      INSERT INTO complaints (citizen_id, type, category, photo_before, latitude, longitude, address, ai_analysis, urgency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(citizen_id, type, category, photo_before, latitude, longitude, address, JSON.stringify(ai_analysis), urgency);
    
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/complaints", (req, res) => {
    const { role, user_id } = req.query;
    let complaints;
    if (role === 'citizen') {
      complaints = db.prepare("SELECT * FROM complaints WHERE citizen_id = ? ORDER BY created_at DESC").all(user_id);
    } else {
      complaints = db.prepare("SELECT * FROM complaints ORDER BY created_at DESC").all();
    }
    res.json(complaints.map(c => ({ ...c, ai_analysis: JSON.parse(c.ai_analysis || '{}') })));
  });

  app.get("/api/complaints/:id", (req, res) => {
    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
    if (complaint) {
      res.json({ ...complaint, ai_analysis: JSON.parse(complaint.ai_analysis || '{}') });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.patch("/api/complaints/:id", (req, res) => {
    const { status, photo_after, ai_cleanup_verification } = req.body;
    const updates = [];
    const params = [];
    
    if (status) { updates.push("status = ?"); params.push(status); }
    if (photo_after) { updates.push("photo_after = ?"); params.push(photo_after); }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(req.params.id);

    db.prepare(`UPDATE complaints SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  // Analytics
  app.get("/api/analytics", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM complaints 
      GROUP BY status
    `).all();
    
    const typeStats = db.prepare(`
      SELECT 
        type, 
        COUNT(*) as count 
      FROM complaints 
      GROUP BY type
    `).all();

    res.json({ stats, typeStats });
  });

  // Notifications
  app.get("/api/notifications/:user_id", (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all(req.params.user_id);
    res.json(notifications);
  });

  // Members (for assignment)
  app.get("/api/members", (req, res) => {
    const members = db.prepare("SELECT id, name, role FROM users WHERE role = 'authority'").all();
    res.json(members);
  });

  app.post("/api/complaints/:id/assign", (req, res) => {
    const { assigned_to, assigned_name } = req.body;
    db.prepare("UPDATE complaints SET assigned_to = ?, assigned_name = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(assigned_to, assigned_name, req.params.id);
    
    // Notify the assigned member
    db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
      .run(assigned_to, `You have been assigned to complaint #${req.params.id}`);

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
