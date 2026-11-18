import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type UserRole = 'STUDENT' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
}

export interface RouteStop {
  id: string;
  name: string;
  landmark: string;
  order: number;
  scheduledTime: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'PENDING' | 'CURRENT' | 'COMPLETED';
}

export type BusStatus = 'EN_ROUTE' | 'BOARDING' | 'IDLE' | 'COMPLETED' | 'PROBLEM';

export interface Bus {
  id: number;
  number: string;
  routeId: number;
  routeName: string;
  driverId: number;
  driverName: string;
  destination: string;
  status: BusStatus;
  bayNumber: string;
  departureTime: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmH: number;
  isSimulated: boolean;
  currentStopIndex: number;
  stops: RouteStop[];
  problemNote?: string;
}

export interface CityBus {
  id: string;
  routeNumber: string;
  operator: 'BMTC' | 'KSRTC';
  source: string;
  destination: string;
  departureTime: string;
  departureTimeRaw: string;
  frequency: string;
  via: string;
}

export type EmergencyStatus = 'PENDING' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EmergencyRequest {
  id: string;
  studentId: string;
  studentName: string;
  destination: string;
  reason: string;
  latitude?: number;
  longitude?: number;
  status: EmergencyStatus;
  assignedBusId?: number;
  assignedBusNumber?: string;
  createdAt: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  busNumber: string;
  destination: string;
  bayNumber: string;
  message: string;
  severity: 'BOARDING' | 'APPROACHING';
  etaMinutes: number;
  timestamp: string;
}

interface TransitContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { email: string; pass: string; fullName: string; phone?: string }) => Promise<User>;
  logout: () => void;
  buses: Bus[];
  cityBuses: CityBus[];
  emergencies: EmergencyRequest[];
  announcements: Announcement[];
  activeAnnouncement: Announcement | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playChimeManually: () => void;
  createEmergencyRequest: (
    destination: string,
    reason: string,
    latitude?: number,
    longitude?: number
  ) => Promise<EmergencyRequest>;
  driverAdvanceStop: (busId: number, stopIndex: number, action: 'ARRIVE' | 'DEPART') => Promise<void>;
  driverSetTripStatus: (busId: number, status: BusStatus, problemNote?: string) => Promise<void>;
  driverBroadcastGps: (busId: number, lat: number, lng: number, heading?: number) => Promise<void>;
  adminAddBus: (payload: {
    number: string;
    destination: string;
    routeName: string;
    driverName: string;
    bayNumber: string;
  }) => Promise<void>;
  adminRemoveBus: (busId: number) => Promise<void>;
  adminTriageEmergency: (
    emergencyId: string,
    action: 'ACKNOWLEDGE' | 'ASSIGN' | 'START' | 'COMPLETE' | 'CANCEL',
    assignedBusId?: number
  ) => Promise<void>;
}

const STORAGE_KEY = 'jain_transit_v3_store';

const DEMO_USERS: User[] = [
  { id: 'u_student_1', email: 'student@jaintransit.edu', fullName: 'Aarav Sharma', phone: '+91 98450 12345', role: 'STUDENT' },
  { id: 'u_student_2', email: 'student2@jaintransit.edu', fullName: 'Priya Patel', phone: '+91 98450 67890', role: 'STUDENT' },
  { id: 'u_driver_1', email: 'driver1@jaintransit.edu', fullName: 'Ramesh Gowda', phone: '+91 94480 11223', role: 'DRIVER' },
  { id: 'u_driver_5', email: 'driver5@jaintransit.edu', fullName: 'Sunil Kumar', phone: '+91 94480 44556', role: 'DRIVER' },
  { id: 'u_admin_1', email: 'admin@jaintransit.edu', fullName: 'Campus Transport Officer', phone: '+91 80 4646 9000', role: 'ADMIN' },
];

