import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area
} from 'recharts';
import { fetchPaceStream } from '../services/strava';
import '../styles/_PaceGraphModal.scss';

export default function PaceGraphModal({ activity, onClose }) {
  const [paceData, setPaceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Smooth data using moving average
  function smoothStream(data, windowSize = 7) {
    return data.map((point, i, arr) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(arr.length, i + Math.ceil(windowSize / 2));
      const slice = arr.slice(start, end);
      const avg = slice.reduce((sum, d) => sum + d.pace, 0) / slice.length;
      return { ...point, pace: parseFloat(avg.toFixed(2)) };
    });
  }

  useEffect(() => {
    async function loadPace() {
      if (!activity) return;
      setLoading(true);

      const token = localStorage.getItem('access_token');
      const stream = await fetchPaceStream(activity.id, token);

      const totalDistance = activity.distance;
      const totalKm = totalDistance / 1000;

      if (!stream || stream.length === 0) {
        setPaceData([]);
        setLoading(false);
        return;
      }

      const pointSpacing = totalDistance / stream.length;

      const raw = stream.map((v, i) => {
        const meters = i * pointSpacing;
        const km = meters / 1000;
        const pace = v > 0 ? (1000 / 60) / v : null;
        return {
          km: parseFloat(km.toFixed(2)),
          pace: pace && pace >= 2 && pace <= 50 ? parseFloat(pace.toFixed(2)) : null
        };
      }).filter(p => p.pace !== null);

      const smoothed = smoothStream(raw, 7);
      setPaceData(smoothed);
      setLoading(false);
    }

    loadPace();
  }, [activity]);

  if (!activity) return null;

  const minPace = Math.min(...paceData.map(p => p.pace));
  const maxPace = Math.max(...paceData.map(p => p.pace));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{activity.name} – Pace Graph</h2>
        <p className="chart-description">Real pace (min/km) over distance</p>

        {loading ? (
          <p>Loading pace data...</p>
        ) : paceData.length === 0 ? (
          <p>No pace data available for this activity.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="km"
                type="number"
                domain={[0, Math.ceil(activity.distance / 1000)]}
                tickFormatter={(tick) => `${tick.toFixed(1)}`}
                tick={{ fontSize: 12 }}
                label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                domain={[Math.floor(minPace), Math.ceil(maxPace + 1)]}
                reversed={true}
                tickFormatter={(tick) => `${tick.toFixed(0)}`}
                tick={{ fontSize: 12 }}
                label={{ value: 'min/km', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => `${value.toFixed(2)} min/km`}
                labelFormatter={(label) => `${label.toFixed(2)} km`}
              />
              <Area
                type="monotone"
                dataKey="pace"
                stroke={false}
                fill="#d10000"
                fillOpacity={0.05}
              />
              <Line
                type="monotone"
                dataKey="pace"
                stroke="#d10000"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
