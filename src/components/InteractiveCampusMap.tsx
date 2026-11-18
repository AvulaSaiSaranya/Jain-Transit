import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  setWorkerUrl,
  type StyleSpecification,
} from 'maplibre-gl';

setWorkerUrl('/maplibre-gl-worker.mjs');
import {
  Compass,
  Crosshair,
  ExternalLink,
  Layers,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  X,
} from 'lucide-react';
import type { Bus } from '../context/TransitContext';

interface CampusPlace {
  id: string;
  name: string;
  category: 'CAMPUS' | 'METRO' | 'BUS_STOP' | 'FOOD' | 'HOSPITAL';
  categoryLabel: string;
  lat: number;
  lng: number;
  description: string;
  landmark: string;
  icon: 'campus' | 'metro' | 'bus' | 'food' | 'hospital';
}

interface SimulatedShuttle {
  id: number;
  number: string;
  lat: number;
  lng: number;
  heading: number;
  color: string;
  etaMinutes: number;
  destination: string;
  driverName: string;
  bayNumber: string;
}

const CAMPUS_CENTER = { lat: 12.6521, lng: 77.4412 };

const CAMPUS_PLACES: CampusPlace[] = [
  {
    id: 'p-jain-term',
    name: 'Jain University FET Campus Terminal',
    category: 'CAMPUS',
    categoryLabel: 'University Terminal',
    lat: 12.6521,
    lng: 77.4412,
    description: 'Main shuttle departure arcade with Bays 1 to 4, charging docks, and student boarding lounge.',
    landmark: 'Behind Administrative Block',
    icon: 'campus',
  },
  {
    id: 'p-jain-gate1',
    name: 'Jain Campus Main Gate 1 & BMTC Stop',
    category: 'BUS_STOP',
    categoryLabel: 'Campus Gate & Public Bus Stop',
    lat: 12.6538,
    lng: 77.4402,
    description: 'Official gate bus stop for 14 daily BMTC/KSRTC departures (211-C, 213-B) connecting to Bengaluru.',
    landmark: 'Kanakapura Main Road NH 948',
    icon: 'bus',
  },
  {
    id: 'p-jain-acad',
    name: 'Academic & Engineering Complex',
    category: 'CAMPUS',
    categoryLabel: 'Classrooms & Labs',
    lat: 12.6512,
    lng: 77.4428,
    description: 'School of Engineering and Technology, mechanical/computer labs, and central library plaza.',
    landmark: 'East Quadrangle',
    icon: 'campus',
  },
  {
    id: 'p-harohalli-circle',
    name: 'Harohalli Town Circle Bus Stand',
    category: 'BUS_STOP',
    categoryLabel: 'Town Hub & Transit Loop',
    lat: 12.637,
    lng: 77.458,
    description: 'Central market intersection with local auto stands, eateries, and frequent city feeder connections.',
    landmark: 'Police Station Circle',
    icon: 'bus',
  },
  {
    id: 'p-harohalli-kiadb',
    name: 'Harohalli Industrial Area (KIADB Gate 2)',
    category: 'BUS_STOP',
    categoryLabel: 'Industrial Corridor',
    lat: 12.642,
    lng: 77.452,
    description: 'Transit stop for engineering interns and technical park staff along the industrial highway loop.',
    landmark: 'KIADB Phase 1 Boulevard',
    icon: 'bus',
  },
  {
    id: 'p-harohalli-hosp',
    name: 'Harohalli Community Health Centre',
    category: 'HOSPITAL',
    categoryLabel: 'Medical Emergency',
    lat: 12.6395,
    lng: 77.456,
    description: 'Nearest government hospital equipped with 24/7 casualty, pharmacy, and urgent trauma triage.',
    landmark: 'Hospital Road, Harohalli',
    icon: 'hospital',
  },
  {
    id: 'p-art-living',
    name: 'Art of Living International Center',
    category: 'CAMPUS',
    categoryLabel: 'Cultural Landmark & Transit Node',
    lat: 12.805,
    lng: 77.511,
    description: 'Prominent Kanakapura highway landmark and major intermediate drop-off for Jain shuttles.',
    landmark: '21st Km, Kanakapura Road, Udayapura',
    icon: 'campus',
  },
  {
    id: 'p-kaggalipura',
    name: 'Kaggalipura Bus Junction',
    category: 'BUS_STOP',
    categoryLabel: 'Corridor Interchange',
    lat: 12.782,
    lng: 77.498,
    description: 'Major intermediate bus junction connecting rural feeders and express BMTC services.',
    landmark: 'Kaggalipura Main Junction',
    icon: 'bus',
  },
  {
    id: 'p-metro-thalaghattapura',
    name: 'Thalaghattapura Metro Station',
    category: 'METRO',
    categoryLabel: 'Namma Metro (Green Line)',
    lat: 12.871,
    lng: 77.532,
    description: 'Fastest rapid transit connection to central Bengaluru. Escalators lead directly to trains to Majestic.',
    landmark: 'Kanakapura Main Road Metro Viaduct',
    icon: 'metro',
  },
  {
    id: 'p-banashankari-ttmc',
    name: 'Banashankari TTMC Bus & Metro Hub',
    category: 'METRO',
    categoryLabel: 'Major Transit Interchange',
    lat: 12.9177,
    lng: 77.5739,
    description: 'South Bengaluru mega-terminal connecting Metro Green Line, BMTC Volvo, and KSRTC highway buses.',
    landmark: 'Outer Ring Road Interchange',
    icon: 'metro',
  },
  {
    id: 'p-food-hallimane',
    name: 'Halli Mane Tiffin Corner',
    category: 'FOOD',
    categoryLabel: 'Traditional South Indian Dining',
    lat: 12.648,
    lng: 77.446,
    description: 'Popular student spot renowned for hot Thatte Idli, crispy Masala Dosas, and freshly brewed filter coffee.',
    landmark: 'Kanakapura Highway near Campus Turn',
    icon: 'food',
  },
  {
    id: 'p-food-ccd',
    name: 'Cafe Coffee Day Express Fuel Plaza',
    category: 'FOOD',
    categoryLabel: 'Cafe & Waiting Lounge',
    lat: 12.665,
    lng: 77.449,
    description: 'Highway cafe equipped with high-speed Wi-Fi, air-conditioned lounge, and student study nooks.',
    landmark: 'BPCL Expressway Plaza',
    icon: 'food',
  },
];