const INITIAL_BUSES: Bus[] = [
  {
    id: 1,
    number: 'JT-01',
    routeId: 101,
    routeName: 'Jain University → Bengaluru (Kanakapura Corridor)',
    driverId: 1,
    driverName: 'Ramesh Gowda',
    destination: 'Bengaluru',
    status: 'EN_ROUTE',
    bayNumber: 'Bay 2 (South Gate)',
    departureTime: '08:00 AM',
    lat: 12.656,
    lng: 77.441,
    heading: 18,
    speedKmH: 38,
    isSimulated: false,
    currentStopIndex: 1,
    stops: [
      { id: 's1', name: 'Jain University Campus Terminal', landmark: 'Main Admin Bay', order: 1, scheduledTime: '08:00 AM', actualArrival: '07:55 AM', actualDeparture: '08:02 AM', status: 'COMPLETED' },
      { id: 's2', name: 'Kanakapura Cross Checkpost', landmark: 'Highway Toll', order: 2, scheduledTime: '08:18 AM', actualArrival: '08:17 AM', status: 'CURRENT' },
      { id: 's3', name: 'Harohalli Town Circle', landmark: 'Police Station Junction', order: 3, scheduledTime: '08:35 AM', status: 'PENDING' },
      { id: 's4', name: 'Art of Living Ashram Gate', landmark: 'Kaggalipura Hub', order: 4, scheduledTime: '08:55 AM', status: 'PENDING' },
      { id: 's5', name: 'Thalaghattapura Metro Station', landmark: 'Green Line Terminal', order: 5, scheduledTime: '09:12 AM', status: 'PENDING' },
      { id: 's6', name: 'Banashankari TTMC Hub', landmark: 'Bengaluru South Interchange', order: 6, scheduledTime: '09:35 AM', status: 'PENDING' },
    ],
  },
  {
    id: 2,
    number: 'JT-02',
    routeId: 102,
    routeName: 'Jain University → Bengaluru (Express Shuttles)',
    driverId: 2,
    driverName: 'Mohan Das',
    destination: 'Bengaluru',
    status: 'BOARDING',
    bayNumber: 'Bay 1 (North Gate)',
    departureTime: '08:45 AM',
    lat: 12.6515,
    lng: 77.4392,
    heading: 0,
    speedKmH: 0,
    isSimulated: true,
    currentStopIndex: 0,
    stops: [
      { id: 's21', name: 'Jain University Campus Terminal', landmark: 'Bay 1', order: 1, scheduledTime: '08:45 AM', status: 'CURRENT' },
      { id: 's22', name: 'Harohalli Industrial Bypass', landmark: 'Highway Entrance', order: 2, scheduledTime: '09:00 AM', status: 'PENDING' },
      { id: 's23', name: 'Silk Institute Metro', landmark: 'Flyover North', order: 3, scheduledTime: '09:25 AM', status: 'PENDING' },
      { id: 's24', name: 'Bengaluru Central Majestic', landmark: 'Platform 18', order: 4, scheduledTime: '10:05 AM', status: 'PENDING' },
    ],
  },
  {
    id: 3,
    number: 'JT-03',
    routeId: 103,
    routeName: 'Jain University → Harohalli Local Feeder',
    driverId: 3,
    driverName: 'Anil Reddy',
    destination: 'Harohalli',
    status: 'BOARDING',
    bayNumber: 'Bay 3 (West Bay)',
    departureTime: '08:30 AM',
    lat: 12.6512,
    lng: 77.439,
    heading: 90,
    speedKmH: 0,
    isSimulated: true,
    currentStopIndex: 0,
    stops: [
      { id: 's31', name: 'Jain University Campus Terminal', landmark: 'Bay 3', order: 1, scheduledTime: '08:30 AM', status: 'CURRENT' },
      { id: 's32', name: 'Hostel Block 4 & 5', landmark: 'Campus Loop', order: 2, scheduledTime: '08:35 AM', status: 'PENDING' },
      { id: 's33', name: 'Harohalli Bus Stand', landmark: 'Town Market', order: 3, scheduledTime: '08:50 AM', status: 'PENDING' },
    ],
  },
  {
    id: 4,
    number: 'JT-04',
    routeId: 104,
    routeName: 'Jain University → Bengaluru Late Morning Run',
    driverId: 4,
    driverName: 'Kishore V.',
    destination: 'Bengaluru',
    status: 'IDLE',
    bayNumber: 'Bay 2 (South Gate)',
    departureTime: '09:30 AM',
    lat: 12.651,
    lng: 77.4385,
    heading: 0,
    speedKmH: 0,
    isSimulated: true,
    currentStopIndex: 0,
    stops: [
      { id: 's41', name: 'Jain University Campus Terminal', landmark: 'Bay 2', order: 1, scheduledTime: '09:30 AM', status: 'PENDING' },
      { id: 's42', name: 'Kaggalipura Junction', landmark: 'Main Road', order: 2, scheduledTime: '10:00 AM', status: 'PENDING' },
      { id: 's43', name: 'Yelachenahalli Metro', landmark: 'South Gate', order: 3, scheduledTime: '10:30 AM', status: 'PENDING' },
    ],
  },
  {
    id: 5,
    number: 'JT-05',
    routeId: 105,
    routeName: 'Jain University → Harohalli Regular Shuttles',
    driverId: 5,
    driverName: 'Sunil Kumar',
    destination: 'Harohalli',
    status: 'EN_ROUTE',
    bayNumber: 'Bay 4 (Express Lane)',
    departureTime: '08:15 AM',
    lat: 12.671,
    lng: 77.448,
    heading: 195,
    speedKmH: 42,
    isSimulated: true,
    currentStopIndex: 1,
    stops: [
      { id: 's51', name: 'Jain University Campus Terminal', landmark: 'Bay 4', order: 1, scheduledTime: '08:15 AM', actualArrival: '08:12 AM', actualDeparture: '08:16 AM', status: 'COMPLETED' },
      { id: 's52', name: 'Bettahalli Gate', landmark: 'Highway Cross', order: 2, scheduledTime: '08:24 AM', actualArrival: '08:25 AM', status: 'CURRENT' },
      { id: 's53', name: 'Harohalli Bus Stand', landmark: 'Main Stand', order: 3, scheduledTime: '08:40 AM', status: 'PENDING' },
    ],
  },
];

