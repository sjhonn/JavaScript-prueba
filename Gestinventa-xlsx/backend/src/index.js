import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SSHEET_URL="https://script.google.com/macros/s/AKfycbzYMw_Ct2Tzgdvr_y0OeNoseUzyzrWZouPHRmf7Hs5r0QltJoqfdg2yWDmK-SLlSmNtVA/exec";

app.use(cors());
app.use(express.json());

// ======================
// ROOT
// ======================
app.get("/", (req, res) => {
  res.json({ message: "API OK - VERSION FINAL" });
});

// ======================
// GET ventas
// ======================
app.get("/ventas", async (req, res) => {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error GET /ventas:", error);
    res.status(500).json({ error: "Error obteniendo ventas" });
  }
});

// ======================
// POST ventas (crear)
// ======================
app.post("/ventas", async (req, res) => {
  try {
    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Error POST /ventas:", error);
    res.status(500).json({ error: "Error guardando venta" });
  }
});

// ======================
// DELETE venta por ID
// ======================
app.put("/ventas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(
      `${SHEET_URL}?update=${encodeURIComponent(id)}`,
      {
        method: "POST", // Apps Script recibe update por POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error PUT /ventas:", error);
    res.status(500).json({ error: "Error actualizando venta" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});