const SHUTTLE_ORBITS = [
  { busId: 1, number: 'JT-01', radius: 0.012, phase: 0, speed: 0.55, eta: 4, dest: 'Kanakapura Corridor (Bengaluru)', color: '#1a73e8' },
  { busId: 2, number: 'JT-02', radius: 0.018, phase: 1.2, speed: 0.42, eta: 8, dest: 'Express Shuttle (Majestic / TTMC)', color: '#16a34a' },
  { busId: 3, number: 'JT-03', radius: 0.009, phase: 2.4, speed: 0.7, eta: 3, dest: 'Harohalli Local Feeder (Loop A)', color: '#d97706' },
  { busId: 4, number: 'JT-04', radius: 0.015, phase: 3.5, speed: 0.5, eta: 11, dest: 'Late Morning City Connector', color: '#7c3aed' },
  { busId: 5, number: 'JT-05', radius: 0.022, phase: 4.8, speed: 0.38, eta: 14, dest: 'Outer Ring Express Line', color: '#dc2626' },
];

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function getTileStyle(layer: 'streets' | 'satellite' | 'terrain'): StyleSpecification {
  if (layer === 'satellite') {
    return {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        },
      },
      layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 19 }],
    };
  }
  if (layer === 'terrain') {
    return {
      version: 8,
      sources: {
        'esri-street': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri, HERE, Garmin, USGS',
        },
      },
      layers: [{ id: 'esri-street-layer', type: 'raster', source: 'esri-street', minzoom: 0, maxzoom: 19 }],
    };
  }
  return {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm-tiles-layer', type: 'raster', source: 'osm-tiles', minzoom: 0, maxzoom: 19 }],
  };
}

interface InteractiveCampusMapProps {
  buses: Bus[];
  onSelectBus?: (busId: number) => void;
  compact?: boolean;
  focusBus?: string | null;
}