const INITIAL_CITY_BUSES: CityBus[] = [
  { id: 'cb1', routeNumber: '211-C', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (KR Market)', departureTime: '07:45 AM', departureTimeRaw: '0745', frequency: 'Morning Express', via: 'Harohalli, Kaggalipura, Banashankari TTMC' },
  { id: 'cb2', routeNumber: '211-G', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Banashankari TTMC)', departureTime: '08:25 AM', departureTimeRaw: '0825', frequency: 'Peak Shuttle', via: 'Harohalli Cross, Thalaghattapura Metro' },
  { id: 'cb3', routeNumber: '213-B', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Kempegowda / Majestic)', departureTime: '09:15 AM', departureTimeRaw: '0915', frequency: 'Direct Express', via: 'Kaggalipura, Banashankari, City Market' },
  { id: 'cb4', routeNumber: '211-C', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (KR Market)', departureTime: '10:15 AM', departureTimeRaw: '1015', frequency: 'Corridor Regular', via: 'Harohalli, Kaggalipura, Metro Green Line' },
  { id: 'cb5', routeNumber: 'KSRTC Exp', operator: 'KSRTC', source: 'Jain University Gate', destination: 'Bengaluru (Satellite Bus Stand)', departureTime: '11:25 AM', departureTimeRaw: '1125', frequency: 'Intercity Express', via: 'Harohalli Bypass, Mysore Road Satellite' },
  { id: 'cb6', routeNumber: '211-G', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Banashankari TTMC)', departureTime: '11:55 AM', departureTimeRaw: '1155', frequency: 'Midday Connect', via: 'Thalaghattapura Metro, Konanakunte Cross' },
  { id: 'cb7', routeNumber: '213-B', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Kempegowda / Majestic)', departureTime: '01:00 PM', departureTimeRaw: '1300', frequency: 'Afternoon Run', via: 'Kanakapura Corridor, Banashankari, Lalbagh' },
  { id: 'cb8', routeNumber: '211-C', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (KR Market)', departureTime: '03:00 PM', departureTimeRaw: '1500', frequency: 'Campus Return', via: 'Harohalli, Kaggalipura, Metro Green Line' },
  { id: 'cb9', routeNumber: '211-G', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Banashankari TTMC)', departureTime: '04:00 PM', departureTimeRaw: '1600', frequency: 'Evening Peak 1', via: 'Thalaghattapura Metro Station, Banashankari' },
  { id: 'cb10', routeNumber: '211-M', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Banashankari / Silk Board)', departureTime: '04:50 PM', departureTimeRaw: '1650', frequency: 'Evening Peak 2', via: 'Harohalli, Kaggalipura, Banashankari' },
  { id: 'cb11', routeNumber: 'KSRTC Exp', operator: 'KSRTC', source: 'Jain University Gate', destination: 'Bengaluru (Satellite Bus Stand)', departureTime: '05:35 PM', departureTimeRaw: '1735', frequency: 'Intercity Express', via: 'Harohalli Bypass, Kengeri, Mysore Road' },
  { id: 'cb12', routeNumber: '211-C', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (KR Market)', departureTime: '06:20 PM', departureTimeRaw: '1820', frequency: 'Dusk Service', via: 'Kaggalipura, Thalaghattapura Metro' },
  { id: 'cb13', routeNumber: '211-G', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Banashankari TTMC)', departureTime: '07:15 PM', departureTimeRaw: '1915', frequency: 'Night Shuttle', via: 'Metro Green Line, Banashankari' },
  { id: 'cb14', routeNumber: '213-B', operator: 'BMTC', source: 'Jain University Gate', destination: 'Bengaluru (Kempegowda / Majestic)', departureTime: '08:10 PM', departureTimeRaw: '2010', frequency: 'Last Gate Departure', via: 'Harohalli, Banashankari, Central Station' },
];

const INITIAL_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'SOS-201',
    studentId: 'u_student_1',
    studentName: 'Aarav Sharma',
    destination: 'Bengaluru (Fortis Hospital Bannerghatta)',
    reason: 'Medical consultation following lab sprain; need scheduled transport back before 11 AM.',
    latitude: 12.6525,
    longitude: 77.4412,
    status: 'ASSIGNED',
    assignedBusId: 4,
    assignedBusNumber: 'JT-04',
    createdAt: 'Today 07:30 AM',
    notes: 'Transport supervisor assigned JT-04 standby at Bay 2.',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    busNumber: 'JT-01',
    destination: 'Bengaluru',
    bayNumber: 'Bay 2',
    message: 'JT-01 is en route to Bengaluru. Arriving at Kanakapura Cross in 3 minutes.',
    severity: 'APPROACHING',
    etaMinutes: 3,
    timestamp: 'Just now',
  },
  {
    id: 'ann-2',
    busNumber: 'JT-02',
    destination: 'Bengaluru',
    bayNumber: 'Bay 1',
    message: 'JT-02 boarding commenced at North Gate Bay 1. Departure at 08:45 AM.',
    severity: 'BOARDING',
    etaMinutes: 12,
    timestamp: '2 mins ago',
  },
];

function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.75);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.35);
    gain2.gain.setValueAtTime(0.001, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.24, now + 0.39);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.35);
    osc2.stop(now + 1.25);
  } catch {
    // Audio playback may be blocked prior to user gesture
  }
}

