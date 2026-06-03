"use client";

// WICHTIG: Leaflet CSS Styles importieren
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { getVenues, toggleVenueAttendance } from "../actions/map";
import { Check, Users } from "lucide-react";

// Fix für die Standard-Marker-Icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface GroupUser {
  name: string;
  username: string;
}

interface AttendeeGroup {
  id: string;
  membersCount: number;
  gender: string;
  photos: string[];
  user: GroupUser;
}

interface VenueAttendance {
  id: string;
  groupId: string;
  group: AttendeeGroup;
}

interface Venue {
  id: string;
  name: string;
  type: string; // "BAR" or "CLUB"
  latitude: number;
  longitude: number;
  attendees: VenueAttendance[];
}

export default function MapDisplay() {
  // Koordinaten-Zentrum für Mainz
  const centerPosition: [number, number] = [49.9929, 8.2473]; // Mainz Central Coordinates
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const loadMapData = async () => {
    const data = await getVenues();
    setVenues(data as Venue[]);
  };

  useEffect(() => {
    loadMapData();
  }, []);

  // Custom DivIcon generator to render clean Tailwind circles instead of default image flags
  const createMarkerIcon = (type: "BAR" | "CLUB" | "USER") => {
    let colorClass = "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"; // Default User Dot
    
    if (type === "CLUB") {
      colorClass = "bg-[#FF725E] shadow-[0_0_15px_rgba(255,114,94,0.7)]"; // Club brand color glow
    } else if (type === "BAR") {
      colorClass = "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]"; // Bar amber glow
    }

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="w-5 h-5 rounded-full border-2 border-black ${colorClass} transition-all duration-300 transform hover:scale-125"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const handleRsvpToggle = async (venueId: string) => {
    setLoadingActionId(venueId);
    const result = await toggleVenueAttendance(venueId);
    
    if (result && 'success' in result && result.success) {
      // Refresh the dataset completely to update the scrollable group lists dynamically
      await loadMapData();
    } else if (result && 'error' in result) {
      console.error("RSVP error:", result.error);
    }
    setLoadingActionId(null);
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* CartoDB Dark Matter base layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* 1. Current User Position Marker (Blue Dot) */}
        <Marker position={centerPosition} icon={createMarkerIcon("USER")}>
          <Popup className="custom-dark-popup">
            <div className="p-1 text-black font-sans">
              <p className="font-black text-xs uppercase tracking-wider text-blue-600">Your Location</p>
              <h3 className="font-bold text-sm mt-0.5">Mainz Neustadt</h3>
            </div>
          </Popup>
        </Marker>

        {/* 2. Venues Seeded from Database (Clubs & Bars) */}
        {venues.map((venue) => {
          // Check if current user's session group is already registered in this venue
          // (Can be verified safely via cookie matching or list presence checks in production)
          const totalGroups = venue.attendees?.length || 0;

          return (
            <Marker 
              key={venue.id} 
              position={[venue.latitude, venue.longitude]} 
              icon={createMarkerIcon(venue.type as "BAR" | "CLUB")}
            >
              <Popup>
                <div className="w-64 p-2 text-black font-sans flex flex-col max-h-72">
                  
                  {/* Top Info Header */}
                  <div className="border-b border-gray-100 pb-2 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${
                      venue.type === "CLUB" ? "bg-[#FF725E]" : "bg-amber-500"
                    }`}>
                      {venue.type}
                    </span>
                    <h3 className="font-black text-base mt-1 tracking-tight text-gray-900">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Users size={12} />
                      <span>{totalGroups} {totalGroups === 1 ? "group attending" : "groups attending"}</span>
                    </div>
                  </div>

                  {/* Scrollable Attending Groups List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1 max-h-32 scrollbar-thin">
                    {totalGroups === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2 text-center">No groups registered yet. Be the first!</p>
                    ) : (
                      venue.attendees.map((attendance) => (
                        <div 
                          key={attendance.id} 
                          className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          {/* Mini Group Avatar Stack */}
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative flex-shrink-0">
                            {attendance.group.photos?.[0] ? (
                              <img 
                                src={attendance.group.photos[0]} 
                                alt="Group preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300" />
                            )}
                          </div>
                          
                          {/* Group Meta Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {attendance.group.user?.name || "Gloo Crew"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {attendance.group.membersCount} members • {attendance.group.gender.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dynamic Action Button (RSVP Toggle) */}
                  <button
                    onClick={() => handleRsvpToggle(venue.id)}
                    disabled={loadingActionId === venue.id}
                    className="w-full mt-3 bg-black text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-xl transition-all active:scale-95 hover:bg-gray-900 flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {loadingActionId === venue.id ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <Check size={14} />
                        Anmelden / Abmelden
                      </>
                    )}
                  </button>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}