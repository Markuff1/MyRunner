import { getAuthUrl } from '../services/strava';
import logo from '../assests/MyRunnerV2.png';
import { useNavigate } from 'react-router-dom';

export default function SideMenu() {
  const navigate = useNavigate();

  const handleDisconnect = () => {
    localStorage.removeItem('access_token');
    sessionStorage.clear(); // If you store anything else
    navigate('/dashboard', { replace: true }); // Reload Dashboard
    window.location.reload(); // Full refresh to clear component state
  };

  return (
    <aside className="side-menu">
      <div className="menu-header">
        <img src={logo} alt="MyRunner Logo" className="logo" />
        <h1>MyRunner</h1>
      </div>
      
      <div className="auth-buttons">
        <a href={getAuthUrl()}>
          <button className="connect-btn">Connect</button>
        </a>
        <button className="disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    </aside>
  );
}
