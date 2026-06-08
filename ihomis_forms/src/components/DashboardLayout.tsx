import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserSession } from "../modules/tracking/hooks/useUserSession";
import { useTheme } from "../lib/ThemeContext";
import "./DashboardLayout.css";

// Email that is granted access to every menu item, regardless of department.
const ADMIN_EMAIL = "tcp@admin.com";

const norm = (value?: string | null) => (value || "").trim();

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentUserName?: string;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

function DashboardLayout({ children, currentUserName, onLogout }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["settings"]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserDeptcode, currentUserEmail } = useUserSession();
  const { isDarkMode, toggleTheme } = useTheme();

  // Access control: the admin email sees everything; otherwise each menu item is
  // gated by the user's department code matching the configured env value(s).
  const isAdmin = norm(currentUserEmail).toLowerCase() === ADMIN_EMAIL;
  const deptcode = norm(currentUserDeptcode);

  const canAccessDept = (...allowed: Array<string | undefined>) => {
    if (isAdmin) return true;
    if (!deptcode) return false;
    return allowed.some((code) => {
      const expected = norm(code as string);
      return expected !== "" && expected === deptcode;
    });
  };

  const access: Record<string, boolean> = {
    forms: canAccessDept(import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_FORMS),
    "lab-upload": canAccessDept(
      import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_DIAGNOSTIC_RAD,
      import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_DIAGNOSTIC_LAB,
    ),
    tracking: canAccessDept(import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_TRACKING),
    settings: canAccessDept(import.meta.env.VITE_SUPABASE_DEPTCODE_FOR_SETTINGS),
  };

  const allMenuItems: MenuItem[] = [
    {
      id: "forms",
      label: "Forms",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      path: "/modules/forms",
    },
    {
      id: "lab-upload",
      label: "Diagnostics Upload",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M12 18v-6"/>
          <path d="M9 15l3-3 3 3"/>
        </svg>
      ),
      path: "/modules/lab-upload",
    },
    {
      id: "tracking",
      label: "Chart Tracking",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M18 17V9"/>
          <path d="M13 17V5"/>
          <path d="M8 17v-3"/>
        </svg>
      ),
      path: "/tracking",
    },
    {
      id: "settings",
      label: "Settings & Administration",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      children: [
        {
          id: "mapping-admin",
          label: "Mapping Admin",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          ),
          path: "/settings/forms-validation",
        },
        {
          id: "tagging",
          label: "Tagging",
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          ),
          path: "/tagging",
        },
      ],
    },
  ];

  // Each item requires the matching department access.
  const menuItems: MenuItem[] = allMenuItems.filter((item) => access[item.id]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path?: string) => {
    if (path) navigate(path);
  };

  const userInitials = currentUserName
    ? currentUserName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M16 10V22M10 13V19M22 13V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {!sidebarCollapsed && <span>iHOMIS Ext</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!sidebarCollapsed && <span className="sidebar-section-title">MENU</span>}
            <ul className="sidebar-menu">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    className={`sidebar-menu-item ${isActive(item.path) ? "active" : ""}`}
                    onClick={() => item.children ? toggleMenu(item.id) : handleNavigation(item.path)}
                  >
                    <span className="sidebar-menu-icon">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="sidebar-menu-label">{item.label}</span>
                        {item.badge && <span className="sidebar-menu-badge">{item.badge}</span>}
                        {item.children && (
                          <svg 
                            className={`sidebar-menu-arrow ${expandedMenus.includes(item.id) ? "expanded" : ""}`}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        )}
                      </>
                    )}
                  </button>
                  {item.children && expandedMenus.includes(item.id) && !sidebarCollapsed && (
                    <ul className="sidebar-submenu">
                      {item.children.map(child => (
                        <li key={child.id}>
                          <button
                            className={`sidebar-submenu-item ${isActive(child.path) ? "active" : ""}`}
                            onClick={() => handleNavigation(child.path)}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="header-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Search or type command..." />
              <span className="header-search-shortcut">⌘K</span>
            </div>
          </div>
          <div className="header-right">
            <button
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button className="header-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <div className="header-user">
              <button 
                className="header-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="header-user-avatar">{userInitials}</div>
                {currentUserName && (
                  <span className="header-user-name">{currentUserName}</span>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {userMenuOpen && (
                <div className="header-user-menu">
                  <div className="header-user-menu-header">
                    <div className="header-user-avatar large">{userInitials}</div>
                    <div>
                      <div className="header-user-menu-name">{currentUserName || "User"}</div>
                      <div className="header-user-menu-email">{currentUserEmail || "—"}</div>
                      <div className="header-user-menu-dept">
                        Dept: {currentUserDeptcode || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="header-user-menu-divider" />
                  <button className="header-user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Edit Profile
                  </button>
                  <button className="header-user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Account Settings
                  </button>
                  <div className="header-user-menu-divider" />
                  <button className="header-user-menu-item logout" onClick={onLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
