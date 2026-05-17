"use client";

import { motion, useInView } from "framer-motion";
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  MonitorSmartphone,
  Wallet,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Trophy,
  FolderKanban,
  Globe,
  Crown,
  UserCog,
  Briefcase,
  DollarSign,
  CreditCard,
  Smile,
  Stethoscope,
  Building,
  Star,
  CheckCircle,
  Loader2,
  Linkedin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Helpers ---
const scrollToContact = () => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
};

// --- Animated Counter ---
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// --- Data ---
const stats = [
  { numericValue: 60, suffix: "+", label: "Institutions" },
  { numericValue: 96, suffix: "K+", label: "Active Students" },
  { numericValue: 98, suffix: "%", label: "Satisfaction Rate" },
  { numericValue: 100, suffix: "%", label: "Data Security" },
];

const modules = [
  { icon: BookOpen, title: "Academics", desc: "Course planning, timetables, attendance automation, and grading workflows." },
  { icon: Wallet, title: "Finance", desc: "Fee collection, payroll processing, budgeting, and audit-ready reporting." },
  { icon: Users, title: "HR & Payroll", desc: "Staff lifecycle management, recruitment, performance, and compliance." },
  { icon: GraduationCap, title: "Placements", desc: "Campus drives, interview scheduling, company management, and alumni tracking." },
  { icon: Building2, title: "Hostel", desc: "Room allocation, warden management, mess billing, and facility tracking." },
  { icon: HeartPulse, title: "Wellbeing", desc: "Student counseling sessions, mental health tracking, and escalation management." },
  { icon: Trophy, title: "Clubs Management", desc: "Club creation, memberships, events, achievements, and participation certificates." },
  { icon: FolderKanban, title: "Projects Management", desc: "Final year projects, team formation, mentor assignments, milestones, and innovation showcase." },
];

