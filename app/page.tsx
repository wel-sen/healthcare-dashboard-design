"use client";


import { DayPicker } from "@daypicker/ethiopic";
import "@daypicker/react/style.css";
import "react-day-picker/style.css";


import { useState, type ReactNode } from "react";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronUp, ChevronsUpDown } from "lucide-react";
import { Check, AlertCircle, Info } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Pill,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Employee = {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: "Working" | "Not working";
  joined_on?: string;
};
type Patient = {
  id: number;
  date: string;
  name: string;
  mrn: string;
  age: string;
  gender: string;
  diagnosis: string;
  price: string;
  remark: string;
};
type Medication = {
  id: number;
  date: string;
  name: string;
  weight: string;
  unit: "g" | "mg" | "ml" | "l";
  amount: string;
  price: string;
};
type Medicine = {
  id: number;
  name: string;
  weight: string;
  unit: "g" | "mg" | "ml" | "l";
  amount: string;
  price: string;
  type: string;   // ← new
};
type Diagnostic = {
  id: number;
  name: string;
  price: string;
  description: string;
};
type ModalType =
  "Employees" | "Patients" | "Pharmacy" | "Medicines" | "Diagnostics" | null;

const statusClass = (value: string) => {
  const v = String(value).toLowerCase();
  if (["working", "completed", "active"].includes(v)) return "status-green";
  if (["not working", "pending", "on leave"].includes(v)) return "status-amber";
  if (["inactive", "cancelled", "failed"].includes(v)) return "status-red";
  return "status-blue";
};



const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Employees", icon: Users },
  { label: "Patients", icon: UserRound },
  { label: "Pharmacy", icon: Pill },
  { label: "Services", icon: Stethoscope },
];
const diagnosisOptions = [
  "General care",
  "Cardiology",
  "Dermatology",
  "Dental examination",
  "Blood test",
  "Ultrasound",
  "X-ray",
  "Physiotherapy",
];

const seedEmployees: Employee[] = [
  {
    id: 1,
    name: "Eden Agena",
    phone: "+251 911 555 0142",
    email: "rachel.kim@edenclinic.com",
    status: "Working",
    joined_on: "2023-01-15",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    phone: "+251 922 555 0188",
    email: "marcus.j@edenclinic.com",
    status: "Working",
    joined_on: "2023-01-16",
  },
  {
    id: 3,
    name: "Nadia Williams",
    phone: "+251 933 555 0124",
    email: "nadia.w@edenclinic.com",
    status: "Not working",
    joined_on: "2023-01-19",
  },
];
const seedPatients: Patient[] = [
  {
    id: 1,
    date: "2025-10-14",
    name: "Ava Mitchell",
    mrn: "00001",
    age: "34",
    gender: "Female",
    diagnosis: "Cardiology",
    price: "180",
    remark: "Completed",
  },
  {
    id: 2,
    date: "2025-10-14",
    name: "James Rivera",
    mrn: "00002",
    age: "51",
    gender: "Male",
    diagnosis: "General care",
    price: "95",
    remark: "Pending",
  },
  {
    id: 3,
    date: "2025-10-13",
    name: "Sophia Carter",
    mrn: "00003",
    age: "28",
    gender: "Female",
    diagnosis: "Dermatology",
    price: "145",
    remark: "Completed",
  },
];
const seedMedication: Medication[] = [
  {
    id: 1,
    date: "2025-10-14",
    name: "Amoxicillin",
    weight: "500",
    unit: "mg",
    amount: "24 capsules",
    price: "18",
  },
  {
    id: 2,
    date: "2025-10-14",
    name: "Ibuprofen",
    weight: "200",
    unit: "mg",
    amount: "60 tablets",
    price: "12.50",
  },
  {
    id: 3,
    date: "2025-10-12",
    name: "Cetirizine",
    weight: "10",
    unit: "mg",
    amount: "30 tablets",
    price: "9.75",
  },
];
const seedDiagnostics: Diagnostic[] = diagnosisOptions
  .slice(0, 5)
  .map((name, index) => ({
    id: index + 1,
    name,
    price: String([95, 180, 145, 70, 40][index]),
    description: "Available Eden Medium Clinic service",
  }));
const seedMedicines = seedMedication.map(
  ({ id, name, weight, unit, amount, price }) => ({
    id,
    name,
    weight,
    unit,
    amount,
    price,
    type: "Tablet", 
  }),
);

const singularLabel = (title: string) => {
  switch (title) {
    case "Employees":
      return "Employee";
    case "Patients":
      return "Patient";
    case "Pharmacy":
      return "Record"; // "Add Record" reads better than "Add Pharmacy"
    case "Medicines":
      return "Medicine";
    case "Diagnostics":
      return "Service";
    default:
      return title;
  }
};

const money = (value: string | null | undefined) =>
  `ETB ${Number((value ?? "").replace(/[^0-9.]/g, "") || 0).toFixed(2)}`;

const dateLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const iso = value.length === 10 ? `${value}T00:00:00` : value;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("am-ET", {
    calendar: "ethiopic",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const diagnosisChips = (value: string | null | undefined) => {
  if (!value) return "—";
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} className="diagnosis-chip">
          {item}
        </span>
      ))}
    </span>
  );
};

