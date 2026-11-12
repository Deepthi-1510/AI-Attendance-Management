import { HiOutlineBars3, HiOutlineBell, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()

  const pageTitle = () => {
    const path = window.location.pathname
    const map = {
      '/admin': 'Admin Dashboard', '/teacher': 'Teacher Dashboard', '/student': 'Student Dashboard',
      '/students': 'Students', '/teachers': 'Faculty', '/subjects': 'Subjects',
      '/watchlist': 'AI Watchlist', '/sessions': 'Attendance Sessions', '/penalties': 'Penalty Management',
    }
    return map[path] || 'IntelliAttend'
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 gap-4 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
        <HiOutlineBars3 size={20} />
      </button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <HiOutlineMagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all placeholder:text-slate-400" placeholder="Search students, sessions..." />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <HiOutlineBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Environment badge */}
        <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
          Demo Mode
        </span>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.avatar}
          </div>
        </div>
      </div>
    </header>
  )
}
