import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Loader2, Edit, Trash2, BookOpen, Plus, School, MapPin, Search, Users, Cpu, HeartPulse, Briefcase, Activity, Globe, TrendingUp, TrendingDown, ShieldCheck, ShieldAlert, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth, getMediaUrl } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { analytics } from '../lib/analytics';
import type { Book, College, Department, User } from '../lib/types';
import { BookFormat } from '../lib/types';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [hasInitializedEdit, setHasInitializedEdit] = useState(false);
    const [activeTab, setActiveTab] = useState<'library' | 'users'>('library');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // Analytics State
    const [totalUsers, setTotalUsers] = useState(0);
    const [bookCounts, setBookCounts] = useState<Record<string, number>>({});
    const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
    const [growthData, setGrowthData] = useState<Record<string, number>>({});
    const [topDepartments, setTopDepartments] = useState<any[]>([]);
    const [selectedCollegeAnalytics, setSelectedCollegeAnalytics] = useState<string | null>(null);
    const [departmentStats, setDepartmentStats] = useState<any[]>([]);
    const [isDrillingDown, setIsDrillingDown] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [bookFormat, setBookFormat] = useState<BookFormat>(BookFormat.digital);
    const [shelfLocation, setShelfLocation] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverInputType, setCoverInputType] = useState<'file' | 'url'>('file');
    const [pdfInputType, setPdfInputType] = useState<'file' | 'url'>('file');
    const [coverUrlInput, setCoverUrlInput] = useState('');
    const [pdfUrlInput, setPdfUrlInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchColleges();
        fetchDepartments();
        fetchBooks();
        fetchAnalytics();
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users/all');
            if (data) setAllUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        if (userId === user?.id) {
            Swal.fire('Error', 'You cannot change your own role to avoid being locked out.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Change User Role?',
            text: `Are you sure you want to change this user's role to ${newRole}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!',
            confirmButtonColor: newRole === 'admin' ? '#d33' : '#3085d6',
        });

        if (result.isConfirmed) {
            try {
                await api.patch('/users/update-role', { userId, role: newRole });
                Swal.fire('Success', 'User role updated successfully', 'success');
                fetchUsers();
                fetchAnalytics();
            } catch (err: unknown) {
                Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
            }
        }
    };

    const fetchAnalytics = async () => {
        const users = await analytics.getTotalUniqueUsers();
        setTotalUsers(users);
        const { data, visits, growth } = await analytics.getBookCountsByCollege();
        setBookCounts(data);
        setVisitCounts(visits);
        setGrowthData(growth);

        const topDepts = await analytics.getTopDepartments();
        setTopDepartments(topDepts);
    };

    const handleDrillDown = async (collegeName: string) => {
        const college = colleges.find(c => c.name === collegeName);
        if (college) {
            setIsDrillingDown(true);
            setSelectedCollegeAnalytics(college.id);
            const stats = await analytics.getDepartmentStatsByCollege(college.id);
            setDepartmentStats(stats);
        }
    };

    const handleBackToColleges = () => {
        setIsDrillingDown(false);
        setSelectedCollegeAnalytics(null);
        setDepartmentStats([]);
    };

    const fetchColleges = async () => {
        try {
            const { data } = await api.get('/colleges');
            if (data) setColleges(data);
        } catch (error) {
            console.error('Error fetching colleges:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/colleges/departments');
            if (data) setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchBooks = async () => {
        try {
            const { data } = await api.get('/books');
            if (data) setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleAddCollege = async () => {
        const { value: collegeName } = await Swal.fire({
            title: 'Add New College',
            input: 'text',
            inputLabel: 'College Name',
            inputPlaceholder: 'e.g. Engineering',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return 'You need to write something!';
            }
        });

        if (collegeName) {
            try {
                await api.post('/colleges', { name: collegeName });
                Swal.fire('Success', 'College added successfully', 'success');
                fetchColleges();
            } catch (err: unknown) {
                Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
            }
        }
    };

    const handleAddDepartment = async () => {
        const collegeOptions = colleges.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        const { value: formValues } = await Swal.fire({
            title: 'Add New Department',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Department Name">' +
                '<select id="swal-input2" class="swal2-input">' +
                '<option value="" disabled selected>Select College</option>' +
                collegeOptions +
                '</select>',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLSelectElement).value
                ]
            }
        });

        if (formValues) {
            const [name, collegeId] = formValues;
            if (!name || !collegeId) {
                Swal.fire('Error', 'Please provide both name and college', 'error');
                return;
            }

            try {
                await api.post('/colleges/departments', { name, collegeId });
                Swal.fire('Success', 'Department added successfully', 'success');
                fetchDepartments();
            } catch (err: unknown) {
                Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
            }
        }
    };

    const handleDeleteCollege = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will also delete all books associated with this college!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/colleges/${id}`);
                Swal.fire('Deleted!', 'College has been deleted.', 'success');
                fetchColleges();
            } catch (err: unknown) {
                Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
            }
        }
    };

    const handleDeleteDepartment = async (id: string) => {
        const deptToDelete = departments.find(d => d.id === id);
        if (!deptToDelete) return;

        const sameNameDepts = departments.filter(d => d.name.toLowerCase() === deptToDelete.name.toLowerCase());
        const hasDuplicates = sameNameDepts.length > 1;

        if (hasDuplicates) {
            const result = await Swal.fire({
                title: 'Delete Department',
                text: `The department "${deptToDelete.name}" exists in multiple colleges.`,
                icon: 'question',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Delete from ALL Colleges',
                denyButtonText: `Delete only from ${colleges.find(c => c.id === deptToDelete.collegeId)?.name}`,
                confirmButtonColor: '#d33',
                denyButtonColor: '#3085d6',
            });

            if (result.isConfirmed) {
                try {
                    await api.delete(`/colleges/departments/name/${encodeURIComponent(deptToDelete.name)}`);
                    Swal.fire('Deleted!', `All "${deptToDelete.name}" departments have been deleted.`, 'success');
                    fetchDepartments();
                } catch (err: unknown) {
                    Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
                }
            } else if (result.isDenied) {
                try {
                    await api.delete(`/colleges/departments/${id}`);
                    Swal.fire('Deleted!', 'Department has been deleted from this college.', 'success');
                    fetchDepartments();
                } catch (err: unknown) {
                    Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
                }
            }
        } else {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This will delete the department. Books assigned to it might lose their category association.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                try {
                    await api.delete(`/colleges/departments/${id}`);
                    Swal.fire('Deleted!', 'Department has been deleted.', 'success');
                    fetchDepartments();
                } catch (err: unknown) {
                    Swal.fire('Error', err instanceof Error ? err.message : String(err), 'error');
                }
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setMessage('');

        try {
            const bookData = {
                title,
                description,
                category: category,
                collegeId: collegeId || null,
                format: bookFormat,
                shelfLocation: bookFormat === BookFormat.physical ? shelfLocation : null,
                type: 'free',
                coverPath: coverInputType === 'url' ? (coverUrlInput || undefined) : undefined,
                pdfPath: pdfInputType === 'url' ? (pdfUrlInput || undefined) : undefined,
            };

            let bookId = editingBook?.id;

            if (editingBook) {
                await api.put(`/books/${bookId}`, bookData);
                setMessage('Book updated successfully!');
            } else {
                const { data } = await api.post('/books', bookData);
                bookId = data.id;
                setMessage('Book added successfully!');
            }

            if ((coverInputType === 'file' && coverFile) || (pdfInputType === 'file' && pdfFile && bookFormat === BookFormat.digital)) {
                const formData = new FormData();
                if (coverInputType === 'file' && coverFile) formData.append('cover', coverFile);
                if (pdfInputType === 'file' && pdfFile && bookFormat === BookFormat.digital) formData.append('pdf', pdfFile);
                
                await api.post(`/books/${bookId}/upload`, formData);
            }

            resetForm();
            fetchBooks();

        } catch (err: unknown) {
            console.error('Operation error:', err);
            setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/books/${id}`);
            Swal.fire('Deleted!', 'Book deleted successfully.', 'success');
            fetchBooks();
        } catch (err: unknown) {
            Swal.fire('Error!', `Error deleting book: ${err instanceof Error ? err.message : String(err)}`, 'error');
        }
    };

    const startEdit = useCallback((book: Book) => {
        setEditingBook(book);
        setTitle(book.title);
        setDescription(book.description || '');
        setCoverUrlInput(book.coverPath || '');
        setPdfUrlInput(book.pdfPath || '');
        setCoverInputType(book.coverPath && book.coverPath.startsWith('http') ? 'url' : 'file');
        setPdfInputType(book.pdfPath && book.pdfPath.startsWith('http') ? 'url' : 'file');
        setCoverFile(null);
        setPdfFile(null);

        const matchingDept = departments.find(d => d.name.toLowerCase() === (book.category || '').toLowerCase());
        setCategory(matchingDept ? matchingDept.name : book.category || '');

        setCollegeId(book.collegeId || '');

        let format = book.format as BookFormat;
        if (!format) {
            format = BookFormat.digital;
        }
        setBookFormat(format);

        setShelfLocation(book.shelfLocation || '');
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [departments]);

    useEffect(() => {
        if (location.state?.editBook && departments.length > 0 && !hasInitializedEdit) {
            startEdit(location.state.editBook);
            setHasInitializedEdit(true);
        }
    }, [location.state, departments, hasInitializedEdit, startEdit]);

    const resetForm = () => {
        setEditingBook(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setCollegeId('');
        setBookFormat(BookFormat.digital);
        setShelfLocation('');
        setCoverInputType('file');
        setPdfInputType('file');
        setCoverFile(null);
        setPdfFile(null);
        setCoverUrlInput('');
        setPdfUrlInput('');
        setMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-slate-950 transition-colors duration-700 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-soft border border-gray-100 dark:bg-slate-900 dark:text-slate-400 dark:border-white/5">
                        Welcome back, Admin
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 dark:bg-slate-900/50 dark:border-white/5 dark:backdrop-blur-md">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Unique Visitors</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 dark:bg-slate-900/50 dark:border-white/5 dark:backdrop-blur-md">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
                            <UserCog size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Registered Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{allUsers.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 dark:bg-slate-900/50 dark:border-white/5 dark:backdrop-blur-md">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-900/30 dark:text-emerald-400">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Books</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{books.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 dark:bg-slate-900/50 dark:border-white/5 dark:backdrop-blur-md">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl dark:bg-purple-900/30 dark:text-purple-400">
                            <School size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Active Colleges</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{colleges.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-900/50 rounded-2xl w-full sm:w-max overflow-x-auto backdrop-blur-md border border-white/20 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'library' ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-800 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <BookOpen size={18} />
                        <span>Library Management</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'users' ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-800 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <UserCog size={18} />
                        <span>Manage Users</span>
                    </button>
                </div>

                {activeTab === 'library' ? (
                    <>
                        {Object.keys(bookCounts).length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 dark:bg-slate-900/50 dark:border-white/5 shadow-2xl relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                <div className="p-2 bg-red-100 text-red-600 rounded-xl mr-3 dark:bg-red-900/30 dark:text-red-400">
                                                    {isDrillingDown ? <Activity size={20} /> : <TrendingUp size={20} />}
                                                </div>
                                                {isDrillingDown ? (
                                                    <>
                                                        <button 
                                                            onClick={handleBackToColleges}
                                                            className="hover:text-red-600 transition-colors mr-2 flex items-center"
                                                        >
                                                            Traffic
                                                        </button>
                                                        <span className="text-gray-400 font-medium">/ {colleges.find(c => c.id === selectedCollegeAnalytics)?.name}</span>
                                                    </>
                                                ) : 'College Visit Traffic'}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className="text-xs font-medium text-gray-500 uppercase tracking-widest dark:text-slate-400">
                                                    {isDrillingDown ? 'Department Breakdown' : 'Monthly Analysis'}
                                                </div>
                                                {isDrillingDown && (
                                                    <button 
                                                        onClick={handleBackToColleges}
                                                        className="text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-all dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                                    >
                                                        Back
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart 
                                                    layout="vertical" 
                                                    data={isDrillingDown 
                                                        ? departmentStats.map(s => ({ name: s.name, value: s.visitCount, growth: s.growth }))
                                                        : Object.entries(visitCounts).map(([name, value]) => ({ name, value, growth: growthData[name] || 0 }))
                                                    }
                                                    margin={{ left: 40, right: 20 }}
                                                    onClick={(data) => {
                                                        if (!isDrillingDown && data && data.activeLabel) {
                                                            handleDrillDown(String(data.activeLabel));
                                                        }
                                                    }}
                                                >
                                                    <XAxis type="number" hide />
                                                    <YAxis 
                                                        dataKey="name" 
                                                        type="category" 
                                                        axisLine={false} 
                                                        tickLine={false}
                                                        width={100}
                                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                                    />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                        content={({ active, payload, label }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl">
                                                                        <p className="font-bold text-white mb-1">{label}</p>
                                                                        <p className="text-red-400 text-sm font-medium">Visits: {payload[0].value}</p>
                                                                        {!isDrillingDown && <p className="text-gray-400 text-[10px] mt-1">Click to view departments</p>}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                                                        {(isDrillingDown ? departmentStats : Object.entries(visitCounts)).map((_, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={index % 2 === 0 ? '#b91c1c' : '#dc2626'} 
                                                                className={!isDrillingDown ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="glass rounded-3xl p-6 border border-white/40 dark:bg-slate-900/50 dark:border-white/5 shadow-2xl">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mr-3 dark:bg-blue-900/30 dark:text-blue-400">
                                                <TrendingUp size={20} />
                                            </div>
                                            Top Departments
                                        </h3>
                                        <div className="space-y-5">
                                            {topDepartments.map((dept, index) => (
                                                <div key={dept.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                                            #{index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{dept.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium dark:text-slate-500">{dept.college.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-gray-900 dark:text-white">{dept.visitCount}</p>
                                                        <p className="text-[10px] text-emerald-500 font-bold">Visits</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {topDepartments.length === 0 && (
                                                <div className="text-center py-10">
                                                    <p className="text-gray-400 text-sm">No department data yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="glass rounded-3xl p-6 border border-white/40 dark:bg-slate-900/50 dark:border-white/5 shadow-2xl">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl mr-3 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Globe size={20} />
                                            </div>
                                            Library Distribution
                                        </h3>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart margin={{ bottom: 20 }}>
                                                    <Pie
                                                        data={Object.entries(bookCounts).map(([name, value]) => ({ name, value }))}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        onClick={(data) => {
                                                            if (data && data.name) handleDrillDown(data.name);
                                                        }}
                                                    >
                                                        {Object.entries(bookCounts).map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#b91c1c', '#1e293b', '#475569', '#94a3b8'][index % 4]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend 
                                                        verticalAlign="bottom" 
                                                        content={(props: any) => {
                                                            const { payload } = props;
                                                            return (
                                                                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-6">
                                                                    {payload?.map((entry: any, index: number) => (
                                                                        <li key={`item-${index}`} className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                                                                            <span className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: entry.color }}></span>
                                                                            <span className="truncate max-w-[120px]" title={entry.value}>{entry.value}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center glass rounded-3xl p-8 border border-white/40 dark:bg-slate-900/50 dark:border-white/5 shadow-2xl bg-gradient-to-br from-red-600/5 to-transparent">
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Deep Insights</h4>
                                        <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">Click on any college in the charts to see the department-level breakdown. Monitor daily unique visits to optimize resource allocation and book procurement strategies.</p>
                                        <div className="flex gap-4">
                                            <div className="p-4 bg-white/50 rounded-2xl border border-white dark:bg-slate-800/50 dark:border-white/5 flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Top Performing Dept</p>
                                                <p className="text-base font-black text-red-600 truncate">{topDepartments[0]?.name || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 bg-white/50 rounded-2xl border border-white dark:bg-slate-800/50 dark:border-white/5 flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Highest Growth</p>
                                                <p className="text-base font-black text-emerald-500">
                                                    +{Object.values(growthData).length > 0 ? Math.max(...Object.values(growthData) as number[]) : 0}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {Object.entries(visitCounts).map(([name, visits], index) => {
                                        const icons: Record<string, any> = {
                                            'Engineering': Cpu,
                                            'Nursing': HeartPulse,
                                            'Business': Briefcase,
                                            'Physical Therapy': Activity,
                                            'Global': Globe
                                        };
                                        const Icon = icons[name] || School;
                                        const growth = growthData[name] || 0;
                                        const visitsValue = visits as number;
                                        const maxVisits = Math.max(...Object.values(visitCounts) as number[]);
                                        const progress = (visitsValue / maxVisits) * 100;
                                        const isTrending = visitsValue === maxVisits && visitsValue > 0;

                                        return (
                                            <motion.div
                                                key={name}
                                                whileHover={{ y: -5 }}
                                                className="relative group glass rounded-3xl p-6 border border-white/40 dark:bg-slate-900/50 dark:border-white/5 overflow-hidden"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-3 rounded-2xl ${index % 2 === 0 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                        <Icon size={24} />
                                                    </div>
                                                    {isTrending && (
                                                        <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase tracking-tighter animate-pulse dark:bg-red-900/40 dark:text-red-300">
                                                            Hot
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-1 mb-6 overflow-hidden">
                                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-slate-400 truncate" title={name}>{name}</h4>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{visitsValue.toLocaleString()}</span>
                                                        <span className={`text-xs font-bold mb-1 flex items-center ${growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {growth >= 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                                            {Math.abs(growth)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                                        <span>Popularity</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-slate-800">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                            className="h-full bg-gradient-to-r from-red-600 to-rose-400"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4">
                                <div className="glass rounded-3xl p-6 sticky top-24 flex flex-col h-[calc(100vh-120px)] transition-all duration-300 hover:shadow-float border border-white/40 dark:bg-slate-900/50 dark:border-white/10 dark:backdrop-blur-xl">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between flex-shrink-0">
                                        <span className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${editingBook ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-primary-100 text-primary-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {editingBook ? <Edit size={20} /> : <Upload size={20} />}
                                            </div>
                                            {editingBook ? 'Edit Book' : 'Add New Book'}
                                        </span>
                                        {editingBook && (
                                            <button onClick={resetForm} className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
                                                Cancel
                                            </button>
                                        )}
                                    </h2>

                                    <form onSubmit={handleUpload} className="flex flex-col h-full overflow-hidden">
                                        <div className="overflow-y-auto pr-2 flex-1 space-y-5 mb-4 scrollbar-default">
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">Book Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                    placeholder="Enter book title"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">Description</label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 resize-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                    placeholder="Brief description of the book..."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">College / Section</label>
                                                <div className="relative">
                                                    <select
                                                        value={collegeId}
                                                        onChange={(e) => setCollegeId(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 appearance-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                    >
                                                        <option value="" disabled>Select College</option>
                                                        {[...colleges].sort((a: College, b: College) => a.name.localeCompare(b.name)).map((college: College) => (
                                                            <option key={college.id} value={college.id}>{college.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {collegeId && departments.filter((d: Department) => d.collegeId === collegeId).length > 0 && (
                                                <div className="space-y-1.5 animate-fade-in">
                                                    <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">Department</label>
                                                    <div className="relative">
                                                        <select
                                                            value={category}
                                                            onChange={(e) => setCategory(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 appearance-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                        >
                                                            <option value="" disabled>Select Department</option>
                                                            {[...departments]
                                                                .filter((d: Department) => d.collegeId === collegeId)
                                                                .sort((a: Department, b: Department) => a.name.localeCompare(b.name))
                                                                .map((dept: Department) => (
                                                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                                                ))
                                                            }
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">Format</label>
                                                <div className="relative">
                                                    <select
                                                        value={bookFormat}
                                                        onChange={(e) => setBookFormat(e.target.value as BookFormat)}
                                                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 appearance-none dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                    >
                                                        <option value="digital">Digital (PDF)</option>
                                                        <option value="physical">Physical Book</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {bookFormat === 'physical' && (
                                                <div className="space-y-1.5 animate-fade-in">
                                                    <label className="block text-sm font-semibold text-gray-700 ml-1 dark:text-slate-300">Shelf Location</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                                        <input
                                                            type="text"
                                                            value={shelfLocation}
                                                            onChange={(e) => setShelfLocation(e.target.value)}
                                                            placeholder="e.g. Row A, Shelf 3"
                                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200 dark:focus:border-red-500 dark:focus:ring-red-500/20"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-4 pt-2">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between ml-1 mb-1">
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Cover Image</label>
                                                        <div className="flex space-x-2 text-xs">
                                                            <button type="button" onClick={() => setCoverInputType('file')} className={`px-2 py-1 rounded ${coverInputType === 'file' ? 'bg-primary-100 text-primary-700 font-bold dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Upload File</button>
                                                            <button type="button" onClick={() => setCoverInputType('url')} className={`px-2 py-1 rounded ${coverInputType === 'url' ? 'bg-primary-100 text-primary-700 font-bold dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>External URL</button>
                                                        </div>
                                                    </div>
                                                    {coverInputType === 'url' ? (
                                                        <input
                                                            type="text"
                                                            value={coverUrlInput}
                                                            onChange={(e) => setCoverUrlInput(e.target.value)}
                                                            placeholder="Paste cover image link..."
                                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300 group cursor-pointer relative dark:border-slate-700 dark:hover:border-red-500/50 dark:hover:bg-red-900/10">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            />
                                                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                                                <div className="p-2 bg-gray-100 rounded-full group-hover:bg-primary-100 transition-colors dark:bg-slate-800 dark:group-hover:bg-red-900/30">
                                                                    <Upload size={20} className="text-gray-500 group-hover:text-primary-600 dark:text-slate-400 dark:group-hover:text-red-400" />
                                                                </div>
                                                                <div className="text-sm">
                                                                    <span className="font-semibold text-primary-600">Click to upload</span>
                                                                    <span className="text-gray-500"> cover image</span>
                                                                </div>
                                                                {coverFile && <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">{coverFile.name}</p>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {bookFormat === 'digital' && (
                                                    <div className="space-y-1.5 mt-4">
                                                        <div className="flex items-center justify-between ml-1 mb-1">
                                                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">PDF File</label>
                                                            <div className="flex space-x-2 text-xs">
                                                                <button type="button" onClick={() => setPdfInputType('file')} className={`px-2 py-1 rounded ${pdfInputType === 'file' ? 'bg-primary-100 text-primary-700 font-bold dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>Upload File</button>
                                                                <button type="button" onClick={() => setPdfInputType('url')} className={`px-2 py-1 rounded ${pdfInputType === 'url' ? 'bg-primary-100 text-primary-700 font-bold dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>External URL</button>
                                                            </div>
                                                        </div>
                                                        {pdfInputType === 'url' ? (
                                                            <input
                                                                type="text"
                                                                value={pdfUrlInput}
                                                                onChange={(e) => setPdfUrlInput(e.target.value)}
                                                                placeholder="Paste Google Drive PDF link..."
                                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300 group cursor-pointer relative animate-fade-in dark:border-slate-700 dark:hover:border-red-500/50 dark:hover:bg-red-900/10">
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf"
                                                                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                />
                                                                <div className="flex flex-col items-center justify-center text-center space-y-2">
                                                                    <div className="p-2 bg-gray-100 rounded-full group-hover:bg-primary-100 transition-colors dark:bg-slate-800 dark:group-hover:bg-red-900/30">
                                                                        <Upload size={20} className="text-gray-500 group-hover:text-primary-600 dark:text-slate-400 dark:group-hover:text-red-400" />
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        <span className="font-semibold text-primary-600">Click to upload</span>
                                                                        <span className="text-gray-500"> PDF file</span>
                                                                    </div>
                                                                    {pdfFile && <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">{pdfFile.name}</p>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {message && (
                                                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                    {message.includes('Error') ? (
                                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    )}
                                                    {message}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-auto flex-shrink-0 dark:from-red-700 dark:to-red-800 dark:shadow-red-900/40"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (editingBook ? 'Update Book' : 'Add Book')}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-8">
                                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/40 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center dark:text-white">
                                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl mr-3 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                <School size={24} />
                                            </div>
                                            Colleges <span className="ml-3 text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300">{colleges.length}</span>
                                        </h2>
                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={handleAddCollege}
                                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm sm:text-base"
                                            >
                                                <Plus size={18} />
                                                <span>Add College</span>
                                            </button>
                                            <button
                                                onClick={handleAddDepartment}
                                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm sm:text-base dark:bg-slate-800 dark:hover:bg-slate-700"
                                            >
                                                <Plus size={18} />
                                                <span>Add Dept</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {colleges.map((college: College) => (
                                            <div key={college.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-card hover:border-primary-100 transition-all duration-300 dark:bg-slate-900/50 dark:border-white/5 dark:hover:bg-white/5">
                                                <span className="font-semibold text-gray-800 text-lg group-hover:text-primary-700 transition-colors dark:text-slate-200 dark:group-hover:text-red-400">{college.name}</span>
                                                <button
                                                    onClick={() => handleDeleteCollege(college.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                    title="Delete College"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/40 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center dark:text-white">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl mr-3 dark:bg-purple-900/30 dark:text-purple-400">
                                                <School size={24} />
                                            </div>
                                            Departments <span className="ml-3 text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300">{departments.length}</span>
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {departments.map((dept: Department) => (
                                            <div key={dept.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-card hover:border-primary-100 transition-all duration-300 dark:bg-slate-900/50 dark:border-white/5 dark:hover:bg-white/5">
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-lg group-hover:text-primary-700 transition-colors block dark:text-slate-200 dark:group-hover:text-red-400">{dept.name}</span>
                                                    <span className="text-xs text-gray-500 dark:text-slate-400">{colleges.find((c: College) => c.id === dept.collegeId)?.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteDepartment(dept.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                    title="Delete Department"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass rounded-3xl p-6 sm:p-8 border border-white/40 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center dark:text-white">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl mr-3 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <BookOpen size={24} />
                                            </div>
                                            Library Collection <span className="ml-3 text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300">{books.length}</span>
                                        </h2>
                                        <div className="relative w-full sm:w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search books..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200 dark:focus:ring-red-500/20 dark:focus:border-red-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {books.filter((book: Book) =>
                                            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            book.category?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((book: Book) => (
                                            <div key={book.id} className="group flex flex-col sm:flex-row items-start p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-card hover:border-primary-100 transition-all duration-300 dark:bg-slate-900/50 dark:border-white/5 dark:hover:bg-white/5">
                                                <div className="w-full sm:w-20 h-48 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-all mb-4 sm:mb-0 dark:bg-slate-800">
                                                    {book.coverPath ? (
                                                        <img
                                                            src={getMediaUrl(book.coverPath)}
                                                            alt={book.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-50/50 to-slate-200/50 dark:from-purple-900/50 dark:to-rose-900/50 p-2 text-center border dark:border-white/10">
                                                            <BookOpen size={32} strokeWidth={1.5} className="text-slate-400 dark:text-white/60 mb-1 opacity-70" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="sm:ml-6 flex-1 min-w-0 w-full">
                                                    <div className="flex justify-between items-start">
                                                        <div className="pr-4 flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors dark:text-slate-200 dark:group-hover:text-red-400">{book.title}</h3>
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {book.colleges ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                                        {book.colleges.name}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                                        Global
                                                                    </span>
                                                                )}
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                                                    {book.format}
                                                                </span>
                                                                {book.category && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100 capitalize dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/50">
                                                                        {book.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                                                            <button
                                                                onClick={() => startEdit(book)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(book.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">{book.description}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {books.length === 0 && (
                                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BookOpen size={32} className="text-gray-300" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No books found</h3>
                                                <p className="text-gray-500 mt-1">Get started by adding your first book to the collection.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-3xl p-6 sm:p-8 border border-white/40 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:border-white/5"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center dark:text-white">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl mr-3 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <Users size={24} />
                                </div>
                                Manage Users <span className="ml-3 text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300">{allUsers.length}</span>
                            </h2>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    placeholder="Search by email..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200 dark:focus:ring-red-500/20 dark:focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Joined</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {allUsers.filter(u => 
                                        u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                        u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase())
                                    ).map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-white/20">
                                                        {u.profilePath ? (
                                                            <img src={getMediaUrl(u.profilePath)} alt={u.displayName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.displayName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{u.displayName || 'No Name'}</div>
                                                        <div className="text-xs text-gray-500 dark:text-slate-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    u.role === 'admin' 
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                                        : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    {u.role === 'admin' ? <ShieldAlert size={12} className="mr-1" /> : <ShieldCheck size={12} className="mr-1" />}
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {u.id !== user?.id ? (
                                                    <button
                                                        onClick={() => handleUpdateRole(u.id, u.role === 'admin' ? 'student' : 'admin')}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                            u.role === 'admin'
                                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20'
                                                        }`}
                                                    >
                                                        {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-400 italic">You (Current Admin)</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
