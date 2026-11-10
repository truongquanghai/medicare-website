import { HeartPulse, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getHomePathForRole, ROUTES, SECTION_IDS, sectionPath } from '../../shared/constants/routes';
import { useTheme } from '../../shared/hooks/useTheme';
import { useAuth } from '../providers/authContext';
import { useLogout } from '../providers/useLogout';

const NAV_LINKS = [
  { to: ROUTES.home, label: 'Trang chủ', end: true },
  { to: ROUTES.doctors, label: 'Bác sĩ' },
  { to: sectionPath(SECTION_IDS.specialties), label: 'Chuyên khoa', section: true },
  { to: sectionPath(SECTION_IDS.facilities), label: 'Cơ sở y tế', section: true },
];

export default function MainLayout({ children }) {
  const { user } = useAuth();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const isDark = theme === 'dark';

  return (
    <>
      <header className="header">
        <div className="nav wrap">
          <Link to={ROUTES.home} className="brand" onClick={closeMenu}>
            <span className="brand-icon">
              <HeartPulse />
            </span>
            <span>
              Medi<span>Care</span>
              <small>CHĂM SÓC SỨC KHỎE</small>
            </span>
          </Link>

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav id="main-nav" className={menuOpen ? 'show' : ''} onClick={closeMenu}>
            {NAV_LINKS.map(({ to, label, end, section }) =>
              section ? (
                <Link key={to} to={to}>
                  {label}
                </Link>
              ) : (
                <NavLink key={to} to={to} end={end}>
                  {label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link className="user-chip" to={getHomePathForRole(user.role)}>
                  <User size={17} />
                  <span className="user-chip__name">{user.full_name}</span>
                </Link>
                <button type="button" className="btn btn-light btn-sm" onClick={logout}>
                  <LogOut size={16} /> Thoát
                </button>
              </>
            ) : (
              <>
                <Link className="login-link" to={ROUTES.login}>
                  Đăng nhập
                </Link>
                <Link className="btn btn-primary btn-sm" to={ROUTES.register}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </>
  );
}
