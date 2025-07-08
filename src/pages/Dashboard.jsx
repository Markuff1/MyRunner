import { useEffect, useState } from 'react';
import { exchangeToken, fetchActivities, getStoredToken } from '../services/strava';
import RunMap from '../components/RunMap';
import PaceGraphModal from '../components/PaceGraphModal';
import '../styles/App.scss';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(unit => String(unit).padStart(2, '0')).join(':');
}

function formatPace(movingTime, km) {
  if (!km) return '--:--';
  const pace = movingTime / 60 / km;
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const urlCode = new URLSearchParams(window.location.search).get('code');
    const storedToken = getStoredToken();

    async function init() {
      try {
        let token = storedToken;

        if (!token && urlCode) {
          token = await exchangeToken(urlCode);
          window.history.replaceState({}, document.title, "/dashboard");
        }

        if (!token) {
          setError("To see your runs, please connect to Strava.");
          return;
        }

        const runs = await fetchActivities(token);
        setActivities(runs);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError('Failed to load Strava data.');
      }
    }

    init();
  }, []);

  const visibleActivities = activities.slice(0, visibleCount);
  const canLoadMore = visibleCount < activities.length;

  if (error) return <div className="errorMessage">{error}</div>;
  if (activities.length === 0) return <p className="loading">Loading activities...</p>;

  return (
    <div className="container">
      <h2 className='Title'>Your Strava Runs</h2>

      <ul className="run-list">
        {visibleActivities.map(act => {
          const km = act.distance / 1000;

          return (
            <li key={act.id} className="run-item">
              <div className="run-card">
                <h3 className='run-title'>---{act.name}---</h3>
                <p className='run-date'><strong>Date:</strong> {dayjs(act.start_date).format('dddd Do MMMM YYYY')}</p>
                <RunMap activity={act} />
                <div className="run-meta">
                  <p className='stat'><strong>Distance:</strong> {km.toFixed(2)} km</p>
                  <p className='stat'><strong>Time:</strong> {formatTime(act.moving_time)}</p>
                  <p
                    className='stat clickable'
                    onClick={() => setSelectedActivity(act)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view pace graph"
                  >
                    <strong>Pace:</strong> {formatPace(act.moving_time, km)} min/km
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {canLoadMore && (
        <button
          className="load-more"
          onClick={() => setVisibleCount(prev => prev + 5)}
        >
          Load More
        </button>
      )}

      <PaceGraphModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
