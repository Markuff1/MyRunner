import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

export default function RunMap({ activity }) {
  if (!activity.map?.summary_polyline) return null;

  // Decode the route polyline into an array of lat/lng pairs
  const decodedPath = polyline.decode(activity.map.summary_polyline).map(([lat, lng]) => [lat, lng]);

  const startPoint = decodedPath[0]; // This is where the run starts

  return (
    <div className="map-wrapper">
      <MapContainer
        center={startPoint}
        zoom={12.5}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={decodedPath} color="red" />
      </MapContainer>
    </div>
  );
}