export default function Page() {
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [active, setActive] = useState("Overview"),
    [mobileNav, setMobileNav] = useState(false),
    [employees, setEmployees] = useState(seedEmployees),
    [patients, setPatients] = useState(seedPatients),
    [medications, setMedications] = useState(seedMedication),
[medicines, setMedicines] = useState(seedMedicines as Medicine[]),
    [diagnostics, setDiagnostics] = useState(seedDiagnostics),
    [query, setQuery] = useState(""),
    [modal, setModal] = useState<ModalType>(null),
    [editing, setEditing] = useState<number | null>(null);

     

  
  const [avatarMenu, setAvatarMenu] = useState(false);
  const [servicePage, setServicePage] = useState<
    "home" | "medicines" | "diagnostics"
  >("home");

  const [deleteTarget, setDeleteTarget] = useState<{
    type: ModalType;
    id: number;
  } | null>(null);

  // Confirmation Toast Start
  const [toast, setToast] = useState<{
    message: string;
    kind: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    kind: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, kind });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  // Confirmation Toast Ended

  // Create the Supabase client once
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setIsLoggedIn(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (!avatarMenu) return;
    const close = () => setAvatarMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [avatarMenu]);

  // Auto sign-out after 20 minutes of inactivity
  useEffect(() => {
    if (!isLoggedIn) return; // only run when actually logged in

    const INACTIVITY_MS = 20 * 60 * 1000; // 20 minutes
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        alert("You were signed out due to inactivity.");
      }, INACTIVITY_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );
    resetTimer(); // start the timer immediately

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

  

  // Load data whenever the user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const load = async () => {
      const [emp, pat, med, meds, diags] = await Promise.all([
        supabase.from("employees").select("*"),
        supabase.from("patients").select("*"),
        supabase.from("medications").select("*"),
        supabase.from("medicines").select("*"),
        supabase.from("diagnostics").select("*"),
      ]);

      if (emp.data) setEmployees(emp.data as Employee[]);
      if (pat.data) setPatients(pat.data as Patient[]);
      if (med.data) setMedications(med.data as Medication[]);
