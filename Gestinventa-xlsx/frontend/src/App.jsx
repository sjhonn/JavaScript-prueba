import { useEffect, useState } from "react";
import { API_URL } from "./config";

export default function App() {
  const emptyForm = {
    Fecha: "",
    Comprador: "",
    Categorias: "",
    Total: "",
    Stock: true,
    Estado: "realizado",
  };

  const [form, setForm] = useState(emptyForm);
  const [ventas, setVentas] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 NUEVO: modo edición
  const [editId, setEditId] = useState(null);

  const cargarVentas = async () => {
    try {
      const res = await fetch(`${API_URL}/ventas`);
      const data = await res.json();
      setVentas(data);
    } catch (err) {
      console.error("Error cargando ventas", err);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Crear
  const guardarVenta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error");

      setMsg("✅ Venta guardada correctamente");
      setForm(emptyForm);
      await cargarVentas();
    } catch (err) {
      console.error(err);
      setMsg("❌ Error guardando la venta");
    } finally {
      setLoading(false);
    }
  };

  // 👇 NUEVO: entrar a editar
  const empezarEdicion = (venta) => {
    setEditId(venta.ID);
    setMsg("");
    setForm({
      Fecha: venta.Fecha ? new Date(venta.Fecha).toISOString().slice(0, 10) : "",
      Comprador: venta.Comprador || "",
      Categorias: venta.Categorias || "",
      Total: venta.Total ?? "",
      Stock: Boolean(venta.Stock),
      Estado: venta.Estado || "realizado",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 👇 NUEVO: actualizar
  const actualizarVenta = async (e) => {
    e.preventDefault();
    if (!editId) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_URL}/ventas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error");

      setMsg(`✅ Venta ${editId} actualizada`);
      setEditId(null);
      setForm(emptyForm);
      await cargarVentas();
    } catch (err) {
      console.error(err);
      setMsg("❌ Error actualizando la venta");
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setForm(emptyForm);
    setMsg("");
  };

  // Eliminar
  const eliminarVenta = async (id) => {
    if (!confirm("¿Eliminar esta venta?")) return;

    try {
      await fetch(`${API_URL}/ventas/${id}`, {
        method: "DELETE",
      });
      await cargarVentas();

      // Si borras la que estás editando, sal del modo edición
      if (editId === id) cancelarEdicion();
    } catch (err) {
      console.error("Error eliminando venta", err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Gestinventa</h1>

      {/* FORMULARIO */}
      <form onSubmit={editId ? actualizarVenta : guardarVenta} style={{ marginBottom: 20 }}>
        <input name="Fecha" type="date" value={form.Fecha} onChange={handleChange} required />
        <input name="Comprador" placeholder="Comprador" value={form.Comprador} onChange={handleChange} required />
        <input name="Categorias" placeholder="Categorías" value={form.Categorias} onChange={handleChange} required />
        <input name="Total" type="number" placeholder="Total" value={form.Total} onChange={handleChange} required />

        <label style={{ marginLeft: 10 }}>
          <input type="checkbox" name="Stock" checked={form.Stock} onChange={handleChange} />
          Stock
        </label>

        <select name="Estado" value={form.Estado} onChange={handleChange} style={{ marginLeft: 10 }}>
          <option value="realizado">realizado</option>
          <option value="pendiente">pendiente</option>
          <option value="rechazado">rechazado</option>
        </select>

        <button type="submit" disabled={loading} style={{ marginLeft: 10 }}>
          {loading ? "Procesando..." : editId ? "Actualizar" : "Guardar venta"}
        </button>

        {editId && (
          <button type="button" onClick={cancelarEdicion} style={{ marginLeft: 10 }}>
            Cancelar
          </button>
        )}
      </form>

      {msg && <p>{msg}</p>}

      {/* TABLA */}
      <h2>Ventas registradas</h2>

      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Comprador</th>
            <th>Categoría</th>
            <th>Total</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ventas.map((v) => (
            <tr key={v.ID}>
              <td>{v.ID}</td>
              <td>{v.Fecha ? new Date(v.Fecha).toLocaleDateString() : ""}</td>
              <td>{v.Comprador}</td>
              <td>{v.Categorias}</td>
              <td>{v.Total}</td>
              <td>{v.Stock ? "Sí" : "No"}</td>
              <td>{v.Estado}</td>
              <td>
                <button onClick={() => empezarEdicion(v)}>✏️</button>{" "}
                <button onClick={() => eliminarVenta(v.ID)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
