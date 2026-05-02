import { motion } from 'framer-motion';
import { Users, Linkedin, Mail, MessageCircle, Code2, Server, Database, Layers, Cpu, ChevronDown, Sparkles } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

/* ─── Tech Arsenal pills ───────────────────────────────────────────────── */
const techStack = [
    { label: 'React',       Icon: Code2,    cls: 'from-cyan-500 to-blue-500'    },
    { label: 'TypeScript',  Icon: Cpu,      cls: 'from-blue-500 to-indigo-600'  },
    { label: 'Node.js',     Icon: Server,   cls: 'from-green-500 to-emerald-600'},
    { label: 'PostgreSQL',  Icon: Database, cls: 'from-sky-500 to-cyan-600'     },
    { label: 'Prisma ORM',  Icon: Layers,   cls: 'from-violet-500 to-purple-600'},
];

/* ══════════════════════════════════════════════════════════════════════════ */
const AboutDevelopers = () => {
    const { about } = siteConfig;
    const dev = about.leadDeveloper;

    /* ── Contact buttons built from config ── */
    const contacts = [
        { Icon: MessageCircle, label: 'WhatsApp', href: dev.contacts.whatsapp, ring: 'ring-green-400/50',  bg: 'bg-green-500/20  hover:bg-green-500/30',  text: 'text-green-400'  },
        { Icon: Mail,          label: 'Email',    href: dev.contacts.email,    ring: 'ring-red-400/50',    bg: 'bg-red-500/20    hover:bg-red-500/30',    text: 'text-red-400'    },
        { Icon: Linkedin,      label: 'LinkedIn', href: dev.contacts.linkedin, ring: 'ring-blue-400/50',   bg: 'bg-blue-500/20   hover:bg-blue-500/30',   text: 'text-blue-400'   },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-700">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* ── LEAD DEVELOPER QUICK-JUMP BADGE ─────────────────── */}
                <div className="flex justify-center">
                    <motion.a
                        href="#lead-developer"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        whileHover={{ scale: 1.07, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full overflow-hidden cursor-pointer select-none
                                   border border-purple-400/40 dark:border-purple-500/30
                                   bg-white/60 dark:bg-slate-900/60 backdrop-blur-md
                                   shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30
                                   transition-all duration-400"
                    >
                        {/* Gradient glow background */}
                        <span className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10
                                         opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

                        {/* Animated left sparkle icon */}
                        <motion.span
                            animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative z-10 text-purple-500 dark:text-purple-400"
                        >
                            <Sparkles size={15} />
                        </motion.span>

                        {/* Label */}
                        <span className="relative z-10 text-sm font-bold tracking-wide
                                         bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500
                                         dark:from-violet-400 dark:via-purple-300 dark:to-indigo-400
                                         bg-clip-text text-transparent">
                            Lead Developer
                        </span>

                        {/* Pulsing status dot */}
                        <span className="relative z-10 flex items-center justify-center w-2 h-2">
                            <span className="absolute inline-flex w-full h-full rounded-full bg-purple-400 opacity-60 animate-ping" />
                            <span className="relative inline-flex w-2 h-2 rounded-full bg-purple-500" />
                        </span>

                        {/* Bounce chevron */}
                        <motion.span
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative z-10 text-purple-400 dark:text-purple-500"
                        >
                            <ChevronDown size={15} />
                        </motion.span>
                    </motion.a>
                </div>

                {/* ── HERO DESCRIPTION ─────────────────────────────────── */}
                <div className="flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl space-y-4"
                    >
                        <div className="flex items-center justify-center space-x-3 text-primary-600">
                            <Users size={32} />
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{about.projectTitle}</h1>
                        </div>
                        <p className="text-lg text-gray-600 leading-relaxed dark:text-slate-300">
                            {about.projectDescription}
                        </p>
                    </motion.div>
                </div>

                {/* ── ACADEMIC SUPERVISION (conditional) ───────────────── */}
                {about.showSupervisionSection && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative text-center space-y-8 bg-white/90 backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-2xl border border-red-100/50 max-w-4xl mx-auto overflow-hidden hover:border-red-200/80 transition-all duration-500 dark:bg-slate-900/90 dark:border-red-900/30"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 opacity-80" />

                        <div className="relative z-10 space-y-2">
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-serif dark:text-white">Academic Supervision</h3>
                            <div className="h-1 w-24 bg-red-100 mx-auto rounded-full overflow-hidden dark:bg-red-900/30">
                                <div className="h-full w-1/2 bg-red-500 rounded-full animate-slide-shine" />
                            </div>
                            <p className="text-gray-500 font-medium pt-2 dark:text-slate-400">This project was developed under the guidance of:</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                            {about.supervisors.map((name, index) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="group/item flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:bg-slate-800/50 dark:border-red-900/10 hover:shadow-lg hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300"
                                >
                                    <div className="relative mb-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 absolute -left-2 top-1/2 -translate-y-1/2 group-hover/item:scale-150 transition-transform duration-300" />
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 absolute -right-2 top-1/2 -translate-y-1/2 group-hover/item:scale-150 transition-transform duration-300" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 text-center leading-tight group-hover/item:text-primary-600 transition-colors duration-300 dark:text-slate-200 dark:group-hover/item:text-red-400">
                                        {name}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow delay-700" />
                    </motion.div>
                )}

                {/* ── LEAD DEVELOPER ───────────────────────────────────── */}
                <div className="space-y-6" id="lead-developer">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        className="text-center space-y-3"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Lead Developer</h2>
                        <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
                            The engineer behind the design, architecture, and full implementation of {about.projectTitle}.
                        </p>
                    </motion.div>

                    {/* ── Glassmorphism card ─────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.75, ease: 'easeOut' }}
                        className="relative max-w-3xl mx-auto rounded-3xl overflow-hidden"
                    >
                        {/* Moving gradient backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-500/10 to-indigo-600/20 dark:from-violet-900/40 dark:via-purple-900/20 dark:to-indigo-900/40 animate-pulse" style={{ animationDuration: '4s' }} />

                        {/* Glass surface */}
                        <div className="relative bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-purple-500/20 rounded-3xl shadow-2xl shadow-purple-500/10">

                            {/* Top shimmer bar */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

                            {/* Card body */}
                            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">

                                {/* Profile photo */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-purple-400 to-indigo-500 blur-md opacity-60 scale-110 animate-pulse" style={{ animationDuration: '3s' }} />
                                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white/80 dark:border-slate-700 ring-4 ring-purple-500/50 shadow-2xl">
                                        <img
                                            src={dev.photoPath}
                                            alt={dev.name}
                                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <span className="absolute bottom-2 right-2">
                                        <span className="block w-4 h-4 bg-green-400 border-2 border-white dark:border-slate-900 rounded-full shadow">
                                            <span className="block w-full h-full rounded-full bg-green-400 animate-ping opacity-75" />
                                        </span>
                                    </span>
                                </div>

                                {/* Text block */}
                                <div className="flex-1 text-center sm:text-left space-y-3">
                                    {/* Badge */}
                                    <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                                        {dev.badge}
                                    </span>

                                    {/* Name */}
                                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                                        {dev.name}
                                    </h3>

                                    {/* Gradient title */}
                                    <p className="text-base font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                                        {dev.title}
                                    </p>

                                    {/* Bio */}
                                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {dev.bio}
                                    </p>

                                    {/* Tech Arsenal */}
                                    <div className="pt-1">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">Tech Arsenal</p>
                                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                            {techStack.map(({ label, Icon, cls }) => (
                                                <motion.div
                                                    key={label}
                                                    whileHover={{ y: -3, scale: 1.08 }}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br ${cls} text-white text-xs font-semibold shadow-md cursor-default select-none`}
                                                >
                                                    <Icon size={13} />
                                                    <span>{label}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable contact icon bar */}
                            <div className="border-t border-white/20 dark:border-purple-500/10 px-8 py-5 flex items-center justify-center gap-4">
                                {contacts.map(({ Icon, label, href, ring, bg, text }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-2xl ring-1 ${ring} ${bg} ${text} transition-all duration-300 cursor-pointer`}
                                    >
                                        <Icon size={20} className="flex-shrink-0" />
                                        <span className="overflow-hidden max-w-0 group-hover:max-w-xs whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-in-out">
                                            {label}
                                        </span>
                                    </motion.a>
                                ))}
                            </div>

                            {/* Bottom shimmer bar */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
                        </div>
                    </motion.div>
                </div>

                {/* ── FOOTER SIGNATURE ─────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center pb-4"
                >
                    <p className="text-sm text-gray-400 dark:text-slate-600">
                        {dev.footerSignature}
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default AboutDevelopers;