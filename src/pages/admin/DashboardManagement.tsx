
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  DashboardSettings,
  getDashboardConfigs,
  createDashboardConfig,
  updateDashboardConfig,
  deleteDashboardConfig,
  getWidgetUsageStats,
  initializeDefaultDashboards
} from '@/utils/dashboardUtils';
import { 
  LayoutDashboard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  LayoutGrid, 
  Layers, 
  Loader2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IDashboardWidget } from '@/models/DashboardConfig';

const DashboardManagement = () => {
  const [dashboards, setDashboards] = useState<DashboardSettings[]>([]);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student'>('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [widgetStats, setWidgetStats] = useState<Record<string, number>>({
    card: 0,
    chart: 0,
    table: 0,
    list: 0
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDashboardDialogOpen, setIsNewDashboardDialogOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardSettings | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layout: 'grid' as 'grid' | 'flex',
    isDefault: false
  });

  useEffect(() => {
    // Initialize default dashboards and load data
    const init = async () => {
      await initializeDefaultDashboards();
      loadDashboards();
      loadWidgetStats();
    };
    
    init();
  }, []);

  useEffect(() => {
    loadDashboards();
  }, [selectedRole]);

  const loadDashboards = async () => {
    setIsLoading(true);
    try {
      const configs = await getDashboardConfigs(selectedRole);
      setDashboards(configs);
    } catch (error) {
      console.error('Failed to load dashboard configurations:', error);
      toast.error('Failed to load dashboard configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWidgetStats = async () => {
    try {
      const stats = await getWidgetUsageStats();
      setWidgetStats(stats);
    } catch (error) {
      console.error('Failed to load widget statistics:', error);
    }
  };

  const handleEditDashboard = (dashboard: DashboardSettings) => {
    setSelectedDashboard(dashboard);
    setFormData({
      name: dashboard.name,
      description: dashboard.description,
      layout: dashboard.layout,
      isDefault: dashboard.isDefault
    });
    setIsEditDialogOpen(true);
  };

  const handleNewDashboard = () => {
    setFormData({
      name: '',
      description: '',
      layout: 'grid',
      isDefault: false
    });
    setIsNewDashboardDialogOpen(true);
  };

  const handleDeleteDashboard = async (dashboard: DashboardSettings) => {
    try {
      if (dashboard.isDefault) {
        toast.error("Cannot delete the default dashboard");
        return;
      }
      
      const success = await deleteDashboardConfig(dashboard.id);
      if (success) {
        toast.success("Dashboard deleted successfully");
        loadDashboards();
        loadWidgetStats();
      } else {
        toast.error("Failed to delete dashboard");
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast.error("Error deleting dashboard");
    }
  };

  const handleSaveDashboard = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Dashboard name is required");
        return;
      }
      
      if (selectedDashboard) {
        // Update existing dashboard
        const updated = await updateDashboardConfig(selectedDashboard.id, formData);
        if (updated) {
          toast.success("Dashboard updated successfully");
          setIsEditDialogOpen(false);
          loadDashboards();
        }
      } else {
        // Create new dashboard
        const newDashboard: Omit<DashboardSettings, 'id' | 'createdAt' | 'updatedAt'> = {
          ...formData,
          role: selectedRole,
          widgets: []
        };
        
        await createDashboardConfig(newDashboard);
        toast.success("Dashboard created successfully");
        setIsNewDashboardDialogOpen(false);
        loadDashboards();
      }
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error("Error saving dashboard");
    }
  };

  const handleSetAsDefault = async (dashboard: DashboardSettings) => {
    try {
      if (dashboard.isDefault) return;
      
      const updated = await updateDashboardConfig(dashboard.id, { isDefault: true });
      if (updated) {
        toast.success(`"${dashboard.name}" set as default dashboard`);
        loadDashboards();
      }
    } catch (error) {
      console.error('Error setting default dashboard:', error);
      toast.error("Error setting default dashboard");
    }
  };

  return (
    <DashboardLayout userRole="admin" pageTitle="Dashboard Management">
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboards.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All dashboard configurations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Card Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgetStats.card || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Simple metric cards
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Table Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgetStats.table || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Data tables in use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Chart Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgetStats.chart || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Data visualizations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <Tabs
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as 'admin' | 'teacher' | 'student')}
          className="w-full max-w-md"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="student">Student</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleNewDashboard}>
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading dashboards...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <LayoutDashboard className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No dashboards found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first dashboard for {selectedRole}s
              </p>
              <Button onClick={handleNewDashboard} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </div>
          ) : (
            dashboards.map((dashboard) => (
              <Card key={dashboard.id} className={dashboard.isDefault ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{dashboard.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {dashboard.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    {dashboard.isDefault && (
                      <Badge className="bg-primary">Default</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Layout:</span>
                      <span className="font-medium flex items-center">
                        {dashboard.layout === 'grid' ? (
                          <>
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Grid
                          </>
                        ) : (
                          <>
                            <Layers className="h-4 w-4 mr-1" />
                            Flex
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Widgets:</span>
                      <span className="font-medium">{dashboard.widgets.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(dashboard.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditDashboard(dashboard)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteDashboard(dashboard)}
                      disabled={dashboard.isDefault}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={dashboard.isDefault}
                      onClick={() => handleSetAsDefault(dashboard)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dashboard Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
            <DialogDescription>
              Modify the dashboard configuration for {selectedRole}s.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout">Layout Type</Label>
              <Select
                value={formData.layout}
                onValueChange={(value) => setFormData({...formData, layout: value as 'grid' | 'flex'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                  <SelectItem value="flex">Flex Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({...formData, isDefault: checked})}
              />
              <Label htmlFor="isDefault">Set as default dashboard</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDashboard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dashboard Dialog */}
      <Dialog open={isNewDashboardDialogOpen} onOpenChange={setIsNewDashboardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>
              Create a new dashboard configuration for {selectedRole}s.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Dashboard Name</Label>
              <Input
                id="new-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Input
                id="new-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-layout">Layout Type</Label>
              <Select
                value={formData.layout}
                onValueChange={(value) => setFormData({...formData, layout: value as 'grid' | 'flex'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                  <SelectItem value="flex">Flex Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({...formData, isDefault: checked})}
              />
              <Label htmlFor="new-isDefault">Set as default dashboard</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDashboardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDashboard}>Create Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DashboardManagement;
