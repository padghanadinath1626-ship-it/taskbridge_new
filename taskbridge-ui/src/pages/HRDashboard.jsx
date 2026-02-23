import React, { useState } from 'react';
import './HRDashboard.css';
import AttendancePanel from '../components/HRComponents/AttendancePanel';
import LeavePanel from '../components/HRComponents/LeavePanel';
import SalaryPanel from '../components/HRComponents/SalaryPanel';
import RosterPanel from '../components/HRComponents/RosterPanel';
import NoticePanel from '../components/HRComponents/NoticePanel';

export const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance':
        return <AttendancePanel />;
      case 'leaves':
        return <LeavePanel />;
      case 'salary':
        return <SalaryPanel />;
      case 'roster':
        return <RosterPanel />;
      case 'notices':
        return <NoticePanel />;
      default:
        return <AttendancePanel />;
    }
  };

  return (
    <div className="hr-dashboard">
      <h1>HR Dashboard</h1>
      
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📋 Attendance
        </button>
        <button 
          className={`tab-button ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          📅 Leaves
        </button>
        <button 
          className={`tab-button ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          💰 Salary
        </button>
        <button 
          className={`tab-button ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          📊 Roster
        </button>
        <button 
          className={`tab-button ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          📧 Notices
        </button>
      </div>

      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default HRDashboard;