if (meds.data) setMedicines(meds.data as Medicine[]);
      if (diags.data) setDiagnostics(diags.data as Diagnostic[]);
    };

    load();
  }, [isLoggedIn]);

  if (isLoggedIn === null) {
    return (
      <div
        style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
      >
        <div style={{ color: "#2563a8", fontSize: 14, fontWeight: 600 }}>
          Loading…
        </div>
      </div>
    );
  } // still checking — show nothing

  if (!isLoggedIn)
    return (
      <Login
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onLogin={handleLogin}
      />
    );

  const openAdd = (type: ModalType) => {
      setEditing(null);
      setModal(type);
    },
    openEdit = (type: ModalType, id: number) => {
      setEditing(id);
      setModal(type);
    };

  const filteredEmployees = employees.filter((item) =>
      `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()),
    ),
    filteredPatients = patients.filter((item) =>
      `${item.name} ${item.mrn} ${item.diagnosis}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    filteredMedication = medications.filter((item) =>
  (item.name ?? "").toLowerCase().includes(query.toLowerCase()),
);

  const save = async (data: Record<string, string>) => {
    let hadError = false;

    if (modal === "Employees") {
      if (editing) {
        const { error } = await supabase
          .from("employees")
          .update(data)
          .eq("id", editing);
        if (error) hadError = true;
      } else {
        const { error } = await supabase.from("employees").insert(data);
        if (error) hadError = true;
      }
      const { data: fresh } = await supabase.from("employees").select("*");
      if (fresh) setEmployees(fresh as Employee[]);
    }

    if (modal === "Patients") {
      if (editing) {
        const { error } = await supabase
          .from("patients")
          .update(data)
          .eq("id", editing);
        if (error) hadError = true;
      } else {
        const { error } = await supabase.from("patients").insert(data);
        if (error) hadError = true;
      }
      const { data: fresh } = await supabase.from("patients").select("*");
      if (fresh) setPatients(fresh as Patient[]);
    }

    if (modal === "Pharmacy") {
      if (editing) {
        const { error } = await supabase
          .from("medications")
          .update(data)
          .eq("id", editing);
        if (error) hadError = true;
      } else {
        const { error } = await supabase.from("medications").insert(data);
        if (error) hadError = true;
      }
      const { data: fresh } = await supabase.from("medications").select("*");
      if (fresh) setMedications(fresh as Medication[]);
    }

    // Medicines and Diagnostics still live only in local state for now
    if (modal === "Medicines") {
      if (editing) {
        const { error } = await supabase
          .from("medicines")
          .update(data)
          .eq("id", editing);
        if (error) {
  console.error("Medicines save error:", error);
  hadError = true;
}
      } else {
        const { error } = await supabase.from("medicines").insert(data);
        if (error) {
      console.error("Medicines save error:", error);
      hadError = true;
    }
  }
      const { data: fresh } = await supabase.from("medicines").select("*");
if (fresh) setMedicines(fresh as Medicine[]);
    }

    if (modal === "Diagnostics") {
      if (editing) {
        const { error } = await supabase
          .from("diagnostics")
          .update(data)
          .eq("id", editing);
        if (error) {
      console.error("Medicines save error:", error);
      hadError = true;
    }
      } else {
        const { error } = await supabase.from("diagnostics").insert(data);
        if (error) {
      console.error("Medicines save error:", error);
      hadError = true;
    }
  }
      const { data: fresh } = await supabase.from("diagnostics").select("*");
      if (fresh) setDiagnostics(fresh as Diagnostic[]);
    }

    setModal(null);

    if (hadError) {
      showToast("Something went wrong. Please try again.", "error");
    } else {
      showToast(
        `${editing ? "Updated" : "Added"} ${singularLabel(modal ?? "")}`,
        "success",
      );
    }
  };

  const remove = async (type: ModalType, id: number) => {
    if (type === "Employees") {
      await supabase.from("employees").delete().eq("id", id);
      setEmployees(employees.filter((i) => i.id !== id));
    }
    if (type === "Patients") {
      await supabase.from("patients").delete().eq("id", id);
      setPatients(patients.filter((i) => i.id !== id));
    }
    if (type === "Pharmacy") {
      await supabase.from("medications").delete().eq("id", id);
      setMedications(medications.filter((i) => i.id !== id));
      setMedicines(medicines.filter((i) => i.id !== id));
    }
    if (type === "Medicines") {
      await supabase.from("medicines").delete().eq("id", id);
      setMedicines(medicines.filter((i) => i.id !== id));
    }
    if (type === "Diagnostics") {
      await supabase.from("diagnostics").delete().eq("id", id);
      setDiagnostics(diagnostics.filter((i) => i.id !== id));
    }
    showToast(`Deleted ${singularLabel(type ?? "")}`, "success");
  };

  const record = (type: ModalType, id: number | null) =>
    type === "Employees"
      ? employees.find((item) => item.id === id)
      : type === "Patients"
        ? patients.find((item) => item.id === id)
        : type === "Pharmacy"
          ? medications.find((item) => item.id === id)
          : type === "Medicines"
            ? medicines.find((item) => item.id === id)
            : diagnostics.find((item) => item.id === id);
  const serviceNames = diagnostics.map((item) => item.name);
  return (
    <main className="app-shell">
      {mobileNav && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <img
              className="clinic-logo"
              src="/eden_clinic_logo.png"
              alt="Eden Clinic logo"
            />
            <span>
              Eden<span> clinic</span>
            </span>
          </div>
          <button
            className="close-nav"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="workspace">
          <div className="workspace-icon">EC</div>
          <div>
            <strong>Eden Medium Clinic</strong>
            <span>Admin workspace</span>
          </div>
          <ChevronDown />
        </div>
        <nav aria-label="Main navigation">
          <p className="nav-label">WORKSPACE</p>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "nav-active" : ""}`}
              onClick={() => {
                setActive(label);
                setMobileNav(false);
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
          <p className="nav-label nav-label-spaced">MANAGE</p>
          <button className="nav-item">
            <CalendarDays />
            <span>Appointments</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings />
            <span>Settings</span>
          </button>
          <div className="user-card">
            <div className="avatar avatar-teal">EA</div>
            <div>
              <strong>Eden Agena</strong>
              <span>Administrator</span>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setIsLoggedIn(false);
              }}
              aria-label="Sign out"
            >
              <LogOut />
            </button>
          </div>
        </div>
      </aside>
      <section className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search />
              <input
                placeholder="Search anything..."
                aria-label="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell />
              <i />
            </button>

            <div className="topbar-avatar-wrap">
              <button
                className="topbar-avatar"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarMenu((v) => !v);
                }}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={avatarMenu}
              >
                EA
              </button>

              {avatarMenu && (
                <div
                  className="avatar-menu"
                  role="menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="avatar-menu-header">
                    <div className="avatar avatar-teal">EA</div>
                    <div>
                      <strong>Eden Agena</strong>
                      <span>Administrator</span>
                    </div>
                  </div>
                  <button
                    className="avatar-menu-item"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setIsLoggedIn(false);
                    }}
                  >
                    <LogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {active === "Overview" ? (
          <Overview
            employees={employees}
            patients={patients}
            medications={medications}
            onNavigate={setActive}
          />
        ) : active === "Employees" ? (
          <CrudSection
            title="Employees"
            eyebrow="TEAM DIRECTORY"
            description="Manage the people who keep Eden Medium Clinic moving."
            icon={Users}
            columns={[
              "Joined",
              "Name",
              "Phone number",
              "Email",
              "Status",
              "Actions",
            ]}
            rows={filteredEmployees.map((item) => [
              item.joined_on,
              item.name,
              item.phone,
              item.email,
              item.status,
              item.id,
            ])}
            onAdd={() => openAdd("Employees")}
            onEdit={(id) => openEdit("Employees", id)}
            onDelete={(id) => remove("Employees", id)}
            onRequestDelete={(id) => setDeleteTarget({ type: "Employees", id })}
            searchValue={query}
            onSearchChange={setQuery}
          />
        ) : active === "Patients" ? (
          <CrudSection
            title="Patients"
            eyebrow="PATIENT DIRECTORY"
            description="Track patient visits, diagnoses, and service outcomes."
            icon={UserRound}
            columns={[
              "Date",
              "Patient name",
              "MRN",
              "Age",
              "Gender",
              "Test / Diagnosis",
              "Service price",
              "Remark",
              "Actions",
            ]}
            rows={filteredPatients.map((item) => [
              item.date,
              item.name,
              item.mrn,
              item.age,
              item.gender,
              diagnosisChips(item.diagnosis),
              money(item.price),
              item.remark,
              item.id,
            ])}
            onAdd={() => openAdd("Patients")}
            onEdit={(id) => openEdit("Patients", id)}
            onDelete={(id) => remove("Patients", id)}
            onRequestDelete={(id) => setDeleteTarget({ type: "Patients", id })}
            searchValue={query}
            onSearchChange={setQuery}
          />
        ) : active === "Pharmacy" ? (
          <CrudSection
            title="Pharmacy"
            eyebrow="MEDICATION INVENTORY"
            description="Keep medication quantities and pricing current."
            icon={Pill}
            columns={[
              "Date",
              "Medication name",
              "Weight",
              "Amount / quantity",
              "Item price",
              "Actions",
            ]}
            rows={filteredMedication.map((item) => [
              item.date,
              item.name,
              `${item.weight} ${item.unit}`,
              item.amount,
              money(item.price),
              item.id,
            ])}
            onAdd={() => openAdd("Pharmacy")}
            onEdit={(id) => openEdit("Pharmacy", id)}
            onDelete={(id) => remove("Pharmacy", id)}
            onRequestDelete={(id) => setDeleteTarget({ type: "Pharmacy", id })}
            searchValue={query}
            onSearchChange={setQuery}
          />
        ) : active === "Services" ? (
          <Services
            medicines={medicines}
            diagnostics={diagnostics}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={remove}
            onRequestDelete={(type, id) => setDeleteTarget({ type, id })}
            servicePage={servicePage}
            setServicePage={setServicePage}
          />
        ) : null}
      </section>
      {modal && (
        <RecordModal
          type={modal}
          record={record(modal, editing)}
          diagnosisOptions={[...diagnosisOptions, ...serviceNames]}
          medicationOptions={medicines.map((item) => item.name)}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setDeleteTarget(null)
          }
        >
          <section
            className="record-modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">CONFIRM DELETE</p>
                <h2 id="confirm-title">Delete this record?</h2>
              </div>
            </div>

            <p className="confirm-text">
              This action cannot be undone. The record will be permanently
              removed.
            </p>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  remove(deleteTarget.type, deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
      {toast && (
        <div
          className={`toast toast-${toast.kind}`}
          role="status"
          aria-live="polite"
        >
          <div className="toast-icon">
            {toast.kind === "success" && <Check size={14} />}
            {toast.kind === "error" && <AlertCircle size={14} />}
            {toast.kind === "info" && <Info size={14} />}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="toast-progress" />
        </div>
      )}
    </main>
  );
}

  function RecordModal({
    type,
    record,
    diagnosisOptions,
    medicationOptions,
    onClose,
    onSave,
  }: {
    type: Exclude<ModalType, null>;
    record?:
      | Employee
      | Patient
      | Medication
      | {
          id: number;
          name: string;
          weight: string;
          unit: "g" | "mg" | "ml" | "l";
          amount: string;
          price: string;
        }
      | Diagnostic;
    diagnosisOptions: string[];
    medicationOptions: string[];
    onClose: () => void;
    onSave: (data: Record<string, string>) => void;
  }) {
    const [cardMode, setCardMode] = useState<"card" | "cardless">("card");

    const valuesFromRecord = (record ?? {}) as unknown as Record<
      string,
      string
    >;
    const defaults: Record<string, string> =
      type === "Employees"
        ? {
            status: "Working",
            phone: "+251 ",
            joined_on: new Date().toISOString().slice(0, 10),
          }
        : type === "Patients"
          ? {
              date: new Date().toISOString().slice(0, 10),
              gender: "Female",
              diagnosis: diagnosisOptions[0],
              remark: "Pending",
              price: "0",
            }
          : type === "Pharmacy"
            ? {
                date: new Date().toISOString().slice(0, 10),
                unit: "mg",
                price: "0",
              }
            : type === "Medicines"
              ? { unit: "mg", price: "0", type: "Tablet" }
              : { price: "0" };
            

    const [values, setValues] = useState<Record<string, string>>({
      ...defaults,
      ...valuesFromRecord,
    });

    const diagnoses = (values.diagnosis ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const setDiagnoses = (list: string[]) => {
      update("diagnosis", list.join(", "));
    };

    const addDiagnosis = () => {
      setDiagnoses([...diagnoses, diagnosisOptions[0]]);
    };

    const updateDiagnosis = (index: number, value: string) => {
      const next = [...diagnoses];
      next[index] = value;
      setDiagnoses(next);
    };

    const removeDiagnosis = (index: number) => {
      setDiagnoses(diagnoses.filter((_, i) => i !== index));
    };

    const update = (name: string, value: string) =>
      setValues({ ...values, [name]: value });

   const field = (
  name: string,
  label: string,
  kind: "text" | "date" | "number" = "text",
  options?: string[],
  optional?: boolean,
) => (
  <label className={`modal-field ${kind === "date" ? "modal-field-full" : ""}`} key={name}>
    {label}
    {optional && <span className="optional-hint"> (optional)</span>}

    {name === "phone" ? (
      <span className="phone-input">
        <b>+251</b>
        <input
          required
          type="tel"
          inputMode="tel"
          placeholder="9xx xxx xxxx"
          value={(values[name] ?? "").replace(/^\+251\s*/, "")}
          onChange={(e) => {
            const digits = e.target.value
              .replace(/^\+251\s*/, "")
              .replace(/\D/g, "")
              .slice(0, 10);
            update(name, `+251 ${digits}`);
          }}
        />
      </span>
    ) : kind === "date" ? (
      <DayPicker
        mode="single"
        numerals="latn"
         selected={values[name] ? new Date(values[name]) : undefined}
        onSelect={(date) => {
          const iso = date
  ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  : "";
   update(name, iso);
        }}
      />
    ) : options ? (
      <select
        required={!optional}
        value={values[name] ?? options[0]}
        onChange={(e) => update(name, e.target.value)}
      >
        {options.map((option, index) => (
          <option key={`${option}-${index}`}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        required={!optional}
        type={kind}
        value={values[name] ?? ""}
        onChange={(e) => update(name, e.target.value)}
      />
    )}
  </label>
);

    const remarkField = (value: string, onChange: (v: string) => void) => (
      <label className="modal-field modal-field-full" key="remark">
        Remark
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add any notes about this visit…"
        />
      </label>
    );

    const fields =
      type === "Employees"
        ? [
            field("name", "Name"),
            field("phone", "Phone number"),
            field("email", "Email"),
            field("status", "Status", "text", ["Working", "Not working"]),
            field("joined_on", "Joined date", "date"),
          ]
        : type === "Patients"
          ? cardMode === "card"
            ? [
                field("date", "Date", "date"),
                field("name", "Patient name"),
                field("mrn", "MRN"),
                field("age", "Patient age", "number"),
                field("gender", "Gender", "text", ["Female", "Male", "Other"]),
                <label className="modal-field modal-field-full" key="diagnosis">
  Test / Diagnosis name
  <div className="diagnosis-list">
    {diagnoses.length === 0 ? (
      <button
        type="button"
        className="secondary-button"
        onClick={() => setDiagnoses([diagnosisOptions[0]])}
      >
        + Add diagnosis
      </button>
    ) : (
      diagnoses.map((value, index) => (
        <div className="diagnosis-row" key={index}>
          <select
            required
            value={value}
            onChange={(e) => updateDiagnosis(index, e.target.value)}
          >
            {diagnosisOptions.map((option, i) => (
              <option key={`${option}-${i}`}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            className="diagnosis-remove"
            onClick={() => removeDiagnosis(index)}
            aria-label="Remove diagnosis"
          >
            −
          </button>
        </div>
      ))
    )}
    {diagnoses.length > 0 && (
      <button
        type="button"
        className="diagnosis-add"
        onClick={addDiagnosis}
        aria-label="Add another diagnosis"
      >
        +
      </button>
    )}
  </div>
</label>,
                field("price", "Service price (ETB)", "number"),
                remarkField(values.remark ?? "", (value) =>
                  update("remark", value),
                ),
              ]
            : [
                // Cardless — only Gender and Diagnosis required
                field("date", "Date", "date", undefined, true),
                field("name", "Patient name", "text", undefined, true),
                field("mrn", "MRN", "text", undefined, true),
                field("age", "Patient age", "number", undefined, true),
                field("gender", "Gender", "text", ["Female", "Male", "Other"]), // required
                <label className="modal-field" key="diagnosis">
  Test / Diagnosis name
  <div className="diagnosis-list">
    {diagnoses.length === 0 ? (
      <button
        type="button"
        className="secondary-button"
        onClick={() => setDiagnoses([diagnosisOptions[0]])}
      >
        + Add diagnosis
      </button>
    ) : (
      diagnoses.map((value, index) => (
        <div className="diagnosis-row" key={index}>
          <select
            required
            value={value}
            onChange={(e) => updateDiagnosis(index, e.target.value)}
          >
            {diagnosisOptions.map((option, i) => (
              <option key={`${option}-${i}`}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            className="diagnosis-remove"
            onClick={() => removeDiagnosis(index)}
            aria-label="Remove diagnosis"
          >
            −
          </button>
        </div>
      ))
    )}
    {diagnoses.length > 0 && (
      <button
        type="button"
        className="diagnosis-add"
        onClick={addDiagnosis}
        aria-label="Add another diagnosis"
      >
        +
      </button>
    )}
  </div>
</label>,
                field(
                  "price",
                  "Service price (ETB)",
                  "number",
                  undefined,
                  true,
                ),

                remarkField(values.remark ?? "", (value) =>
                  update("remark", value),
                ),
              ]
          : type === "Pharmacy"
            ? [
                field("date", "Date", "date"),
                field(
                  "name",
                  "Medication name",
                  "text",
                  medicationOptions.length
                    ? medicationOptions
                    : ["Register a medicine first"],
                ),
                field("weight", "Weight", "number"),
                field("unit", "Unit", "text", ["mg", "g", "ml", "l"]),
                field("amount", "Amount / quantity"),
                field("price", "Item price (ETB)", "number"),
              ]
            : type === "Medicines"
              ? [
                  field("name", "Medication name"),
                  field("type", "Type", "text", [
        "Tablet",
        "Capsule",
        "Strip",
        "Injection",
        "Cream",
        "Drops",
        "Syrup",
        "Other",
      ]),
                  field("weight", "Weight", "number"),
                  field("unit", "Unit", "text", ["mg", "g", "ml", "l"]),
                  field("amount", "Amount / quantity"),
                  field("price", "Item price (ETB)", "number"),
                ]
              : [
                  field("name", "Test / Diagnosis name"),
                  field("price", "Service price (ETB)", "number"),
                  field("description", "Description"),
                ];
    return (
      <div
        className="modal-backdrop"
        role="presentation"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <section
          className="record-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-header">
            <div>
              <p className="eyebrow">{record ? "EDIT RECORD" : "NEW RECORD"}</p>
              <h2 id="modal-title">
                {record ? "Edit" : "Add"} {singularLabel(type).toLowerCase()}
              </h2>
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave(values);
            }}
          >
            {type === "Patients" && (
              <div className="modal-tabs">
                <button
                  type="button"
                  className={`modal-tab ${cardMode === "card" ? "modal-tab-active" : ""}`}
                  onClick={() => setCardMode("card")}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={`modal-tab ${cardMode === "cardless" ? "modal-tab-active" : ""}`}
                  onClick={() => setCardMode("cardless")}
                >
                  Cardless
                </button>
              </div>
            )}

            <div className="modal-fields">{fields}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save record <ArrowUpRight />
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  function Services({
    medicines,
    diagnostics,
    onAdd,
    onEdit,
    onDelete,
    onRequestDelete,
    servicePage,
    setServicePage,
  }: {
      
    medicines: Medicine[];
    diagnostics: Diagnostic[];

    onAdd: (type: ModalType) => void;
    onEdit: (type: ModalType, id: number) => void;
    onDelete: (type: ModalType, id: number) => void;
    onRequestDelete: (type: ModalType, id: number) => void;
    servicePage: "home" | "medicines" | "diagnostics";
    setServicePage: (page: "home" | "medicines" | "diagnostics") => void;
  }) {
    // Home: two CTAs
    if (servicePage === "home") {
      return (
        <div className="content-inner services-page">
          <div className="page-intro">
            <div>
              <p className="eyebrow">SERVICE CATALOG</p>
              <h1>Services</h1>
              <p>
                Register medicines and tests once, then reuse them across your
                clinical workflows.
              </p>
            </div>
          </div>
          <div className="service-tabs">
            <button
              className="service-tab"
              onClick={() => setServicePage("medicines")}
            >
              <Pill />
              <span>
                <strong>Medicines</strong>
                <small>{medicines.length} registered</small>
              </span>
            </button>
            <button
              className="service-tab"
              onClick={() => setServicePage("diagnostics")}
            >
              <Stethoscope />
              <span>
                <strong>Test / Diagnostics</strong>
                <small>{diagnostics.length} registered</small>
              </span>
            </button>
          </div>
        </div>
      );
    }

    // Medicines page
    if (servicePage === "medicines") {
      return (
        <div className="content-inner services-page">
          <div className="subpage-header">
            <button
              className="back-button"
              onClick={() => setServicePage("home")}
            >
              ← Back to Services
            </button>
          </div>
          <ServiceRegistry
            title="Medicines"
            description="Register medication names, weights, quantities, and prices."
            icon={Pill}
            columns={["Name", "Type", "Weight", "Amount / quantity", "Price"]}
            rows={medicines.map((item) => [
              item.name,
              item.type,
              `${item.weight} ${item.unit}`,
              item.amount,
              money(item.price),
              item.id,
            ])}
            onAdd={() => onAdd("Medicines")}
            onEdit={(id) => onEdit("Medicines", id)}
            onDelete={(id) => onDelete("Medicines", id)}
            onRequestDelete={(id) => onRequestDelete("Medicines", id)}
          />
        </div>
      );
    }

    // Diagnostics page
    return (
      <div className="content-inner services-page">
        <div className="subpage-header">
          <button
            className="back-button"
            onClick={() => setServicePage("home")}
          >
            ← Back to Services
          </button>
        </div>
        <ServiceRegistry
          title="Test / Diagnostics"
          description="Register diagnosis and test services for patient visits."
          icon={Stethoscope}
          columns={["Name", "Price", "Description"]}
          rows={diagnostics.map((item) => [
            item.name,
            money(item.price),
            item.description,
            item.id,
          ])}
          onAdd={() => onAdd("Diagnostics")}
          onEdit={(id) => onEdit("Diagnostics", id)}
          onDelete={(id) => onDelete("Diagnostics", id)}
          onRequestDelete={(id) => onRequestDelete("Diagnostics", id)}
        />
      </div>
    );
  }

  function ServiceRegistry({
    title,
    description,
    icon: Icon,
    columns,
    rows,
    onAdd,
    onEdit,
    onDelete,
    onRequestDelete,
  }: {
    title: string;
    description: string;
    icon: typeof Activity;
    columns: string[];
    rows: (string | number | ReactNode)[][];
    onAdd: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onRequestDelete?: (id: number) => void;
  }) {
    const [sortCol, setSortCol] = useState<number | null>(0);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const looksLikeNumber = (v: string | number) => {
      const s = String(v).replace(/[^0-9.\-]/g, "");
      return s !== "" && !isNaN(Number(s));
    };

    const sortedRows =
      sortCol === null
        ? rows
        : [...rows].sort((a, b) => {
          const avRaw = a[sortCol];
    const bvRaw = b[sortCol];
            

             const av =
          typeof avRaw === "string" || typeof avRaw === "number"
            ? avRaw
            : String(avRaw ?? "");
        const bv =
          typeof bvRaw === "string" || typeof bvRaw === "number"
            ? bvRaw
            : String(bvRaw ?? "");


            let cmp = 0;

            if (looksLikeNumber(av) && looksLikeNumber(bv)) {
              const an = Number(String(av).replace(/[^0-9.\-]/g, ""));
              const bn = Number(String(bv).replace(/[^0-9.\-]/g, ""));
              cmp = an - bn;
            } else {
              cmp = String(av).localeCompare(String(bv), undefined, {
                numeric: true,
              });
            }

            return sortDir === "asc" ? cmp : -cmp;
          });

    const handleSort = (index: number) => {
      if (sortCol === index) {
        setSortDir(sortDir === "asc" ? "desc" : "asc");
      } else {
        setSortCol(index);
        setSortDir("asc");
      }
    };

    return (
      <section className="panel service-card">
        <div className="panel-heading">
          <div>
            <div className="management-icon">
              <Icon />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="primary-button compact" onClick={onAdd}>
            <Plus /> Add
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column, index) => {
                  const isActive = sortCol === index;
                  return (
                    <th
                      key={column}
                      onClick={() => handleSort(index)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                      aria-sort={
                        isActive
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {column}
                        {isActive ? (
                          sortDir === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )
                        ) : (
                          <ChevronsUpDown size={12} style={{ opacity: 0.35 }} />
                        )}
                      </span>
                    </th>
                  );
                })}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, index) => {
                const id = Number(row[row.length - 1]);
                return (
                  <tr key={id}>
                    {row.slice(0, -1).map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                    <td>
                      <div className="table-actions">
                        <button
                          aria-label={`Edit ${title} ${index + 1}`}
                          onClick={() => onEdit(id)}
                        >
                          <Pencil />
                        </button>
                        <button
                          aria-label={`Delete ${title} ${index + 1}`}
                          onClick={() =>
                            onRequestDelete ? onRequestDelete(id) : onDelete(id)
                          }
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function Login({
    email,
    password,
    setEmail,
    setPassword,
    onLogin,
  }: {
    email: string;
    password: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    onLogin: () => void;
  }) {
    return (
      <main className="login-shell">
        <section className="login-visual" aria-label="Eden Clinic introduction">
          <div className="brand brand-light">
            <img
              className="clinic-logo"
              src="/eden_clinic_logo.png"
              alt="Eden Clinic logo"
            />
            <span>Eden Medium Clinic</span>
          </div>
          <div className="visual-copy">
            <p className="eyebrow">HEALTHCARE OPERATIONS, SIMPLIFIED</p>
            <h1>
              Care that moves
              <br />
              <em>forward.</em>
            </h1>
            <p className="visual-description">
              One connected workspace for the people, patients, and services
              that keep Eden Medium Clinic running.
            </p>
          </div>
          <div className="visual-footer">
            <ShieldCheck />
            <span>Private, secure, and built for modern care teams.</span>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-form-wrap">
            <div className="mobile-brand brand">
              <span className="brand-mark">
                <Activity />
              </span>
              <span>
                eden<span>clinic</span>
              </span>
            </div>
            <div className="login-heading">
              <p className="eyebrow">ADMIN PORTAL</p>
              <h2>Welcome back</h2>
              <p>Sign in to access your Eden Medium Clinic dashboard.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onLogin();
              }}
              className="login-form"
            >
              <label htmlFor="email">
                Work email
                <input
                  id="email"
                  type="email"
                  placeholder="you@edenclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="primary-button" type="submit">
                Sign in <ArrowUpRight />
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  function CrudSection({
    title,
    eyebrow,
    description,
    icon: Icon,
    columns,
    rows,
    onAdd,
    onEdit,
    onDelete,
    onRequestDelete,
    searchValue, // New
    onSearchChange, // New
  }: {
    title: string;
    eyebrow: string;
    description: string;
    icon: typeof Activity;
    columns: string[];
    rows: (string | number | ReactNode)[][];
    onAdd: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onRequestDelete?: (id: number) => void;
    searchValue?: string; // New
    onSearchChange?: (value: string) => void; // New
  }) {
    const [sortCol, setSortCol] = useState<number | null>(0); //New
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc"); //New

    const displayCell = (cell: string | number | ReactNode, index: number) => {
      if (title === "Pharmacy" && index === 0) return dateLabel(String(cell));
      if (title === "Patients" && index === 0) return dateLabel(String(cell));
      if (title === "Employees" && index === 0) return dateLabel(String(cell));
      return cell;
    };

    // Determine if a cell looks like a date
    const looksLikeDate = (v: string | number) => {
      const s = String(v);
      // ISO: 2025-10-14   |   Slash: 10/14/2025   |   Formatted: Oct 14, 2025   |   With dash: — (skip)
      if (s === "—") return false;
      return (
        /^\d{4}-\d{2}-\d{2}/.test(s) ||
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s) ||
        /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(s)
      );
    };

    // Determine if a cell is numeric
    const looksLikeNumber = (v: string | number) => {
      const s = String(v).replace(/[^0-9.\-]/g, "");
      return s !== "" && !isNaN(Number(s));
    };

    // Sort the rows
    const sortedRows =
      sortCol === null
        ? rows
        : [...rows].sort((a, b) => {
            const avRaw = a[sortCol];
    const bvRaw = b[sortCol];

             const av =
          typeof avRaw === "string" || typeof avRaw === "number"
            ? avRaw
            : String(avRaw ?? "");
        const bv =
          typeof bvRaw === "string" || typeof bvRaw === "number"
            ? bvRaw
            : String(bvRaw ?? "");

            

            let cmp = 0;

            if (looksLikeDate(av) && looksLikeDate(bv)) {
              const ad = new Date(String(av)).getTime();
              const bd = new Date(String(bv)).getTime();
              cmp = ad - bd;
            } else if (looksLikeNumber(av) && looksLikeNumber(bv)) {
              const an = Number(String(av).replace(/[^0-9.\-]/g, ""));
              const bn = Number(String(bv).replace(/[^0-9.\-]/g, ""));
              cmp = an - bn;
            } else {
              cmp = String(av).localeCompare(String(bv), undefined, {
                numeric: true,
              });
            }

            return sortDir === "asc" ? cmp : -cmp;
          });

    // Toggle sort when a header is clicked
    const handleSort = (index: number) => {
      if (sortCol === index) {
        setSortDir(sortDir === "asc" ? "desc" : "asc");
      } else {
        setSortCol(index);
        setSortDir("asc");
      }
    };

    return (
      <div className="content-inner">
        <div className="page-intro">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="page-intro-actions">
            {onSearchChange && (
              <input
                type="search"
                placeholder={`Search ${title.toLowerCase()}…`}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="table-search"
              />
            )}
            <button className="primary-button compact" onClick={onAdd}>
              <Plus /> Add {singularLabel(title)}
            </button>
          </div>
        </div>
        <section className="panel patients-panel management-panel">
          <div className="panel-heading">
            <div>
              <h2>{title} list</h2>
              <p>Create, edit, and remove records from this directory.</p>
            </div>
            <div className="management-icon">
              <Icon />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column, index) => {
                    const isActions = column === "Actions";
                    const isActive = sortCol === index;
                    return (
                      <th
                        key={column}
                        onClick={
                          isActions ? undefined : () => handleSort(index)
                        }
                        style={{
                          cursor: isActions ? "default" : "pointer",
                          userSelect: "none",
                        }}
                        aria-sort={
                          isActive
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {column}
                          {!isActions &&
                            (isActive ? (
                              sortDir === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )
                            ) : (
                              <ChevronsUpDown
                                size={12}
                                style={{ opacity: 0.35 }}
                              />
                            ))}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#94a3b8",
                        fontSize: 12,
                      }}
                    >
                      {searchValue
                        ? `No results for "${searchValue}"`
                        : "No records yet"}
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => {
                    const id = Number(row[row.length - 1]);
                    return (
                      <tr key={id}>
                        {row.slice(0, -1).map((cell, index) => {
                          const isStatusColumn =
                            (title === "Employees" && index === 4) ||
                            (title === "Patients" && index === 7);
                          return (
                            <td key={`${id}-${index}`}>
                              {isStatusColumn ? (
                                <span
                                  className={`status ${statusClass(String(cell))}`}
                                >
                                  {cell}
                                </span>
                              ) : (title === "Patients" && index === 1) ||
                                (title === "Employees" && index === 1) ? (
                                <strong className="table-name">
                                  {displayCell(cell, index)}
                                </strong>
                              ) : (
                                displayCell(cell, index)
                              )}
                            </td>
                          );
                        })}

                        <td>
                          <div className="table-actions">
                            <button
                              aria-label={`Edit ${title} ${id}`}
                              onClick={() => onEdit(id)}
                            >
                              <Pencil />
                            </button>
                            <button
                              aria-label={`Delete ${title} ${id}`}
                              onClick={() =>
                                onRequestDelete
                                  ? onRequestDelete(id)
                                  : onDelete(id)
                              }
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }
  function Overview({
    employees,
    patients,
    medications,
    onNavigate,
  }: {

    
    employees: Employee[];
    patients: Patient[];
    medications: Medication[];
    onNavigate: (value: string) => void;
  }) {

    
    const workingEmployees = employees.filter(
      (item) => item.status === "Working",
    );

    const [date, setDate] = useState<Date | undefined>(new Date());

   

    return (
      <div className="content-inner">
        <div className="page-intro">
          <div>
           <p className="eyebrow">
  {new Date().toLocaleDateString("am-ET", {
    calendar: "ethiopic",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })}
</p>
            <h1>
              {new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 18
                  ? "Good afternoon"
                  : "Good evening"}
              , Eden
            </h1>
            <p>
              Here&apos;s what&apos;s happening across Eden Medium Clinic today.
            </p>
          </div>
          <button className="date-button">
            <CalendarDays /> Today <ChevronDown />
          </button>
        </div>
        <div className="stat-grid">
          <StatCard
            label="Total patients"
            value={String(patients.length)}
            icon={UserRound}
            accent="teal"
          />
          <StatCard
            label="Active employees"
            value={String(workingEmployees.length)}
            icon={Users}
            accent="blue"
          />
          <StatCard
            label="Pharmacy items"
            value={String(medications.length)}
            icon={Pill}
            accent="purple"
          />
          <StatCard
            label="Services"
            value={String(
              new Set(patients.map((patient) => patient.diagnosis)).size,
            )}
            icon={Stethoscope}
            accent="orange"
          />
        </div>
        <div className="dashboard-grid">
          <section className="panel appointments-panel">
            <div className="panel-heading">
              <div>
                <h2>Employees on duty</h2>
                <p>Team members currently working at Eden Medium Clinic</p>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("Employees")}
              >
                View employees <ArrowUpRight />
              </button>
            </div>
            <div className="appointment-list">
              {workingEmployees.map((employee) => (
                <div className="appointment-row" key={employee.id}>
                  <div className="avatar avatar-blue">
                    {employee.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="patient-info">
                    <strong>{employee.name}</strong>
                    <span>{employee.email}</span>
                  </div>
                  <span className="status status-green">Working</span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel appointments-panel">
            <div className="panel-heading">
              <div>
                <h2>Pharmacy inventory</h2>
                <p>Latest medication records and quantities</p>
              </div>
              <button
                className="text-button"
                onClick={() => onNavigate("Pharmacy")}
              >
                View pharmacy <ArrowUpRight />
              </button>
            </div>
            <div className="appointment-list">
              {medications.slice(0, 3).map((medication) => (
                <div className="appointment-row" key={medication.id}>
                  <div className="avatar avatar-purple">
                    <Pill />
                  </div>
                  <div className="patient-info">
                    <strong>{medication.name}</strong>
                    <span>
                      {medication.weight} {medication.unit} ·{" "}
                      {medication.amount}
                    </span>
                  </div>
                  <strong className="inventory-price">
                    {money(medication.price)}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );

    

  }
  function StatCard({
    label,
    value,
    icon: Icon,
    accent,
  }: {
    label: string;
    value: string;
    icon: typeof Activity;
    accent: string;
  }) {
    return (
      <div className="stat-card">
        <div className={`stat-icon icon-${accent}`}>
          <Icon />
        </div>
        <div className="stat-copy">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      </div>
    );
    
  }
  