const TransitContext = createContext<TransitContextValue | null>(null);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_buses`);
      return saved ? JSON.parse(saved) : INITIAL_BUSES;
    } catch {
      return INITIAL_BUSES;
    }
  });

  const [cityBuses] = useState<CityBus[]>(INITIAL_CITY_BUSES);

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_emergencies`);
      return saved ? JSON.parse(saved) : INITIAL_EMERGENCIES;
    } catch {
      return INITIAL_EMERGENCIES;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(INITIAL_ANNOUNCEMENTS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } catch {
      // ignore quota errors
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_buses`, JSON.stringify(buses));
    } catch {
      // ignore quota errors
    }
  }, [buses]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_emergencies`, JSON.stringify(emergencies));
    } catch {
      // ignore quota errors
    }
  }, [emergencies]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => {
          if (bus.status !== 'EN_ROUTE') return bus;
          const dLat = (Math.random() - 0.48) * 0.0003;
          const dLng = (Math.random() - 0.48) * 0.0003;
          return {
            ...bus,
            lat: bus.lat + dLat,
            lng: bus.lng + dLng,
            speedKmH: Math.floor(32 + Math.random() * 14),
          };
        })
      );
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const playChimeManually = useCallback(() => {
    playChimeSound();
  }, []);

  const login = async (email: string, _password: string): Promise<User> => {
    const existing = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return existing;
    }
    let role: UserRole = 'STUDENT';
    if (email.toLowerCase().includes('driver')) role = 'DRIVER';
    if (email.toLowerCase().includes('admin')) role = 'ADMIN';
    const user: User = {
      id: `u_${Date.now()}`,
      email,
      fullName: email.split('@')[0].toUpperCase(),
      role,
    };
    setCurrentUser(user);
    return user;
  };

  const register = async (payload: { email: string; pass: string; fullName: string; phone?: string }): Promise<User> => {
    const user: User = {
      id: `u_${Date.now()}`,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      role: 'STUDENT',
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createEmergencyRequest = async (
    destination: string,
    reason: string,
    latitude?: number,
    longitude?: number
  ): Promise<EmergencyRequest> => {
    const request: EmergencyRequest = {
      id: `SOS-${Math.floor(200 + Math.random() * 800)}`,
      studentId: currentUser?.id || 'emergency_student',
      studentName: currentUser?.fullName || 'Student Commuter',
      destination,
      reason,
      latitude,
      longitude,
      status: 'PENDING',
      createdAt: 'Just now',
    };
    setEmergencies((prev) => [request, ...prev]);
    return request;
  };

  const driverAdvanceStop = async (busId: number, stopIndex: number, action: 'ARRIVE' | 'DEPART') => {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBuses((prev) =>
      prev.map((bus) => {
        if (bus.id !== busId) return bus;
        const stops = bus.stops.map((stop, idx) => {
          if (idx === stopIndex) {
            return action === 'ARRIVE'
              ? { ...stop, actualArrival: timeLabel, status: 'CURRENT' as const }
              : { ...stop, actualDeparture: timeLabel, status: 'COMPLETED' as const };
          }
          if (action === 'DEPART' && idx === stopIndex + 1) {
            return { ...stop, status: 'CURRENT' as const };
          }
          return stop;
        });
        const nextIdx = action === 'DEPART' ? Math.min(bus.stops.length - 1, stopIndex + 1) : stopIndex;
        const finished = action === 'DEPART' && stopIndex === bus.stops.length - 1;
        return {
          ...bus,
          currentStopIndex: nextIdx,
          status: finished ? 'COMPLETED' : 'EN_ROUTE',
          stops,
        };
      })
    );

    const bus = buses.find((b) => b.id === busId);
    if (bus) {
      const stop = bus.stops[stopIndex];
      const announcement: Announcement = {
        id: `ann-${Date.now()}`,
        busNumber: bus.number,
        destination: bus.destination,
        bayNumber: bus.bayNumber,
        message:
          action === 'ARRIVE'
            ? `${bus.number} has arrived at ${stop?.name || 'intermediate stop'}. Boarding open.`
            : `${bus.number} departed ${stop?.name || 'stop'} and is moving towards the next corridor leg.`,
        severity: action === 'ARRIVE' ? 'BOARDING' : 'APPROACHING',
        etaMinutes: action === 'ARRIVE' ? 0 : 8,
        timestamp: 'Just now',
      };
      setAnnouncements((prev) => [announcement, ...prev.slice(0, 8)]);
      setActiveAnnouncement(announcement);
      if (soundEnabled) playChimeSound();
    }
  };

  const driverSetTripStatus = async (busId: number, status: BusStatus, problemNote?: string) => {
    setBuses((prev) =>
      prev.map((bus) => (bus.id === busId ? { ...bus, status, problemNote } : bus))
    );
  };

  const driverBroadcastGps = async (busId: number, lat: number, lng: number, heading = 0) => {
    setBuses((prev) =>
      prev.map((bus) => (bus.id === busId ? { ...bus, lat, lng, heading, isSimulated: false } : bus))
    );
  };

  const adminAddBus = async (payload: {
    number: string;
    destination: string;
    routeName: string;
    driverName: string;
    bayNumber: string;
  }) => {
    const newBus: Bus = {
      id: Date.now(),
      number: payload.number,
      routeId: Math.floor(100 + Math.random() * 900),
      routeName: payload.routeName,
      driverId: Math.floor(10 + Math.random() * 90),
      driverName: payload.driverName,
      destination: payload.destination,
      status: 'IDLE',
      bayNumber: payload.bayNumber,
      departureTime: '10:00 AM',
      lat: 12.6515,
      lng: 77.439,
      heading: 0,
      speedKmH: 0,
      isSimulated: true,
      currentStopIndex: 0,
      stops: [
        { id: `s_${Date.now()}_1`, name: 'Jain University Campus Terminal', landmark: payload.bayNumber, order: 1, scheduledTime: '10:00 AM', status: 'PENDING' },
        { id: `s_${Date.now()}_2`, name: `${payload.destination} Terminus`, landmark: 'Arrival Platform', order: 2, scheduledTime: '10:45 AM', status: 'PENDING' },
      ],
    };
    setBuses((prev) => [...prev, newBus]);
  };

  const adminRemoveBus = async (busId: number) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
  };

  const adminTriageEmergency = async (
    emergencyId: string,
    action: 'ACKNOWLEDGE' | 'ASSIGN' | 'START' | 'COMPLETE' | 'CANCEL',
    assignedBusId?: number
  ) => {
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id !== emergencyId) return item;
        let nextStatus = item.status;
        let nextBusNumber = item.assignedBusNumber;
        if (action === 'ACKNOWLEDGE') nextStatus = 'ACKNOWLEDGED';
        if (action === 'ASSIGN') {
          nextStatus = 'ASSIGNED';
          nextBusNumber = buses.find((b) => b.id === assignedBusId)?.number || 'Special Shuttle';
        }
        if (action === 'START') nextStatus = 'IN_PROGRESS';
        if (action === 'COMPLETE') nextStatus = 'COMPLETED';
        if (action === 'CANCEL') nextStatus = 'CANCELLED';
        return {
          ...item,
          status: nextStatus,
          assignedBusId: assignedBusId ?? item.assignedBusId,
          assignedBusNumber: nextBusNumber,
        };
      })
    );
  };

  return (
    <TransitContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        buses,
        cityBuses,
        emergencies,
        announcements,
        activeAnnouncement,
        soundEnabled,
        setSoundEnabled,
        playChimeManually,
        createEmergencyRequest,
        driverAdvanceStop,
        driverSetTripStatus,
        driverBroadcastGps,
        adminAddBus,
        adminRemoveBus,
        adminTriageEmergency,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = (): TransitContextValue => {
  const ctx = useContext(TransitContext);
  if (!ctx) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return ctx;
};