export const InteractiveCampusMap: React.FC<InteractiveCampusMapProps> = ({
  buses,
  onSelectBus,
  compact = false,
  focusBus = null,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busMarkersRef = useRef<Map<number, MapLibreMarker>>(new Map());
  const placeMarkersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const userMarkerRef = useRef<MapLibreMarker | null>(null);

  const [layer, setLayer] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [selectedBusNumber, setSelectedBusNumber] = useState<string | null>(focusBus);
  const [activeBus, setActiveBus] = useState<SimulatedShuttle | null>(null);
  const [activePlace, setActivePlace] = useState<CampusPlace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [tick, setTick] = useState(0);
  const [mapFailed, setMapFailed] = useState(false);

  const liveShuttles: SimulatedShuttle[] = useMemo(() => {
    const activeSet = new Set(buses.map((b) => b.number.toUpperCase()));
    return SHUTTLE_ORBITS.map((orbit) => {
      const matched = buses.find((b) => b.number.toUpperCase() === orbit.number);
      const angle = tick * orbit.speed + orbit.phase;
      const dLat = Math.sin(angle) * orbit.radius;
      const dLng = Math.cos(angle) * orbit.radius * 1.15;
      const heading = ((Math.atan2(Math.cos(angle) * orbit.radius, -Math.sin(angle) * orbit.radius * 1.15) * 180) / Math.PI + 360) % 360;
      return {
        id: matched?.id ?? orbit.busId,
        number: orbit.number,
        lat: CAMPUS_CENTER.lat + dLat,
        lng: CAMPUS_CENTER.lng + dLng,
        heading: Math.round(heading),
        color: orbit.color,
        etaMinutes: orbit.eta,
        destination: matched?.destination || orbit.dest,
        driverName: matched?.driverName || 'Campus Transit Crew',
        bayNumber: matched?.bayNumber || `Bay ${orbit.busId}`,
      };
    }).filter((s) => buses.length === 0 || activeSet.has(s.number.toUpperCase()));
  }, [tick, buses]);

  const filteredPlaces = useMemo(() => {
    return CAMPUS_PLACES.filter((place) => {
      const matchCat = categoryFilter === 'ALL' || place.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.description.toLowerCase().includes(q) ||
        place.landmark.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 0.08);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 6000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLibreMap | null = null;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: getTileStyle('streets'),
        center: [CAMPUS_CENTER.lng, CAMPUS_CENTER.lat],
        zoom: compact ? 13.8 : 14.5,
        pitch: 25,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch {
      setMapFailed(true);
      return;
    }

    return () => {
      busMarkersRef.current.forEach((m) => {
        try { m.remove(); } catch {}
      });
      busMarkersRef.current.clear();
      placeMarkersRef.current.forEach((m) => {
        try { m.remove(); } catch {}
      });
      placeMarkersRef.current.clear();
      if (userMarkerRef.current) {
        try { userMarkerRef.current.remove(); } catch {}
        userMarkerRef.current = null;
      }
      if (map) {
        try { map.remove(); } catch {}
      }
      mapRef.current = null;
    };
  }, [compact]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    try {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userPos.lng, userPos.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none';
        el.innerHTML = `
          <div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:22px;height:22px;border-radius:9999px;background:rgba(37,99,235,0.28);"></div>
            <div style="position:relative;width:14px;height:14px;border-radius:9999px;background:#1a73e8;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `;
        userMarkerRef.current = new MapLibreMarker({ element: el }).setLngLat([userPos.lng, userPos.lat]).addTo(map);
      }
    } catch {
      // ignore marker errors
    }
  }, [userPos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = placeMarkersRef.current;
    const activeIds = new Set(filteredPlaces.map((p) => p.id));

    markers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        try { marker.remove(); } catch {}
        markers.delete(id);
      }
    });

    filteredPlaces.forEach((place) => {
      if (markers.has(place.id)) return;
      try {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none';
        const badgeText =
          place.icon === 'campus'
            ? 'Campus'
            : place.icon === 'metro'
              ? 'Metro'
              : place.icon === 'bus'
                ? 'Stop'
                : place.icon === 'food'
                  ? 'Cafe'
                  : 'Clinic';
        el.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;background:#fff;color:#0f172a;padding:4px 10px;border-radius:10px;box-shadow:0 4px 12px rgba(15,23,42,0.16);border:1px solid #cbd5e1;font-size:11px;font-weight:700;white-space:nowrap;">
            <span style="color:#2563eb;font-size:10px;font-weight:800;text-transform:uppercase;">${badgeText}</span>
            <span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;">${place.name}</span>
          </div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActivePlace(place);
          setActiveBus(null);
          try {
            map.flyTo({ center: [place.lng, place.lat], zoom: 15.5, essential: true, speed: 1.2 });
          } catch {}
        });
        const marker = new MapLibreMarker({ element: el }).setLngLat([place.lng, place.lat]).addTo(map);
        markers.set(place.id, marker);
      } catch {
        // ignore marker placement error
      }
    });
  }, [filteredPlaces]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = busMarkersRef.current;
    const activeIds = new Set(liveShuttles.map((b) => b.id));

    markers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        try { marker.remove(); } catch {}
        markers.delete(id);
      }
    });

    liveShuttles.forEach((bus) => {
      const existing = markers.get(bus.id);
      if (existing) {
        existing.setLngLat([bus.lng, bus.lat]);
        return;
      }
      try {
        const el = document.createElement('div');
        el.className = 'cursor-pointer select-none';
        el.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);filter:drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
            <div style="background:${bus.color};color:#fff;font-weight:800;font-size:11px;padding:4px 10px;border-radius:10px;border:2px solid #fff;white-space:nowrap;">
              ${bus.number}
            </div>
            <div style="margin-top:2px;background:rgba(15,23,42,0.92);color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:6px;">
              ${bus.etaMinutes}m ETA
            </div>
          </div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActiveBus(bus);
          setActivePlace(null);
          setSelectedBusNumber(bus.number);
          onSelectBus?.(bus.id);
        });
        const marker = new MapLibreMarker({ element: el }).setLngLat([bus.lng, bus.lat]).addTo(map);
        markers.set(bus.id, marker);
      } catch {
        // ignore marker error
      }
    });
  }, [liveShuttles, onSelectBus]);

  const handleLayerChange = (nextLayer: 'streets' | 'satellite' | 'terrain') => {
    setLayer(nextLayer);
    if (mapRef.current) {
      mapRef.current.setStyle(getTileStyle(nextLayer));
    }
  };

  const handleUserLocate = () => {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo({ center: [userPos.lng, userPos.lat], zoom: 16, essential: true, speed: 1.4 });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(coords);
          mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 16, essential: true, speed: 1.4 });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  };

  const handleResetView = () => {
    setSelectedBusNumber(null);
    setActiveBus(null);
    setActivePlace(null);
    mapRef.current?.flyTo({
      center: [CAMPUS_CENTER.lng, CAMPUS_CENTER.lat],
      zoom: compact ? 13.8 : 14.5,
      pitch: 25,
      essential: true,
      speed: 1.2,
    });
  };

  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + delta);
    }
  };

  const handleFocusBus = (bus: SimulatedShuttle) => {
    setSelectedBusNumber(bus.number);
    setActiveBus(bus);
    setActivePlace(null);
    mapRef.current?.flyTo({ center: [bus.lng, bus.lat], zoom: 15.5, essential: true, speed: 1.2 });
    onSelectBus?.(bus.id);
  };

  if (mapFailed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="kicker" style={{ margin: 0 }}>Kanakapura Corridor Live Telemetry</div>
            <h3 className="font-display text-lg font-extrabold text-slate-900 mt-1">
              Active Shuttle Positions
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">12.6521° N, 77.4412° E</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveShuttles.map((bus) => (
            <div key={bus.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{bus.number}</span>
                <span className="text-xs font-bold text-emerald-700 tabular-nums">{bus.etaMinutes}m ETA</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">{bus.destination}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                {bus.lat.toFixed(4)}, {bus.lng.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-100 ${
        compact ? 'h-[440px]' : 'h-[620px]'
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[420px] z-20 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-2.5">
          <div className="flex items-center gap-2 px-2 py-1">
            <Search size={17} className="text-blue-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, bus stops, campus gates..."
              className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            {[
              { id: 'ALL', label: 'All Places' },
              { id: 'CAMPUS', label: 'Campus' },
              { id: 'METRO', label: 'Metro' },
              { id: 'BUS_STOP', label: 'Bus Stops' },
              { id: 'FOOD', label: 'Food' },
              { id: 'HOSPITAL', label: 'Hospital' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {searchQuery.trim() && filteredPlaces.length > 0 && (
          <div className="mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 max-h-56 overflow-y-auto">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  setActivePlace(place);
                  setActiveBus(null);
                  setSearchQuery('');
                  mapRef.current?.flyTo({ center: [place.lng, place.lat], zoom: 15.5, essential: true });
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{place.name}</div>
                  <div className="text-[11px] text-slate-500">{place.landmark}</div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 shrink-0 ml-2">Locate</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 hidden lg:flex items-center gap-1.5 z-20 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-slate-200/80">
        <span className="text-[11px] font-bold text-slate-500 mr-1">Live Shuttles:</span>
        {liveShuttles.map((bus) => (
          <button
            key={bus.id}
            type="button"
            onClick={() => handleFocusBus(bus)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer font-mono ${
              selectedBusNumber === bus.number
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {bus.number}
          </button>
        ))}
      </div>

      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-2 z-20 pointer-events-auto">
        <button
          type="button"
          title="Your Live Location"
          aria-label="Center on your live location"
          onClick={handleUserLocate}
          className="w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center transition-colors border bg-white hover:bg-blue-50 text-blue-600 border-slate-200 cursor-pointer"
        >
          <Crosshair size={18} />
        </button>

        <button
          type="button"
          title="Center on Campus"
          aria-label="Center map on Jain University Campus"
          onClick={handleResetView}
          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Compass size={18} />
        </button>

        <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <button
            type="button"
            title="Zoom In"
            aria-label="Zoom in"
            onClick={() => handleZoom(1)}
            className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 border-b border-slate-100 cursor-pointer"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            title="Zoom Out"
            aria-label="Zoom out"
            onClick={() => handleZoom(-1)}
            className="w-11 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200">
        <button
          type="button"
          onClick={() => handleLayerChange('streets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            layer === 'streets' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin size={13} />
          <span>Default</span>
        </button>
        <button
          type="button"
          onClick={() => handleLayerChange('satellite')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            layer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={13} />
          <span>Satellite</span>
        </button>
        <button
          type="button"
          onClick={() => handleLayerChange('terrain')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            layer === 'terrain' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Navigation size={13} />
          <span>Highways</span>
        </button>
      </div>

      {(activePlace || activeBus) && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-30 pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-[11px] font-bold text-blue-700">
                {activePlace ? activePlace.categoryLabel : `${activeBus!.number} · ${activeBus!.bayNumber}`}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {activePlace ? activePlace.name : `Shuttle ${activeBus!.number} (${activeBus!.destination})`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setActivePlace(null);
                setActiveBus(null);
              }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Close detail card"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            {activePlace
              ? activePlace.description
              : `Live corridor transit en route to ${activeBus!.destination}. Driver: ${activeBus!.driverName}`}
          </p>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Distance From You</span>
              <b className="text-slate-900 tabular-nums">
                {userPos
                  ? `${distanceKm(
                      userPos.lat,
                      userPos.lng,
                      activePlace ? activePlace.lat : activeBus!.lat,
                      activePlace ? activePlace.lng : activeBus!.lng
                    )} km`
                  : 'Enable GPS'}
              </b>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Est. Transit ETA</span>
              <b className="text-emerald-700 tabular-nums">
                {activePlace ? '~10 - 25 mins' : `${activeBus!.etaMinutes} mins to stop`}
              </b>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${
              activePlace ? activePlace.lat : activeBus!.lat
            },${activePlace ? activePlace.lng : activeBus!.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
          >
            <ExternalLink size={14} />
            <span>Open Directions in Google Maps</span>
          </a>
        </div>
      )}
    </div>
  );
};
