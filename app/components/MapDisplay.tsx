"use client";

// WICHTIG: Leaflet CSS Styles importieren
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix für die Standard-Marker-Icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapDisplay() {
  // Koordinaten-Zentrum für Mainz
  const centerPosition: [number, number] = [49.9929, 8.2473];

  return (
    <div className="w-full h-full min-h-[500px] bg-[#121212] rounded-3xl overflow-hidden">
      <MapContainer center={centerPosition} zoom={14} className="w-full h-full">
        {/* CartoDB Dark Matter TileLayer für den minimalistischen Premium-Look */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <Marker position={centerPosition} icon={customIcon}>
          <Popup>
            <div className="text-black">
              <h3 className="font-bold">Mainz Zentrum</h3>
              <p>Eure aktuelle Position.</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}