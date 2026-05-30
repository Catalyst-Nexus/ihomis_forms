import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button
          className="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      <div className={`sidebar-content ${isExpanded ? 'expanded' : ''}`}>
        <ul className="sidebar-menu">
          <li>
            <a href="#admission" className="menu-item">
              Admission
            </a>
          </li>
          <li className="menu-with-submenu">
            <button
              className="menu-item submenu-toggle"
              onClick={() => toggleMenu('services')}
            >
              Services
              <span className={`arrow ${expandedMenu === 'services' ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {expandedMenu === 'services' && (
              <ul className="submenu">
                <li className="submenu-with-nested">
                  <button
                    className="submenu-item nested-toggle"
                    onClick={() => toggleMenu('services-doctor')}
                  >
                    Doctor
                    <span className={`arrow ${expandedMenu === 'services-doctor' ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedMenu === 'services-doctor' && (
                    <ul className="nested-submenu">
                      <li>
                        <a href="#doctor-ward" className="nested-item">
                          Ward
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <a href="#nurse" className="submenu-item">
                    Nurse
                  </a>
                </li>
                <li>
                  <a href="#ward" className="submenu-item">
                    Ward
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
