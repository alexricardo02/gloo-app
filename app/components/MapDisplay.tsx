"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { 
  getVenues, 
  toggleVenueAttendance, 
  getActiveEvents, 
  getMyActiveEvent, 
  startPreParty, 
  stopPreParty 
} from "../actions/map";
import { Check, Users, Flame, X, Clock, MessageCircle } from "lucide-react";


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

interface PrePartyEvent {
  id: string;
  title: string;
  description: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  endTime: string | Date;
  ownerId: string;
  owner: {
    name: string;
    group: {
      id: string;
      membersCount: number;
    } | null;
  };
}

export default function MapDisplay() {
  // Koordinaten-Zentrum für Mainz
  const t = useTranslations("Map");
  const mapRef = useRef<L.Map | null>(null);
  const centerPosition: [number, number] = [49.9929, 8.2473]; // Mainz Central Coordinates
  const [venues, setVenues] = useState<Venue[]>([]);
  const [preParties, setPreParties] = useState<PrePartyEvent[]>([]);
  const [myEvent, setMyEvent] = useState<PrePartyEvent | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [partyDescription, setPartyDescription] = useState("");
  const [isProcessingParty, setIsProcessingParty] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const loadMapData = async () => {
    const data = await getVenues();
    setVenues(data as Venue[]);

    const partiesData = await getActiveEvents();
    setPreParties(partiesData as PrePartyEvent[]);

    const myActive = await getMyActiveEvent();
    setMyEvent(myActive as PrePartyEvent | null);
  };

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    if (!myEvent) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(myEvent.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        loadMapData();
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myEvent]);



  // Custom DivIcon generator to render clean Tailwind circles instead of default image flags
  const createMarkerIcon = (type: "BAR" | "CLUB" | "USER" |"PARTY") => {
    let colorClass = "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"; // Default User Dot
    let extraClasses = "transition-all duration-300 transform hover:scale-125";
    
    if (type === "CLUB") {
      colorClass = "bg-[#FF725E] shadow-[0_0_15px_rgba(255,114,94,0.7)]"; // Club brand color glow
    } else if (type === "BAR") {
      colorClass = "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]"; // Bar amber glow
    } else if (type === "PARTY") {
      colorClass = "bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.9)]";
      extraClasses += " animate-pulse";
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

  const handleStartParty = async () => {
    if (!mapRef.current) return;
    setIsProcessingParty(true);
    
    const center = mapRef.current.getCenter();
    
    const result = await startPreParty(center.lat, center.lng, partyDescription);
    if (result.error) {
      console.error(result.error);
    } else {
      setPartyDescription("");
      setIsSheetOpen(false);
      await loadMapData();
    }
    setIsProcessingParty(false);
  };

  const handleStopParty = async () => {
    setIsProcessingParty(true);
    const result = await stopPreParty();
    if (!result.error) {
      setIsSheetOpen(false);
      await loadMapData();
    }
    setIsProcessingParty(false);
  };
  

  return (
    <div className="w-full h-full bg-[#0a0a0a]">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
        className="w-full h-full z-0"
        zoomControl={false}
        ref={mapRef}
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
              <p className="font-black text-xs uppercase tracking-wider text-blue-600">{t("yourLocation")}</p>
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
                      <span>
                        {totalGroups === 1 
                          ? t("groupAttending", { count: totalGroups }) 
                          : t("groupsAttending", { count: totalGroups })}
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Attending Groups List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1 max-h-32 scrollbar-thin">
                    {totalGroups === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2 text-center">{t("noGroups")}</p>
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
                      <span className="animate-pulse">{t("processing")}</span>
                    ) : (
                      <>
                        <Check size={14} />
                        {t("toggleRsvp")}
                      </>
                    )}
                  </button>

                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Party marker */}
        {preParties.map((party) => (
          <Marker key={party.id} position={[party.latitude, party.longitude]} icon={createMarkerIcon("PARTY")} zIndexOffset={500}>
            <Popup>
              <div className="w-56 p-2 text-black font-sans">
                <span className="bg-pink-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 inline-block">
                  Vorglühen
                </span>
                <h3 className="font-black text-lg leading-tight mt-1">
                  Host: {party.owner.name}
                </h3>
                {party.owner.group && (
                  <p className="text-xs font-bold text-gray-600 mb-2">
                    {party.owner.group.membersCount} {t("members")}
                  </p>
                )}
                {party.description && (
                  <p className="text-sm text-gray-800 italic bg-gray-50 p-2 rounded-lg border border-gray-100 mb-3">
                    "{party.description}"
                  </p>
                )}
                <div className="bg-gray-100 text-[10px] font-bold text-gray-500 px-2 py-1 rounded mb-3 flex items-center gap-1">
                  📍 {party.locationName}
                </div>
                
                <button className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <MessageCircle size={14} />
                  Chat / Info
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {/* FLOATING ACTION BUTTON */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <button
          onClick={() => setIsSheetOpen(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            myEvent 
            ? "bg-pink-500 border-2 border-white text-white animate-pulse" 
            : "bg-[#111] border border-[#FF725E] text-[#FF725E] hover:scale-105"
          }`}
        >
          {myEvent ? <Clock size={24} /> : <Flame size={24} strokeWidth={2.5} />}
        </button>
      </div>

      {/* BOTTOM SHEET MODAL */}
      {isSheetOpen && (
        <div className="absolute inset-0 z-[2000] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSheetOpen(false)} 
          />
          
          <div className="relative bg-[#111] border-t border-white/10 rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Flame className="text-[#FF725E]" /> Vorglühen
              </h2>
              <button onClick={() => setIsSheetOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            {myEvent ? (
              <div className="space-y-6">
                <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl flex flex-col items-center">
                  <p className="text-xs uppercase font-bold text-pink-500 mb-1">Time Remaining</p>
                  <p className="text-4xl font-black text-white tabular-nums tracking-tighter">
                    {timeLeft}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Your marker is visible on the map. Exact address is hidden and only shared in chat.
                  </p>
                </div>
                <button
                  onClick={handleStopParty}
                  disabled={isProcessingParty}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl uppercase tracking-widest flex justify-center items-center gap-2"
                >
                  {isProcessingParty ? "Processing..." : "Stop Pre-Party"}
                </button>
              </div>
            ) : (
              // CREATE NEW EVENT
              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Share your location to invite other groups to your pre-party. Move the map to the desired location before creating.
                </p>
                
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={partyDescription}
                    onChange={(e) => setPartyDescription(e.target.value)}
                    placeholder="E.g. We bought 2 crates of beer! Join us 🍻"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-700"
                  />
                </div>

                <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 flex items-start gap-3 mt-4">
                  <div className="mt-0.5">📍</div>
                  <p className="text-xs text-gray-400 leading-tight">
                    <strong className="text-white">Privacy safe:</strong> We will mark the current center of your map, but your exact street/house number will be <span className="text-pink-400 font-bold">hidden</span> until you chat with a match.
                  </p>
                </div>

                <button
                  onClick={handleStartParty}
                  disabled={isProcessingParty}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-4 rounded-xl uppercase tracking-widest mt-6 shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95 transition-all flex justify-center items-center"
                >
                  {isProcessingParty ? "Processing..." : "Share Location"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}