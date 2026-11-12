import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineShieldExclamation,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineQrCode,
} from 'react-icons/hi2'

import { useState } from 'react'


const adminNav = [
  {
    label: 'Dashboard',
    icon: HiOutlineSquares2X2,
    to: '/admin',
  },
  {
    label: 'Students',
    icon: HiOutlineUsers,
    to: '/students',
  },
  {
    label: 'Teachers',
    icon: HiOutlineAcademicCap,
    to: '/teachers',
  },
  {
    label: 'Subjects',
    icon: HiOutlineBookOpen,
    to: '/subjects',
  },
  {
    label: 'AI Watchlist',
    icon: HiOutlineShieldExclamation,
    to: '/watchlist',
  },
  {
    label: 'Sessions',
    icon: HiOutlineCalendarDays,
    to: '/sessions',
  },
  {
    label: 'Penalties',
    icon: HiOutlineExclamationTriangle,
    to: '/penalties',
  },
]


const teacherNav = [
  {
    label: 'Dashboard',
    icon: HiOutlineSquares2X2,
    to: '/teacher',
  },
  {
    label: 'My Sessions',
    icon: HiOutlineCalendarDays,
    to: '/sessions',
  },
]


// STUDENT NAVIGATION
const studentNav = [
  {
    label: 'Dashboard',
    icon: HiOutlineSquares2X2,
    to: '/student',
  },

  {
    label: 'Scan Attendance',
    icon: HiOutlineQrCode,
    to: '/student/scan',
  },
]


const navByRole = {
  admin: adminNav,
  teacher: teacherNav,
  student: studentNav,
}


export default function Sidebar({
  mobileOpen,
  onClose,
}) {

  const { user, logout } = useAuth()

  const navigate = useNavigate()

  const [collapsed, setCollapsed] =
    useState(false)

  const nav =
    navByRole[user?.role] || adminNav


  const handleLogout = () => {
    logout()

    navigate('/login')
  }


  return (
    <>

      {/* Mobile Overlay */}

      {mobileOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-40
            lg:hidden
          "
          onClick={onClose}
        />

      )}


      {/* Sidebar */}

      <aside
        className={`
          fixed
          top-0
          left-0
          h-screen
          z-50
          flex
          flex-col
          bg-sidebar
          transition-all
          duration-300

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }

          ${
            collapsed
              ? 'w-16'
              : 'w-60'
          }
        `}
      >


        {/* Logo */}

        <div
          className={`
            flex
            items-center
            h-16
            px-4
            border-b
            border-white/10
            flex-shrink-0

            ${
              collapsed
                ? 'justify-center'
                : 'justify-between'
            }
          `}
        >

          {!collapsed && (

            <div className="flex items-center gap-2.5">

              <div
                className="
                  w-7
                  h-7
                  rounded-lg
                  bg-primary-600
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
              >

                <span
                  className="
                    text-white
                    text-xs
                    font-bold
                    font-display
                  "
                >
                  IA
                </span>

              </div>


              <div>

                <p
                  className="
                    text-white
                    font-display
                    font-bold
                    text-sm
                    leading-tight
                  "
                >
                  IntelliAttend
                </p>

                <p
                  className="
                    text-slate-500
                    text-[10px]
                    uppercase
                    tracking-widest
                  "
                >
                  AI Platform
                </p>

              </div>

            </div>

          )}


          {collapsed && (

            <div
              className="
                w-7
                h-7
                rounded-lg
                bg-primary-600
                flex
                items-center
                justify-center
              "
            >

              <span
                className="
                  text-white
                  text-xs
                  font-bold
                  font-display
                "
              >
                IA
              </span>

            </div>

          )}


          {/* Collapse Button */}

          <button
            onClick={() =>
              setCollapsed(!collapsed)
            }

            className="
              hidden
              lg:flex
              w-6
              h-6
              rounded-md
              hover:bg-white/10
              items-center
              justify-center
              text-slate-400
              hover:text-white
              transition-colors
            "
          >

            {collapsed ? (

              <HiOutlineChevronRight size={13} />

            ) : (

              <HiOutlineChevronLeft size={13} />

            )}

          </button>

        </div>


        {/* User Information */}

        {!collapsed && user && (

          <div
            className="
              mx-3
              mt-4
              px-3
              py-2.5
              rounded-lg
              bg-white/5
              border
              border-white/10
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-7
                h-7
                rounded-full
                bg-primary-600
                flex
                items-center
                justify-center
                text-white
                text-xs
                font-bold
                flex-shrink-0
              "
            >
              {user.avatar}
            </div>


            <div className="min-w-0">

              <p
                className="
                  text-white
                  text-xs
                  font-medium
                  truncate
                "
              >
                {user.name}
              </p>

              <p
                className="
                  text-slate-400
                  text-[10px]
                  capitalize
                "
              >
                {user.role}
              </p>

            </div>

          </div>

        )}


        {/* Navigation */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-2
            py-4
            space-y-0.5
          "
        >

          {!collapsed && (

            <p
              className="
                text-slate-600
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                px-3
                mb-2
              "
            >
              Navigation
            </p>

          )}


          {nav.map((item) => (

            <NavLink
              key={item.to}

              to={item.to}

              end={
                item.to.split('/').length === 2
              }

              className={({ isActive }) =>
                `
                  nav-item
                  ${isActive ? 'active' : ''}
                  ${
                    collapsed
                      ? 'justify-center px-0'
                      : ''
                  }
                `
              }

              title={
                collapsed
                  ? item.label
                  : ''
              }

              onClick={onClose}
            >

              <item.icon
                size={18}
                className="flex-shrink-0"
              />

              {!collapsed && (
                <span>
                  {item.label}
                </span>
              )}

            </NavLink>

          ))}

        </nav>


        {/* Logout */}

        <div
          className="
            px-2
            pb-4
            border-t
            border-white/10
            pt-3
          "
        >

          <button
            onClick={handleLogout}

            className={`
              nav-item
              w-full

              ${
                collapsed
                  ? 'justify-center px-0'
                  : ''
              }

              text-red-400
              hover:text-red-300
              hover:bg-red-500/10
            `}

            title={
              collapsed
                ? 'Logout'
                : ''
            }
          >

            <HiOutlineArrowRightOnRectangle
              size={18}
              className="flex-shrink-0"
            />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>

    </>
  )
}