const portals = [
  { icon: Globe, title: "Super Admin", desc: "Full system control, multi-college management, global analytics, subscriptions, and system-wide monitoring.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { icon: Crown, title: "College Admin", desc: "College-level management, academic structure, departments, sections, faculty and student control.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { icon: Building, title: "Admin Portal", desc: "Daily operations, notifications, announcements, and campus-wide administration.", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: BookOpen, title: "Faculty Portal", desc: "Attendance, assignments, marks, club coordination, project mentoring, and student performance tracking.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { icon: GraduationCap, title: "Student Portal", desc: "Academics, assignments, clubs participation, project submissions, attendance, and notifications.", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  { icon: Users, title: "Parent Portal", desc: "Child performance monitoring, attendance tracking, fee status, and real-time notifications.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  { icon: UserCog, title: "HR Portal", desc: "Employee management, recruitment pipelines, payroll processing, and leave management.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { icon: DollarSign, title: "Finance Manager", desc: "Financial analytics, budget monitoring, fee collection reports, and revenue dashboards.", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { icon: CreditCard, title: "Finance Executive", desc: "Student fee management, payment collection, invoice generation, and transaction management.", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  { icon: Smile, title: "Wellbeing Manager", desc: "Student wellbeing analytics, counseling management, escalation handling, and program oversight.", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  { icon: Stethoscope, title: "Wellbeing Executive", desc: "Individual counseling sessions, student interactions, case management, and follow-up tracking.", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { icon: Briefcase, title: "Placement Portal", desc: "Company management, placement drives, interview scheduling, resume tracking, and eligibility filters.", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
];

const testimonials = [
  {
    name: "Dr. Ramesh Nair",
    role: "Principal",
    institution: "St. Xavier's College of Engineering",
    quote: "TEKTON CAMPUS transformed our administrative processes completely. What used to take days now happens in minutes. The Finance and HR modules especially are a game changer for our institution.",
    rating: 5,
  },
  {
    name: "Prof. Anitha Krishnan",
    role: "Dean of Academics",
    institution: "Lakshmi Narayana Institute of Technology",
    quote: "The student portal and faculty dashboards are incredibly intuitive. Our faculty adoption rate was near 100% within the first week. The placement module helped us hit record placement numbers this year.",
    rating: 5,
  },
  {
    name: "Mr. Srinivas Rao",
    role: "Director of Administration",
    institution: "Deccan College of Engineering",
    quote: "Managing hostel, clubs, and student wellbeing from a single platform is exactly what we needed. The role-based portals give each stakeholder precisely the view they need — nothing more, nothing less.",
    rating: 5,
  },
];

const chartData = [
  { name: "Jan", value: 850 },
  { name: "Feb", value: 720 },
  { name: "Mar", value: 910 },
  { name: "Apr", value: 680 },
  { name: "May", value: 980 },
  { name: "Jun", value: 820 },
];

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50 py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/Tt_logo.png" alt="TEKTON CAMPUS" className="h-9 w-9 object-contain" />
          <a href="#"><span className="text-xl font-bold tracking-tight text-white">
            TEKTON<span className="text-primary">CAMPUS</span>
          </span></a>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Modules</a>
          <a href="#portals" className="hover:text-primary transition-colors">Portals</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>

        <div className="hidden md:hidden lg:flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="bg-[#00d2ff]/10 border border-[#00d2ff]/60 text-[#00d2ff] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#00d2ff]/20 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(0,210,255,0.4)] flex items-center gap-2 cursor-pointer"
            style={{
              filter: "drop-shadow(0px 0px 5px rgba(0, 210, 255, 0.5))"
            }}
          >
            Log In
          </button>
          <button
            data-testid="button-request-demo-nav"
            onClick={scrollToContact}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover-glow flex items-center gap-2 cursor-pointer"
          >
            Request Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button className="md:block lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-4 md:flex md:flex-col">
          <a href="#features" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Modules</a>
          <a href="#portals" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Portals</a>
          <a href="#testimonials" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
          <a href="#contact" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <div className="h-px bg-border my-2" />
          <div className="grid grid-cols-2">
            <button
              onClick={handleLogin}
              className="bg-[#00d2ff]/10 w-fit border border-[#00d2ff]/60 text-[#00d2ff] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#00d2ff]/20 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(0,210,255,0.4)] flex items-center gap-2 cursor-pointer"
              style={{
                filter: "drop-shadow(0px 0px 5px rgba(0, 210, 255, 0.5))"
              }}
            >
              Log In
            </button>
            <button
              onClick={() => { scrollToContact(); setMobileMenuOpen(false); }}
              className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold w-full"
            >
              Request Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-[100dvh] pt-32 pb-20 flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Enterprise Campus Management OS
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight text-white">
            Transform Your Campus with <span className="text-gradient">TEKTON CAMPUS ERP</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
            An enterprise-grade digital campus management platform designed to streamline academics, finance, HR, placements, wellbeing, and administration through one intelligent ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToContact}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover-glow flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Request Demo <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full font-semibold text-lg border border-border bg-background/50 hover:bg-white/5 flex items-center justify-center gap-2 transition-all text-white cursor-pointer"
            >
              Explore Platform
            </button>
          </div>
        </motion.div>

        {/* Right Content - Visual Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[600px] w-full hidden lg:block"
        >
          {/* Main Revenue Card (Lower Layer) */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-10 right-0 w-[520px] glass-panel rounded-[32px] p-8 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white text-xl">Revenue Overview</h3>
              <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-muted-foreground font-medium">
                {new Date().getFullYear()}
              </div>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#00d2ff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00d2ff"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCyan)"
                    style={{ filter: "drop-shadow(0px 0px 8px rgba(0, 210, 255, 0.4))" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#00d2ff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Collections</p>
                <p className="text-2xl font-black text-white">₹4.2M</p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">+12% vs last month</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Pending Fees</p>
                <p className="text-2xl font-black text-white">₹850K</p>
                <p className="text-xs text-red-400 mt-2 font-medium">-5% vs last month</p>
              </div>
            </div>
          </motion.div>

          {/* Attendance Sync Card (Top Layer) */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 -left-10 w-[340px] glass-panel rounded-[32px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center border border-white/10">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Attendance Sync</h4>
                <p className="text-xs text-muted-foreground">Real-time update</p>
              </div>
            </div>

            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 bg-white/10 rounded-full" />
                      <div className="h-1.5 w-16 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="h-6 w-12 bg-emerald-500/20 rounded-lg border border-emerald-500/30" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

function StatCounter({ numericValue, suffix, label }: { numericValue: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(numericValue);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h2 className="text-4xl md:text-5xl font-black text-white mb-2 text-gradient">
        <span ref={ref}>{count}</span>{suffix}
      </h2>
      <p className="text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

const Stats = () => {
  return (
    <section className="py-20 border-y border-border/50 bg-card/30 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatCounter key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Modules = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Complete Institutional OS</h2>
          <p className="text-lg text-muted-foreground">Every process, every department, every stakeholder connected in one unified ecosystem.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-8 rounded-2xl hover:-translate-y-2 hover-glow group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <mod.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{mod.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portals = () => {
  return (
    <section id="portals" className="py-32 bg-card/30 border-y border-border/50 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/50 bg-purple-500/20 text-purple-400 text-sm font-bold mb-6 cursor-default transition-all duration-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]"
              style={{
                filter: "drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))",
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                borderColor: "rgba(168, 85, 247, 0.6)"
              }}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              12 Role-Based Portals
            </motion.span>

            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
              One Platform, <span className="text-gradient">Every Stakeholder</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Intelligent access control delivers a personalized, secure experience for every role — from College Admin to Student. Everyone sees exactly what they need.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {portals.map((portal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-[28px] bg-[#0f172a]/40 border border-white/5 backdrop-blur-md transition-all duration-300 cursor-pointer group hover:bg-[#0f172a]/60 hover:border-primary/20"
            >
              <div className={`w-12 h-12 rounded-2xl ${portal.bg} border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                <portal.icon className={`w-6 h-6 ${portal.color}`} />
              </div>
              <h4 className="font-bold text-white mb-2 text-base">{portal.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {portal.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-panel rounded-[32px] p-8 md:p-14 text-center max-w-4xl mx-auto border border-white/5 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <MonitorSmartphone className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Secure Multi-Tenant Architecture</h3>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">Every role operates in an isolated, permission-scoped environment. SOC2 compliant data isolation ensures zero cross-tenant leakage.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Role-Based Access Control", "Data Encryption", "Audit Logging", "Multi-College Support"].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.4 }}
              whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00d2ff]/60 bg-[#00d2ff]/10 text-[#00d2ff] text-sm font-bold mb-6 cursor-default transition-all duration-300 shadow-[0_0_15px_-3px_rgba(0,210,255,0.4)]"
              style={{
                filter: "drop-shadow(0px 0px 5px rgba(0, 210, 255, 0.5))"
              }}
            >
              <Star className="w-4 h-4 fill-[#00d2ff]" />
              Trusted by Institutions
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">What Leaders Are Saying</h2>
            <p className="text-lg text-muted-foreground">Real results from real administrators who made the switch to TEKTON CAMPUS.</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              data-testid={`card-testimonial-${i}`}
              className="glass-panel p-8 rounded-2xl hover-glow cursor-default group"
            >
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 italic">"{t.quote}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", institution: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.institution || !form.email) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you! We'll reach out within 24 hours to schedule your personalized demo.");
        setForm({ firstName: "", lastName: "", institution: "", email: "" });
      } else {
        throw new Error("Server error");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again or email us at business@gkeliteinfo.com");
    }
  };

  return (
    <section id="contact" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="glass-panel rounded-3xl p-8 md:p-16 max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-16 relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to elevate your institution?</h2>
              <p className="text-lg text-muted-foreground mb-10">
                Schedule a personalized demo and see how TEKTON CAMPUS can transform your operations.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Headquarters</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Opp: Pillar No. 1432, 6-3-853/1, 306 B, 3rd Floor Meridian Plaza,<br />
                      Ameerpet, Hyderabad, Telangana - 500016
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Phone</h4>
                    <p className="text-muted-foreground text-sm">+91 9000266832, +91 7093256562</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Email</h4>
                    <p className="text-muted-foreground text-sm">business@gkeliteinfo.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-6 md:p-8 border border-border">
              <h3 className="text-xl font-bold text-white mb-6">Request Demo</h3>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-10 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Request Sent!</h4>
                  <p className="text-sm text-muted-foreground">{message}</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-primary text-sm underline-offset-4 hover:underline"
                  >
                    Submit another request
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <input
                        data-testid="input-first-name"
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <input
                        data-testid="input-last-name"
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Institution Name</label>
                    <input
                      data-testid="input-institution"
                      type="text"
                      value={form.institution}
                      onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Work Email</label>
                    <input
                      data-testid="input-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  {status === "error" && (
                    <p className="text-sm text-destructive">{message}</p>
                  )}
                  <button
                    data-testid="button-submit-demo"
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-lg font-semibold mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : "Submit Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/Tt_logo.png" alt="TEKTON CAMPUS" className="h-9 w-9 object-contain" />
              <span className="text-2xl font-bold tracking-tight text-white">
                TEKTON<span className="text-primary">CAMPUS</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-8">
              The enterprise-grade digital campus management platform that brings precision engineering to higher education.
            </p>
            <div className="flex gap-4">
              {/* X (Twitter) — inline SVG replaces react-icons/si SiX */}
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              {/* GitHub — inline SVG replaces react-icons/si SiGithub */}
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Modules</a></li>
              <li><a href="#portals" className="text-muted-foreground hover:text-primary transition-colors">Portals</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Integration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="https://www.gkeliteinfo.com/about" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="https://www.gkeliteinfo.com/services" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Services</a></li>
              <li><a href="https://www.gkeliteinfo.com/contact" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TEKTON CAMPUS (A product of GK Elite Info). All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:business@tektoncampus.com" className="hover:text-primary transition-colors">business@tektoncampus.com</a>
            <a href="mailto:gkeliteinfo@gmail.com" className="hover:text-primary transition-colors">gkeliteinfo@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Modules />
        <Portals />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}