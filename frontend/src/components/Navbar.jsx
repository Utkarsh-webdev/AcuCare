// frontend/src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  HeartPulse,
  ClipboardCheck,
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const PulseMark = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="15"
      cy="15"
      r="13.5"
      stroke="#F8F0E2"
      strokeWidth="1"
      opacity="0.35"
    />
    <path
      d="M4.5 15H10L12.2 9.5L15.2 20L17.6 15H25.5"
      stroke="#EF5937"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const initials = (name) => {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/health-plan', label: 'Health Plan', icon: HeartPulse },
    { to: '/daily-tracker', label: 'Daily Tracker', icon: ClipboardCheck },
    { to: '/profile', label: 'Profile', icon: UserRound },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Public navbar
  if (!isAuthenticated) {
    return (
      <nav
        className={`
          sticky top-0 z-50 border-b transition-all duration-200
          ${
            scrolled
              ? 'border-[#f5eee1]/10 bg-[#0b2623]/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl'
              : 'border-[#f5eee1]/10 bg-[#0b2623]'
          }
        `}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to="/" className="group flex items-center gap-3">
            <PulseMark />
            <div>
              <span className="block font-display text-[19px] font-semibold tracking-[-0.025em] text-[#f8f0e2]">
                AcuCare
              </span>
              <span className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-[#71847d] sm:block">
                Personal health
              </span>
            </div>
          </Link>

          {/* Public actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#aebbb5] transition-colors hover:text-[#f8f0e2]"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-[9px] bg-[#ef5937] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#d94729] hover:shadow-[0_8px_20px_rgba(239,89,55,0.2)]"
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navbar
  return (
    <nav
      className={`
        sticky top-0 z-50 border-b transition-all duration-200
        ${
          scrolled
            ? 'border-[#f5eee1]/10 bg-[#0b2623]/95 shadow-[0_8px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl'
            : 'border-[#f5eee1]/10 bg-[#0b2623]'
        }
      `}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between">
          {/* Brand */}
          <Link to="/" className="group flex shrink-0 items-center gap-3">
            <PulseMark />
            <div>
              <span className="block font-display text-[19px] font-semibold tracking-[-0.025em] text-[#f8f0e2]">
                AcuCare
              </span>
              <span className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-[#71847d] sm:block">
                Personal health
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors
                    ${
                      active
                        ? 'bg-[#f5eee1]/[0.07] text-[#f8f0e2]'
                        : 'text-[#8fa39b] hover:bg-[#f5eee1]/[0.04] hover:text-[#f8f0e2]'
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[15px] w-[15px] transition-colors
                      ${active ? 'text-[#ef5937]' : 'text-[#71847d] group-hover:text-[#aebbb5]'}
                    `}
                    strokeWidth={1.7}
                  />
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#ef5937]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop user menu */}
          <div ref={menuRef} className="relative hidden md:block">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="group flex items-center gap-2.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-[#f5eee1]/10 hover:bg-[#f5eee1]/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5937]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f0e2] font-mono text-[11px] font-medium text-[#0b2623]">
                {initials(user?.name)}
              </span>
              <div className="hidden text-left lg:block">
                <p className="max-w-[120px] truncate text-[12px] font-medium text-[#f8f0e2]">
                  {user?.name || 'User'}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#71847d]">
                  Account
                </p>
              </div>
              <ChevronDown
                className={`
                  h-3.5 w-3.5 text-[#71847d] transition-transform duration-200
                  ${menuOpen ? 'rotate-180' : ''}
                `}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-[#f5eee1]/10 bg-[#102d29] shadow-[0_18px_45px_rgba(0,0,0,0.3)]">
                <div className="border-b border-[#f5eee1]/10 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#71847d]">
                    Signed in as
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-[#f8f0e2]">
                    {user?.name || 'User'}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8fa39b]">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#aebbb5] transition-colors hover:bg-[#f5eee1]/[0.05] hover:text-[#f8f0e2]"
                >
                  <UserRound className="h-4 w-4 text-[#71847d]" />
                  <span>View profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-[#f5eee1]/10 px-4 py-3 text-left text-sm text-[#ef8066] transition-colors hover:bg-[#ef5937]/[0.08]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/profile"
              aria-label="Open profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f0e2] font-mono text-[11px] font-medium text-[#0b2623]"
            >
              {initials(user?.name)}
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="ml-1 rounded-lg p-2 text-[#aebbb5] transition-colors hover:bg-[#f5eee1]/[0.06] hover:text-[#f8f0e2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5937]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`
            grid overflow-hidden transition-all duration-300 md:hidden
            ${mobileOpen ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}
          `}
        >
          <div className="min-h-0">
            <div className="border-t border-[#f5eee1]/10 pt-3">
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f5eee1]/[0.045] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8f0e2] font-mono text-[11px] font-medium text-[#0b2623]">
                  {initials(user?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#f8f0e2]">
                    {user?.name || 'User'}
                  </p>
                  <p className="truncate text-[11px] text-[#71847d]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`
                        flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors
                        ${
                          active
                            ? 'bg-[#f8f0e2] font-medium text-[#0b2623]'
                            : 'text-[#9eafa8] hover:bg-[#f5eee1]/[0.05] hover:text-[#f8f0e2]'
                        }
                      `}
                    >
                      <Icon
                        className={`h-4 w-4 ${active ? 'text-[#ef5937]' : 'text-[#71847d]'}`}
                        strokeWidth={1.7}
                      />
                      <span>{link.label}</span>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ef5937]" />}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl border-t border-[#f5eee1]/10 px-3.5 py-3 text-left text-sm text-[#ef8066] transition-colors hover:bg-[#ef5937]/[0.07]"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;