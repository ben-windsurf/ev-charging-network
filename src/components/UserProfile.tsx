import { ArrowLeft, User, Zap, Clock, DollarSign, TrendingUp, Settings, CreditCard } from 'lucide-react'

interface UserProfileProps {
  onBack: () => void
}

export default function UserProfile({ onBack }: UserProfileProps) {
  // User data
  const userData = {
    name: 'Ben Lehrburger',
    email: 'ben.lehrburger@windsurf.com',
    memberSince: 'January 2024',
    totalSessions: 47,
    totalEnergy: 1250, // kWh
    totalCost: 437.50,
    carbonSaved: 890, // lbs CO2
    favoriteStation: 'Downtown Plaza'
  }

  const recentSessions = [
    {
      id: '1',
      station: 'Downtown Plaza',
      date: '2024-08-20',
      duration: '45 min',
      energy: 28.5,
      cost: 9.98
    },
    {
      id: '2',
      station: 'Beach Resort',
      date: '2024-08-18',
      duration: '52 min',
      energy: 32.1,
      cost: 12.20
    },
    {
      id: '3',
      station: 'Airport Terminal',
      date: '2024-08-15',
      duration: '38 min',
      energy: 24.8,
      cost: 10.42
    }
  ]

  return (
    <div className="user-profile">
      {/* Header */}
      <div className="profile-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2 className="profile-title">Profile</h2>
        <button className="settings-button">
          <Settings size={20} />
        </button>
      </div>

      {/* User Info Card */}
      <div className="profile-card">
        <div className="user-avatar">
          <User size={48} className="text-gray-400" />
        </div>
        <div className="user-info">
          <h3 className="user-name">{userData.name}</h3>
          <p className="user-email">{userData.email}</p>
          <p className="member-since">Member since {userData.memberSince}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Zap className="text-blue-600" size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userData.totalSessions}</span>
            <span className="stat-label">Charging Sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userData.totalEnergy.toLocaleString()}</span>
            <span className="stat-label">kWh Charged</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign className="text-orange-500" size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">${userData.totalCost}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock className="text-purple-600" size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userData.carbonSaved}</span>
            <span className="stat-label">lbs CO₂ Saved</span>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h3 className="section-title">Recent Charging Sessions</h3>
        <div className="sessions-list">
          {recentSessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h4 className="session-station">{session.station}</h4>
                <span className="session-date">{session.date}</span>
              </div>
              <div className="session-details">
                <div className="session-metric">
                  <Clock size={16} className="text-gray-500" />
                  <span>{session.duration}</span>
                </div>
                <div className="session-metric">
                  <Zap size={16} className="text-blue-600" />
                  <span>{session.energy} kWh</span>
                </div>
                <div className="session-metric">
                  <DollarSign size={16} className="text-green-600" />
                  <span>${session.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="account-actions">
        <button className="action-button">
          <CreditCard size={20} />
          <span>Payment Methods</span>
        </button>
        <button className="action-button">
          <Settings size={20} />
          <span>Account Settings</span>
        </button>
        <button className="action-button">
          <TrendingUp size={20} />
          <span>Usage Reports</span>
        </button>
      </div>

      {/* Favorite Station */}
      <div className="favorite-station">
        <h3 className="section-title">Favorite Station</h3>
        <div className="favorite-card">
          <Zap className="text-blue-600" size={24} />
          <div>
            <h4>{userData.favoriteStation}</h4>
            <p className="text-gray-600">Most frequently used station</p>
          </div>
        </div>
      </div>
    </div>
  )
}
