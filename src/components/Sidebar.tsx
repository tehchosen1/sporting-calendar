import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li>Global Calendar</li>
          {/* Add more menu items here */}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
