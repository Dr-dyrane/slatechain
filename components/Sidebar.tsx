import React from 'react'
import Link from 'next/link'
import { Home, BarChart2, ShoppingCart, Truck, Users, Settings } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Inventory', href: '/inventory', icon: BarChart2 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Logistics', href: '/logistics', icon: Truck },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const SidebarItem = React.memo(({ item }: { item: typeof navItems[0] }) => (
  <li>
    <Link 
      href={item.href} 
      className="flex items-center p-2 text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <item.icon className="w-5 h-5 mr-2" aria-hidden="true" />
      <span>{item.name}</span>
    </Link>
  </li>
))

SidebarItem.displayName = 'SidebarItem'

export const Sidebar = React.memo(function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-background border-r" aria-label="Sidebar">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  )
})
