
import { IDashboardConfig, IDashboardWidget } from '@/models/DashboardConfig';

// Type for dashboard settings in localStorage
export interface DashboardSettings {
  id: string;
  name: string;
  description: string;
  layout: 'grid' | 'flex';
  role: 'admin' | 'teacher' | 'student';
  widgets: IDashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all dashboard configs for a specific role
export const getDashboardConfigs = async (role: 'admin' | 'teacher' | 'student'): Promise<DashboardSettings[]> => {
  return new Promise<DashboardSettings[]>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      const roleDashboards = dashboards.filter((dashboard: DashboardSettings) => 
        dashboard.role === role
      );
      resolve(roleDashboards);
    }, 500);
  });
};

// Get default dashboard for a role
export const getDefaultDashboard = async (role: 'admin' | 'teacher' | 'student'): Promise<DashboardSettings | null> => {
  return new Promise<DashboardSettings | null>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      const defaultDashboard = dashboards.find((dashboard: DashboardSettings) => 
        dashboard.role === role && dashboard.isDefault
      );
      resolve(defaultDashboard || null);
    }, 500);
  });
};

// Create a new dashboard config
export const createDashboardConfig = async (dashboardConfig: Omit<DashboardSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<DashboardSettings> => {
  return new Promise<DashboardSettings>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      
      // Create new dashboard with ID and timestamps
      const newDashboard: DashboardSettings = {
        ...dashboardConfig,
        id: `dashboard_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If this is set as default, update other dashboards for the role
      if (newDashboard.isDefault) {
        for (let i = 0; i < dashboards.length; i++) {
          if (dashboards[i].role === newDashboard.role && dashboards[i].isDefault) {
            dashboards[i].isDefault = false;
          }
        }
      }
      
      dashboards.push(newDashboard);
      localStorage.setItem('dashboardConfigs', JSON.stringify(dashboards));
      
      resolve(newDashboard);
    }, 500);
  });
};

// Update a dashboard config
export const updateDashboardConfig = async (id: string, updates: Partial<DashboardSettings>): Promise<DashboardSettings | null> => {
  return new Promise<DashboardSettings | null>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      const dashboardIndex = dashboards.findIndex((dashboard: DashboardSettings) => dashboard.id === id);
      
      if (dashboardIndex === -1) {
        resolve(null);
        return;
      }
      
      // If setting this as default, update other dashboards
      if (updates.isDefault && updates.isDefault !== dashboards[dashboardIndex].isDefault) {
        const role = dashboards[dashboardIndex].role;
        for (let i = 0; i < dashboards.length; i++) {
          if (dashboards[i].role === role && dashboards[i].isDefault && dashboards[i].id !== id) {
            dashboards[i].isDefault = false;
          }
        }
      }
      
      // Update the dashboard
      dashboards[dashboardIndex] = {
        ...dashboards[dashboardIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('dashboardConfigs', JSON.stringify(dashboards));
      resolve(dashboards[dashboardIndex]);
    }, 500);
  });
};

// Delete a dashboard config
export const deleteDashboardConfig = async (id: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      const dashboardIndex = dashboards.findIndex((dashboard: DashboardSettings) => dashboard.id === id);
      
      if (dashboardIndex === -1) {
        resolve(false);
        return;
      }
      
      // Check if it's the default dashboard
      if (dashboards[dashboardIndex].isDefault) {
        // Don't allow deleting the default dashboard
        resolve(false);
        return;
      }
      
      dashboards.splice(dashboardIndex, 1);
      localStorage.setItem('dashboardConfigs', JSON.stringify(dashboards));
      resolve(true);
    }, 500);
  });
};

// Get widget statistics (for dashboard management)
export const getWidgetUsageStats = async (): Promise<Record<string, number>> => {
  return new Promise<Record<string, number>>((resolve) => {
    setTimeout(() => {
      const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
      const stats: Record<string, number> = {
        card: 0,
        chart: 0,
        table: 0,
        list: 0
      };
      
      dashboards.forEach((dashboard: DashboardSettings) => {
        dashboard.widgets.forEach((widget: IDashboardWidget) => {
          if (stats[widget.type] !== undefined) {
            stats[widget.type]++;
          }
        });
      });
      
      resolve(stats);
    }, 500);
  });
};

// Initialize with default dashboards if none exist
export const initializeDefaultDashboards = async (): Promise<void> => {
  const dashboards = JSON.parse(localStorage.getItem('dashboardConfigs') || '[]');
  
  if (dashboards.length === 0) {
    // Create default dashboards for each role
    const defaultDashboards: Omit<DashboardSettings, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Admin default dashboard
      {
        name: 'Admin Overview',
        description: 'Default admin dashboard showing system statistics',
        layout: 'grid',
        role: 'admin',
        isDefault: true,
        widgets: [
          {
            id: 'total-users',
            title: 'Total Users',
            type: 'card',
            dataSource: 'user-count',
            position: { x: 0, y: 0, w: 1, h: 1 },
            settings: {},
            isActive: true
          },
          {
            id: 'active-students',
            title: 'Active Students',
            type: 'card',
            dataSource: 'student-count',
            position: { x: 1, y: 0, w: 1, h: 1 },
            settings: {},
            isActive: true
          },
          {
            id: 'faculty-members',
            title: 'Faculty Members',
            type: 'card',
            dataSource: 'faculty-count',
            position: { x: 2, y: 0, w: 1, h: 1 },
            settings: {},
            isActive: true
          },
          {
            id: 'verification-requests',
            title: 'Verification Requests',
            type: 'table',
            dataSource: 'verification-requests',
            position: { x: 0, y: 1, w: 3, h: 2 },
            settings: {},
            isActive: true
          }
        ]
      },
      // Teacher default dashboard
      {
        name: 'Teacher Overview',
        description: 'Default teacher dashboard showing class information',
        layout: 'grid',
        role: 'teacher',
        isDefault: true,
        widgets: [
          {
            id: 'my-students',
            title: 'My Students',
            type: 'card',
            dataSource: 'student-count-by-teacher',
            position: { x: 0, y: 0, w: 1, h: 1 },
            settings: {},
            isActive: true
          },
          {
            id: 'student-verification',
            title: 'Student Verification',
            type: 'table',
            dataSource: 'student-verification-requests',
            position: { x: 0, y: 1, w: 3, h: 2 },
            settings: {},
            isActive: true
          }
        ]
      },
      // Student default dashboard
      {
        name: 'Student Overview',
        description: 'Default student dashboard showing course information',
        layout: 'grid',
        role: 'student',
        isDefault: true,
        widgets: [
          {
            id: 'my-profile',
            title: 'My Profile',
            type: 'card',
            dataSource: 'student-profile',
            position: { x: 0, y: 0, w: 1, h: 1 },
            settings: {},
            isActive: true
          },
          {
            id: 'my-marks',
            title: 'My Marks',
            type: 'table',
            dataSource: 'student-marks',
            position: { x: 0, y: 1, w: 3, h: 2 },
            settings: {},
            isActive: true
          }
        ]
      }
    ];
    
    // Add each default dashboard
    for (const dashboard of defaultDashboards) {
      await createDashboardConfig(dashboard);
    }
  }
};
