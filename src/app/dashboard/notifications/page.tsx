"use client";

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { 
  Bell, 
  BellRing, 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  MoreVertical,
  Trash2,
  Check,
  Settings
} from 'lucide-react';

// Type definitions
interface Notification {
  id: number;
  type: 'appointment' | 'patient_update' | 'lab_result' | 'prescription' | 'emergency' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  patientName?: string;
  patientId?: number;
  actionRequired?: boolean;
}

type NotificationFilter = 'all' | 'unread' | 'appointment' | 'patient_update' | 'lab_result' | 'prescription' | 'emergency' | 'system';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'emergency',
      title: 'Emergency Alert',
      message: 'Patient John Doe (ID: 12345) has been admitted to ER with chest pain',
      timestamp: '2 minutes ago',
      isRead: false,
      priority: 'urgent',
      patientName: 'John Doe',
      patientId: 12345,
      actionRequired: true
    },
    {
      id: 2,
      type: 'lab_result',
      title: 'Lab Results Available',
      message: 'Blood work results for Sarah Johnson are ready for review',
      timestamp: '15 minutes ago',
      isRead: false,
      priority: 'high',
      patientName: 'Sarah Johnson',
      patientId: 12346,
      actionRequired: true
    },
    {
      id: 3,
      type: 'appointment',
      title: 'Upcoming Appointment',
      message: 'Appointment with Michael Chen scheduled for 2:00 PM today',
      timestamp: '1 hour ago',
      isRead: false,
      priority: 'medium',
      patientName: 'Michael Chen',
      patientId: 12347,
      actionRequired: false
    },
    {
      id: 4,
      type: 'patient_update',
      title: 'Patient Update',
      message: 'Emily Davis has updated her symptoms in the patient portal',
      timestamp: '2 hours ago',
      isRead: true,
      priority: 'medium',
      patientName: 'Emily Davis',
      patientId: 12348,
      actionRequired: true
    },
    {
      id: 5,
      type: 'prescription',
      title: 'Prescription Refill Request',
      message: 'Robert Wilson has requested a refill for Lisinopril',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'low',
      patientName: 'Robert Wilson',
      patientId: 12349,
      actionRequired: true
    },
    {
      id: 6,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 11 PM to 2 AM',
      timestamp: '1 day ago',
      isRead: false,
      priority: 'low',
      actionRequired: false
    },
    {
      id: 7,
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: 'Lisa Wang has cancelled her appointment for tomorrow',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'medium',
      patientName: 'Lisa Wang',
      patientId: 12350,
      actionRequired: false
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']): React.JSX.Element => {
    const iconClass = priority === 'urgent' ? 'text-red-500' : 
                     priority === 'high' ? 'text-orange-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 'text-blue-500';

    switch (type) {
      case 'emergency':
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />;
      case 'lab_result':
        return <CheckCircle className={`w-5 h-5 ${iconClass}`} />;
      case 'appointment':
        return <Calendar className={`w-5 h-5 ${iconClass}`} />;
      case 'patient_update':
        return <User className={`w-5 h-5 ${iconClass}`} />;
      case 'prescription':
        return <Clock className={`w-5 h-5 ${iconClass}`} />;
      case 'system':
        return <Settings className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']): React.JSX.Element => {
    const badgeClass = priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.patientName && notification.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (notificationId: number): void => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = (): void => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: number): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleBulkAction = (action: 'read' | 'delete'): void => {
    if (action === 'read') {
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } else if (action === 'delete') {
      setNotifications(prev => 
        prev.filter(notification => !selectedNotifications.includes(notification.id))
      );
    }
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (notificationId: number): void => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilter: NotificationFilter): void => {
    setFilter(newFilter);
  };

  return (
    <>
    <DashboardLayout>
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellRing className="w-8 h-8 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications are read'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 text-sm bg-destructive text-white rounded-md hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value as NotificationFilter)}
                className="px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="emergency">Emergency</option>
                <option value="lab_result">Lab Results</option>
                <option value="appointment">Appointments</option>
                <option value="patient_update">Patient Updates</option>
                <option value="prescription">Prescriptions</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search or filter criteria.' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`bg-card rounded-lg border border-border p-4 transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-primary' : ''
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {getPriorityBadge(notification.priority)}
                          {notification.actionRequired && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'} mb-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp}</span>
                          </span>
                          {notification.patientName && (
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{notification.patientName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 hover:bg-accent rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 hover:bg-accent rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded-full transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </DashboardLayout>
    </>
  );
};

export default NotificationsPage;