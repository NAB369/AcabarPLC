'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Box, 
  Users, 
  Home, 
  Package, 
  ShoppingCart, 
  Tag, 
  Truck, 
  SlidersHorizontal, 
  Warehouse,
  BarChart2,
  DollarSign,
  Briefcase,
  Users2,
  FileText,
  PieChart,
  ChevronLeft
} from 'lucide-react';
import './Sidebar.css';

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  hasSubmenu?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { name: 'Superadmin', icon: <ShieldAlert size={20} />, path: '#', hasSubmenu: true },
  { name: 'Manage Modules', icon: <Box size={20} />, path: '#' },
  { name: 'User Management', icon: <Users size={20} />, path: '#', hasSubmenu: true },
  { name: 'Contacts', icon: <Home size={20} />, path: '#', hasSubmenu: true },
  { name: 'Products', icon: <Package size={20} />, path: '#', hasSubmenu: true },
  { name: 'Purchases', icon: <ShoppingCart size={20} />, path: '#', hasSubmenu: true },
  { name: 'Sell', icon: <Tag size={20} />, path: '#', hasSubmenu: true },
  { name: 'Stock Transfers', icon: <Truck size={20} />, path: '#', hasSubmenu: true },
  { name: 'Stock Adjustment', icon: <SlidersHorizontal size={20} />, path: '#', hasSubmenu: true },
  { name: 'Warehouse', icon: <Warehouse size={20} />, path: '#', hasSubmenu: true },
  { name: 'Inventory Dashboard', icon: <BarChart2 size={20} />, path: '#' },
  { name: 'Expenses', icon: <DollarSign size={20} />, path: '#', hasSubmenu: true },
  { name: 'Payment Account', icon: <Briefcase size={20} />, path: '#', hasSubmenu: true },
  { name: 'HR & KPI', icon: <Users2 size={20} />, path: '#', hasSubmenu: true },
  { name: 'Accounting', icon: <FileText size={20} />, path: '#', hasSubmenu: true },
  { name: 'General Report', icon: <PieChart size={20} />, path: '#', hasSubmenu: true },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <aside className="pos-sidebar">
      <div className="pos-sidebar-header">
        <div className="pos-logo-icon">BP</div>
        <div className="pos-brand">
          <span className="pos-brand-title">BillPosware</span>
          <span className="pos-brand-subtitle">Fast • Simple • Reliable</span>
        </div>
      </div>

      <nav>
        <ul className="pos-menu-list">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.path}
                className={`pos-menu-item ${activeItem === item.name ? 'active' : ''}`}
                onClick={() => setActiveItem(item.name)}
              >
                <span className="pos-menu-icon">{item.icon}</span>
                <span className="pos-menu-text">{item.name}</span>
                {item.hasSubmenu && (
                  <span className="pos-menu-arrow">
                    <ChevronLeft size={16} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
