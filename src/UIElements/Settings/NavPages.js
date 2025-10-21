
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuUser2 } from 'react-icons/lu';
import { FiKey } from 'react-icons/fi';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { FaBarsStaggered} from 'react-icons/fa6';

const NavPage = ({ activeTab, handleTabChange }) => {
  return (
    <div className="button-box p-3 rounded">
      <NavLink
        to="/Settings/Profile"
        className={`d-flex align-items-center p-2 rounded author ${activeTab === 'profile' ? 'active1' : ''}`}
        onClick={() => handleTabChange('profile')}
      >
        <LuUser2 width={16} height={16} className="me-3 nav-icon" /> Profile
      </NavLink>
      <NavLink
        to="/Settings/UpdatePassword"
        className={`d-flex align-items-center p-2 rounded author ${activeTab === 'UpdatePassword' ? 'active1' : ''}`}
        onClick={() => handleTabChange('UpdatePassword')}
      >
        <FiKey width={16} height={16} className="me-3 nav-icon" /> Change Password
      </NavLink>
    </div>
  );
};

export default NavPage;