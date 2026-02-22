import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

// Fix for Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icon for others
const otherIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LocationMarker = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 13);
        }
    }, [coords, map]);

    return coords === null ? null : (
        <Marker position={coords}>
            <Popup>You are here</Popup>
        </Marker>
    );
};

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

const LiveMap = ({ userId }) => {
    const [position, setPosition] = useState(null);
    const [otherUsers, setOtherUsers] = useState({});
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit('join', userId);

        socketRef.current.on('locationChanged', ({ userId: senderId, location }) => {
            setOtherUsers(prev => ({
                ...prev,
                [senderId]: location
            }));
        });

        // Get current location and watch it
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = [latitude, longitude];
                    setPosition(newPos);
                    socketRef.current.emit('updateLocation', { userId, location: newPos });
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
                socketRef.current.disconnect();
            };
        }
    }, [userId]);

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden glass border border-white/10 relative">
            {!position && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-[1000] backdrop-blur-sm">
                    <p className="text-primary font-medium">Requesting Location Access...</p>
                </div>
            )}
            <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker coords={position} />
                {Object.entries(otherUsers).map(([id, coords]) => (
                    <Marker key={id} position={coords} icon={otherIcon}>
                        <Popup>User {id} is here</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
