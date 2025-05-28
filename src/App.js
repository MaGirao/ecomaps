
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function Navbar({ user }) {
  return (
    <nav className="bg-green-700 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">EcoMaps</span>
      </div>
      {user && (
        <span className="text-white">Bem-vindo, {user.split("@")[0]}</span>
      )}
    </nav>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
      navigate("/dashboard");
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <Navbar />
      <form className="bg-white shadow-xl p-8 rounded-xl flex flex-col gap-4 w-full max-w-md mt-12"
        onSubmit={handleSubmit}>
        <h2 className="text-green-800 text-2xl font-bold mb-2 text-center">Bem-vindo ao EcoMaps</h2>
        <input
          type="email"
          placeholder="Seu e-mail"
          className="p-2 rounded border border-gray-300 focus:outline-green-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded transition"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

function AddMarker({ onAdd }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng);
    },
  });
  return null;
}

function Dashboard({ pontos, setPontos }) {
  const [showForm, setShowForm] = useState(false);
  const [newLatLng, setNewLatLng] = useState(null);

  function handleMapClick(latlng) {
    setNewLatLng(latlng);
    setShowForm(true);
  }

  function handleSave(e) {
    e.preventDefault();
    const form = e.target;
    const nome = form.nome.value;
    const endereco = form.endereco.value;
    const materiais = Array.from(form.materiais).filter(cb => cb.checked).map(cb => cb.value);
    const horario = form.horario.value;
    setPontos([
      ...pontos,
      {
        nome,
        endereco,
        materiais,
        horario,
        latlng: newLatLng,
      },
    ]);
    setShowForm(false);
    setNewLatLng(null);
  }

  return (
    <div className="flex flex-col items-center bg-green-50 min-h-screen">
      <Navbar user="Usuário" />
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mt-8 p-4">
        <div className="md:w-2/3 bg-white rounded-2xl shadow-lg p-4">
          <h2 className="font-bold text-green-700 mb-2">Mapa Interativo</h2>
          <MapContainer center={[-3.1, -60.02]} zoom={13} style={{ height: "420px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            {pontos.map((p, idx) => (
              <Marker key={idx} position={p.latlng}>
                <Popup>
                  <b>{p.nome}</b>
                  <br />{p.endereco}
                  <br /><span className="text-xs">Materiais: {p.materiais.join(", ")}</span>
                  <br /><Link to={`/detalhes/${idx}`} className="text-green-700 underline">Detalhes</Link>
                </Popup>
              </Marker>
            ))}
            <AddMarker onAdd={handleMapClick} />
          </MapContainer>
          <p className="mt-2 text-gray-500 text-sm">
            Clique no mapa para cadastrar um novo ponto de coleta.
          </p>
        </div>
        <div className="md:w-1/3 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
          <h2 className="font-bold text-green-700 mb-2">Pontos de Coleta</h2>
          {pontos.length === 0 && <p className="text-gray-400">Nenhum ponto cadastrado ainda.</p>}
          <ul className="flex flex-col gap-4">
            {pontos.map((p, idx) => (
              <li key={idx} className="border rounded-lg p-2 flex flex-col shadow-sm">
                <span className="font-bold">{p.nome}</span>
                <span className="text-xs">{p.endereco}</span>
                <span className="text-xs text-gray-600">Materiais: {p.materiais.join(", ")}</span>
                <Link to={`/detalhes/${idx}`} className="text-green-700 underline text-sm mt-1">
                  Ver detalhes
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm"
            onSubmit={handleSave}
          >
            <h3 className="font-bold mb-2 text-green-800">Cadastrar Ponto</h3>
            <input name="nome" className="border p-2 rounded w-full mb-2" placeholder="Nome do local" required />
            <input name="endereco" className="border p-2 rounded w-full mb-2" placeholder="Endereço" required />
            <label className="block mb-1 font-semibold">Materiais:</label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {["Plástico", "Vidro", "Metal", "Papel", "Eletrônicos"].map(mat => (
                <label key={mat} className="text-xs">
                  <input type="checkbox" name="materiais" value={mat} className="mr-1" />
                  {mat}
                </label>
              ))}
            </div>
            <input name="horario" className="border p-2 rounded w-full mb-2" placeholder="Horário de funcionamento" />
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800">
                Salvar
              </button>
              <button type="button" className="bg-gray-300 text-gray-800 py-2 px-4 rounded" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DetalhesPonto({ pontos }) {
  const { id } = useParams();
  const ponto = pontos[id];
  if (!ponto) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Navbar user="Usuário" />
      <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto mt-8">
        <div className="md:w-2/3">
          <MapContainer center={ponto.latlng} zoom={16} style={{ height: "300px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            <Marker position={ponto.latlng}>
              <Popup>
                <b>{ponto.nome}</b><br />
                {ponto.endereco}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="md:w-1/3 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          <h2 className="text-green-800 font-bold mb-2">{ponto.nome}</h2>
          <p className="mb-2">{ponto.endereco}</p>
          <p className="text-sm text-gray-600 mb-2">Materiais: {ponto.materiais.join(", ")}</p>
          <p className="text-sm text-gray-600 mb-2">Horário: {ponto.horario || "-"}</p>
          <Link to="/dashboard" className="mt-4 bg-green-700 text-white py-2 rounded text-center hover:bg-green-800">
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [pontos, setPontos] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard pontos={pontos} setPontos={setPontos} /> : <Navigate to="/" />} />
        <Route path="/detalhes/:id" element={user ? <DetalhesPonto pontos={pontos} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
