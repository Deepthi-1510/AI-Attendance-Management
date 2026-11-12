import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import AIChatbotModal from '../components/AIChatbotModal'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  const sidebarW = 'lg:pl-60'

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarW} transition-all duration-300`}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Chatbot */}
      <AIChatbotModal />
    </div>
  )
}
