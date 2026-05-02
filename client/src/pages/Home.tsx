import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Cpu, Zap, PenTool, ArrowRight, Book } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../lib/api';

// === Book3D component: Open-Book cinematic animation ===
// هذا المكون يمثل الكتاب ثلاثي الأبعاد مع رسوم متحركة للفتح التلقائي
function Book3D({ openTarget = 1 }) {
    const group = useRef<Group>(null!);
    const leftCover = useRef<Group>(null!);
    const rightCover = useRef<Group>(null!);
    const pages = useRef<(Mesh | null)[]>([]);

    // progress [0..1] controls opening animation
    let progress = useRef(0);

    useEffect(() => {
        // reset
        progress.current = 0;
    }, []);

    useFrame((state, delta) => {
        // ease the progress to target (gentle spring-like feel)
        const speed = 1.2; // higher = faster open
        progress.current += (openTarget - progress.current) * Math.min(delta * speed, 0.12);

        // eased value (smoothstep)
        const t = progress.current;
        const ease = t * t * (3 - 2 * t);

        // covers rotate outward: left rotates +y, right rotates -y
        const coverMax = Math.PI * 0.6; // how wide the cover opens
        if (leftCover.current) leftCover.current.rotation.y = 0.2 + coverMax * ease * 0.9;
        if (rightCover.current) rightCover.current.rotation.y = -0.2 - coverMax * ease * 0.9;

        // subtle page curl and wobble
        const pageCount = pages.current.length;
        for (let i = 0; i < pageCount; i++) {
            const mesh = pages.current[i];
            if (!mesh) continue;
            const idx = i / pageCount;
            // pages fan out a little and flutter while opening
            const fan = (idx - 0.5) * 0.12 * ease; // spread
            const flutter = Math.sin(state.clock.elapsedTime * (1 + idx * 2)) * 0.002 * (1 - ease);
            mesh.rotation.y = fan + flutter;
            mesh.position.x = idx * 0.006 - 0.03; // tiny offset for realism
        }

        // group gentle bob for life
        if (group.current) {
            group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.06;
        }
    });

    // build pages refs initializer
    const makePageRef = (el: Mesh | null, i: number) => (pages.current[i] = el);

    return (
        <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.4}>
            <group ref={group} scale={1.15} position={[0.8, -0.2, 0]}> {/* slight shift to the right to match hero layout */}
                {/* Book spine (thin box) */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.12, 2.6, 3.0]} />
                    <meshStandardMaterial roughness={0.35} metalness={0.2} color={'#6b0f0f'} />
                </mesh>

                {/* Left cover */}
                <group ref={leftCover} position={[-1.4, 0, 0.0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[2.6, 3.2, 0.12]} />
                        <meshStandardMaterial color={'#8b0000'} roughness={0.25} metalness={0.15} />
                    </mesh>
                    {/* decorative inner cover (paper lining) */}
                    <mesh position={[0.05, 0, 0.06]}>
                        <boxGeometry args={[2.5, 3.0, 0.02]} />
                        <meshStandardMaterial color={'#f4efe3'} roughness={0.7} />
                    </mesh>
                </group>

                {/* Right cover */}
                <group ref={rightCover} position={[1.4, 0, 0.0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[2.6, 3.2, 0.12]} />
                        <meshStandardMaterial color={'#b80000'} roughness={0.22} metalness={0.12} />
                    </mesh>
                    <mesh position={[-0.05, 0, 0.06]}>
                        <boxGeometry args={[2.5, 3.0, 0.02]} />
                        <meshStandardMaterial color={'#f7f3ea'} roughness={0.72} />
                    </mesh>
                </group>

                {/* Pages stack -- many thin planes for realistic edges */}
                <group position={[0, 0, 0.06]}>
                    {Array.from({ length: 26 }).map((_, i) => {
                        const z = (i - 13) * 0.004; // depth stacking
                        return (
                            <mesh
                                key={i}
                                ref={(el) => makePageRef(el, i)}
                                position={[0 - i * 0.002, 0, z]}
                                rotation={[0, 0, 0]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[2.36, 3.1, 0.006]} />
                                <meshStandardMaterial color={'#f2ebdd'} roughness={0.78} metalness={0.02} />
                            </mesh>
                        );
                    })}

                    {/* top paper thickness edge to simulate layered pages */}
                    <mesh position={[0.02, 1.55, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[2.5, 0.08]} />
                        <meshStandardMaterial color={'#e6d8bf'} roughness={0.9} />
                    </mesh>
                </group>

                {/* small title logo on cover (simple raised text alternative - rectangle) */}
                <mesh position={[1.35, 0.7, 0.08]} rotation={[0, 0.25, 0]} castShadow>
                    <boxGeometry args={[0.8, 0.4, 0.02]} />
                    <meshStandardMaterial color={'#ffd9d9'} roughness={0.3} />
                </mesh>
            </group>
        </Float>
    );
}

// === The Home page with cinematic Canvas ===
export default function Home() {
    const [colleges, setColleges] = useState<any[]>([]);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const { data } = await api.get('/colleges');
                if (data) setColleges(data);
            } catch (error) {
                console.error('Error fetching colleges:', error);
            }
        };
        fetchColleges();
    }, []);

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('computer')) return Cpu;
        if (lower.includes('electrical')) return Zap;
        if (lower.includes('architecture')) return PenTool;
        return Book;
    };

    const getColor = (index: number) => {
        const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500'];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen pt-16 bg-gray-50 dark:bg-slate-950 transition-colors duration-700">
            <SEO
                title="Home"
                description="Access thousands of resources for Engineering, Nursing, Physical Therapy, and Business at MUC Library."
                keywords="MUC, Library, Engineering, Nursing, Physical Therapy, Business"
            />

            {/* Hero Section */}
            <section className="relative h-[640px] bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10" />

                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="w-full h-full bg-[url('/bg2.png')] bg-cover bg-center" />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9 }}>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                MUC University <span className="text-primary-500">Library</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 max-w-lg">
                                Access thousands of resources across all colleges and global sections.
                            </p>
                            <Link to="/books" className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg hover:bg-primary-700 transition-colors">
                                <span>Browse Library</span>
                                <ArrowRight size={24} />
                            </Link>
                        </motion.div>

                        {/* 3D canvas — bigger and cinematic */}
                        <div className="h-[520px] w-full hidden md:block">
                            <Canvas shadows camera={{ position: [2.6, 0.6, 6], fov: 40 }}>
                                {/* Ambient + cinematic directional light */}
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

                                {/* Environment for reflections */}
                                <Environment preset="studio" />

                                {/* The book */}
                                <Suspense fallback={null}>
                                    <Book3D openTarget={1} />
                                </Suspense>

                                {/* soft contact shadow under the book */}
                                <ContactShadows position={[0.6, -1.6, 0]} opacity={0.6} scale={4} blur={3} far={2.5} />

                                <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} maxPolarAngle={Math.PI / 2} />
                            </Canvas>
                        </div>
                                {/* Colleges & Sections */}
                    </div>
                </div>
            </section>

            <section className="relative py-24 bg-gray-50 dark:bg-slate-950 transition-colors duration-700 overflow-hidden">

                {/* Decorative radial glow blobs */}
                <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-red-500/5 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Section Header ───────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 space-y-4"
                    >
                        {/* Eyebrow label */}
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                                         bg-red-50 dark:bg-red-900/20
                                         border border-red-100 dark:border-red-800/30
                                         text-red-600 dark:text-red-400
                                         text-xs font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Academic Collections
                        </span>

                        {/* Main heading with gradient accent */}
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                            <span className="text-gray-900 dark:text-white">Browse by </span>
                            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent">
                                College &amp; Section
                            </span>
                        </h2>

                        {/* Animated underline */}
                        <div className="flex justify-center">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '5rem' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="h-1 rounded-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600"
                            />
                        </div>

                        <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-base">
                            Find resources tailored to your specific field of study.
                        </p>
                    </motion.div>

                    {/* ── College Cards ────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {colleges.map((college, index) => {
                            const Icon = getIcon(college.name);
                            const color = getColor(index);
                            const baseColor = color.replace('bg-', '').replace('-500', '');

                            return (
                                <motion.div
                                    key={college.id}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.09, duration: 0.55 }}
                                    whileHover={{ y: -6 }}
                                >
                                    <Link to={`/books?college=${college.id}`} className="relative block group h-full">

                                        {/* Glow halo behind card */}
                                        <div className={`absolute inset-0 bg-gradient-to-br from-${baseColor}-500/25 to-${baseColor}-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        {/* Card surface */}
                                        <div className="relative h-full flex flex-col
                                                        bg-white dark:bg-slate-900/80
                                                        backdrop-blur-xl
                                                        border border-gray-100 dark:border-white/5
                                                        rounded-3xl p-7
                                                        shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]
                                                        group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
                                                        transition-all duration-500 overflow-hidden">

                                            {/* Decorative corner circle */}
                                            <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full bg-${baseColor}-100/60 dark:bg-${baseColor}-900/20 group-hover:scale-[1.6] transition-transform duration-700 ease-out`} />

                                            {/* Shimmer sweep */}
                                            <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0
                                                             translate-x-[-120%] group-hover:translate-x-[120%]
                                                             transition-transform duration-700 ease-in-out pointer-events-none rounded-3xl" />

                                            {/* Card index number */}
                                            <span className="absolute top-5 right-6 text-5xl font-black text-gray-100 dark:text-slate-800 select-none leading-none">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <div className="relative z-10 flex flex-col flex-1">
                                                {/* Icon orb */}
                                                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5
                                                                 shadow-lg shadow-${baseColor}-500/30
                                                                 group-hover:scale-110 group-hover:rotate-3
                                                                 transition-all duration-300`}>
                                                    <Icon size={28} className="text-white" />
                                                </div>

                                                {/* College name */}
                                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 leading-tight">
                                                    {college.name}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-gray-400 dark:text-slate-500 text-sm leading-relaxed flex-1 line-clamp-2">
                                                    Explore specialized resources and academic materials for {college.name}.
                                                </p>

                                                {/* CTA */}
                                                <div className="mt-5 pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-500">
                                                    <span className="group-hover:translate-x-1 transition-transform duration-300">Browse Collection</span>
                                                    <ArrowRight size={15} className="group-hover:translate-x-2 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}