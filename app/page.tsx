'use client'

import { useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  UserRound,
  X,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Employees', icon: Users, count: '24' },
  { label: 'Patients', icon: UserRound, count: '184' },
  { label: 'Pharmacy', icon: Pill },
  { label: 'Services', icon: Stethoscope },
]

const patients = [
  { initials: 'AM', name: 'Ava Mitchell', id: 'PT-10482', service: 'Cardiology', status: 'Checked in', tone: 'green', time: '09:20 AM' },
  { initials: 'JR', name: 'James Rivera', id: 'PT-10481', service: 'General care', status: 'Waiting', tone: 'amber', time: '09:05 AM' },
  { initials: 'SC', name: 'Sophia Carter', id: 'PT-10480', service: 'Dermatology', status: 'In consultation', tone: 'blue', time: '08:45 AM' },
  { initials: 'DO', name: 'Daniel Okafor', id: 'PT-10479', service: 'Pharmacy', status: 'Ready', tone: 'purple', time: '08:32 AM' },
]

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('admin@careflow.health')
  const [password, setPassword] = useState('password')
  const [active, setActive] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)

  if (!isLoggedIn) {
    return (
      <main className="login-shell">
        <section className="login-visual" aria-label="CareFlow introduction">
          <div className="brand brand-light"><span className="brand-mark"><Activity /></span><span>care<span>flow</span></span></div>
          <div className="visual-copy">
            <p className="eyebrow">HEALTHCARE OPERATIONS, SIMPLIFIED</p>
            <h1>Care that moves<br /><em>forward.</em></h1>
            <p className="visual-description">One connected workspace for the people, patients, and services that keep your practice running.</p>
          </div>
          <div className="visual-footer"><ShieldCheck /> <span>Private, secure, and built for modern care teams.</span></div>
        </section>
        <section className="login-panel">
          <div className="login-form-wrap">
            <div className="mobile-brand brand"><span className="brand-mark"><Activity /></span><span>care<span>flow</span></span></div>
            <div className="login-heading"><p className="eyebrow">ADMIN PORTAL</p><h2>Welcome back</h2><p>Sign in to access your care operations dashboard.</p></div>
            <form onSubmit={(event) => { event.preventDefault(); setIsLoggedIn(true) }} className="login-form">
              <label htmlFor="email">Work email<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
              <label htmlFor="password">Password<div className="password-wrap"><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><button type="button" aria-label="Show password">Show</button></div></label>
              <div className="form-options"><label className="checkbox-label"><input type="checkbox" defaultChecked /> <span>Remember me</span></label><a href="#forgot">Forgot password?</a></div>
              <button className="primary-button" type="submit">Sign in <ArrowUpRight /></button>
            </form>
            <p className="login-note"><ShieldCheck /> Your account is protected with enterprise-grade security.</p>
          </div>
          <p className="copyright">© 2025 CareFlow Health <span>•</span> Privacy <span>•</span> Terms</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      {mobileNav && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><div className="brand"><span className="brand-mark"><Activity /></span><span>care<span>flow</span></span></div><button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X /></button></div>
        <div className="workspace"><div className="workspace-icon">CH</div><div><strong>CareHouse Clinic</strong><span>Admin workspace</span></div><ChevronDown /></div>
        <nav aria-label="Main navigation"><p className="nav-label">WORKSPACE</p>{navigation.map((item) => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${active === item.label ? 'nav-active' : ''}`} onClick={() => { setActive(item.label); setMobileNav(false) }}><Icon /><span>{item.label}</span>{item.count && <b>{item.count}</b>}</button> })}<p className="nav-label nav-label-spaced">MANAGE</p><button className="nav-item"><CalendarDays /><span>Appointments</span></button><button className="nav-item"><ClipboardList /><span>Reports</span></button></nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings /><span>Settings</span></button><div className="user-card"><div className="avatar avatar-teal">DR</div><div><strong>Dr. Rachel Kim</strong><span>Administrator</span></div><button onClick={() => setIsLoggedIn(false)} aria-label="Sign out"><LogOut /></button></div></div>
      </aside>
      <section className="main-content">
        <header className="topbar"><button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="topbar-actions"><div className="search-box"><Search /><input placeholder="Search anything..." aria-label="Search" /></div><button className="icon-button notification" aria-label="Notifications"><Bell /><i /></button><div className="top-avatar">DR</div></div></header>
        <div className="content-inner"><div className="page-intro"><div><p className="eyebrow">MONDAY, OCTOBER 14, 2025</p><h1>Good morning, Rachel</h1><p>Here&apos;s what&apos;s happening across your clinic today.</p></div><button className="date-button"><CalendarDays /> Today <ChevronDown /></button></div>
          <div className="stat-grid"><StatCard label="Total patients" value="184" change="12.5%" icon={UserRound} accent="teal" /><StatCard label="Active employees" value="24" change="4.2%" icon={Users} accent="blue" /><StatCard label="Appointments today" value="38" change="8.1%" icon={CalendarDays} accent="purple" /><StatCard label="Low stock alerts" value="7" change="2 new" icon={Pill} accent="orange" negative /></div>
          <div className="dashboard-grid"><section className="panel appointments-panel"><div className="panel-heading"><div><h2>Today&apos;s appointments</h2><p>Upcoming visits across all departments</p></div><button className="text-button">View all <ArrowUpRight /></button></div><div className="appointment-list">{patients.slice(0, 3).map((patient) => <div className="appointment-row" key={patient.id}><div className={`avatar avatar-${patient.tone}`}>{patient.initials}</div><div className="patient-info"><strong>{patient.name}</strong><span>{patient.service} <i /> {patient.time}</span></div><span className={`status status-${patient.tone}`}>{patient.status}</span><button className="row-menu" aria-label={`More options for ${patient.name}`}>•••</button></div>)}</div></section><section className="panel activity-panel"><div className="panel-heading"><div><h2>Quick overview</h2><p>Live operational pulse</p></div><Activity className="panel-icon" /></div><div className="pulse"><div className="pulse-ring"><strong>92%</strong><span>care capacity</span></div><div className="pulse-stats"><div><span className="pulse-dot dot-green" /><div><strong>On track</strong><small>Daily operations</small></div></div><div><span className="pulse-dot dot-amber" /><div><strong>7 alerts</strong><small>Need attention</small></div></div></div></div></section></div>
          <section className="panel patients-panel"><div className="panel-heading"><div><h2>Recent patients</h2><p>Latest activity from your patient directory</p></div><button className="outline-button">View directory <ArrowUpRight /></button></div><div className="table-wrap"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Service</th><th>Status</th><th>Last visit</th><th /></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><div className="table-person"><div className={`avatar avatar-${patient.tone}`}>{patient.initials}</div><strong>{patient.name}</strong></div></td><td>{patient.id}</td><td>{patient.service}</td><td><span className={`status status-${patient.tone}`}>{patient.status}</span></td><td>{patient.time}</td><td><button className="row-menu" aria-label={`More options for ${patient.name}`}>•••</button></td></tr>)}</tbody></table></div></section>
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value, change, icon: Icon, accent, negative = false }: { label: string; value: string; change: string; icon: typeof Activity; accent: string; negative?: boolean }) { return <div className="stat-card"><div className={`stat-icon icon-${accent}`}><Icon /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={negative ? 'change-negative' : ''}>{negative ? '↑' : '↑'} {change} <em>vs last week</em></small></div></div> }


