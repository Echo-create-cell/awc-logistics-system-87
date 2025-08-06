
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { Settings, Users, Bell, Shield, Database, Monitor, Trash2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SettingsView = () => {
  const { user } = useAuth();
  const { users, quotations, invoices } = useAppData();
  const { toast } = useToast();
  
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'AWC Logistics',
    systemEmail: 'system@awclogistics.com',
    defaultCurrency: 'USD',
    taxRate: 18,
    autoApproval: false,
    emailNotifications: true,
    systemMaintenance: false,
    dataRetention: '365',
    maxQuotationAmount: '1000000',
    requireApproval: true,
    backupInterval: 'weekly',
    autoBackup: true,
    lastBackupDate: new Date().toISOString().split('T')[0]
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    sessionTimeout: 30,
    twoFactorAuth: false,
    loginAttempts: 5,
    passwordExpiry: 90
  });

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Update last backup date if backup settings changed
    if (systemSettings.autoBackup) {
      setSystemSettings(prev => ({ 
        ...prev, 
        lastBackupDate: new Date().toISOString().split('T')[0] 
      }));
    }
    
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleDataReset = () => {
    // Reset operational data while preserving system settings
    const resetData = {
      quotations: [],
      invoices: [],
      resetDate: new Date().toISOString()
    };
    
    // In a real system, this would make an API call to reset data
    toast({
      title: "Data Reset Complete",
      description: "All operational data has been cleared. Storage optimized.",
      variant: "destructive"
    });
  };

  const getStorageInfo = () => {
    const totalRecords = quotations.length + invoices.length + users.length;
    const estimatedSize = (totalRecords * 2).toFixed(1); // Rough estimate in KB
    return { totalRecords, estimatedSize };
  };

  const storageInfo = getStorageInfo();

  const handleSystemBackup = () => {
    const backupData = {
      users: users.map(u => ({ ...u, password: '[REDACTED]' })),
      quotations,
      invoices,
      systemSettings,
      securitySettings,
      backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `awc-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Backup Created",
      description: "System backup has been downloaded successfully.",
    });
  };

  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === 'pending').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length
  };

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Badge variant="outline" className="capitalize">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
        <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}/{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.pendingQuotations}</div>
            <p className="text-xs text-muted-foreground">Quotations pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* General System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input 
                value={systemSettings.companyName}
                onChange={(e) => handleSystemSettingChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>System Email</Label>
              <Input 
                value={systemSettings.systemEmail}
                onChange={(e) => handleSystemSettingChange('systemEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input 
                value={systemSettings.defaultCurrency}
                onChange={(e) => handleSystemSettingChange('defaultCurrency', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input 
                type="number"
                value={systemSettings.taxRate}
                onChange={(e) => handleSystemSettingChange('taxRate', Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approval for small quotations</Label>
                <p className="text-sm text-muted-foreground">Automatically approve quotations under $10,000</p>
              </div>
              <Switch 
                checked={systemSettings.autoApproval}
                onCheckedChange={(checked) => handleSystemSettingChange('autoApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
              </div>
              <Switch 
                checked={systemSettings.emailNotifications}
                onCheckedChange={(checked) => handleSystemSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-muted-foreground">All quotations require admin approval</p>
              </div>
              <Switch 
                checked={systemSettings.requireApproval}
                onCheckedChange={(checked) => handleSystemSettingChange('requireApproval', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum Password Length</Label>
              <Input 
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => handleSecuritySettingChange('passwordMinLength', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input 
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecuritySettingChange('sessionTimeout', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input 
                type="number"
                value={securitySettings.loginAttempts}
                onChange={(e) => handleSecuritySettingChange('loginAttempts', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password Expiry (days)</Label>
              <Input 
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) => handleSecuritySettingChange('passwordExpiry', Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
            </div>
            <Switch 
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorAuth', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Information */}
          <div className="bg-muted/20 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4" />
              <Label className="text-sm font-medium">Storage Usage</Label>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Records:</span>
                <span className="ml-2 font-medium">{storageInfo.totalRecords}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Size:</span>
                <span className="ml-2 font-medium">{storageInfo.estimatedSize} KB</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data Retention (days)</Label>
              <Input 
                value={systemSettings.dataRetention}
                onChange={(e) => handleSystemSettingChange('dataRetention', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Quotation Amount</Label>
              <Input 
                value={systemSettings.maxQuotationAmount}
                onChange={(e) => handleSystemSettingChange('maxQuotationAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Backup Interval</Label>
              <Select 
                value={systemSettings.backupInterval} 
                onValueChange={(value) => handleSystemSettingChange('backupInterval', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Last Backup Date</Label>
              <Input 
                value={systemSettings.lastBackupDate}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Enable automatic backups based on selected interval</p>
              </div>
              <Switch 
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => handleSystemSettingChange('autoBackup', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
              </div>
              <Switch 
                checked={systemSettings.systemMaintenance}
                onCheckedChange={(checked) => handleSystemSettingChange('systemMaintenance', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Admin-Only Critical Actions */}
          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <Label className="text-sm font-medium text-destructive">Critical System Actions</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These actions are irreversible and should only be performed by system administrators.
            </p>
            
            <div className="flex gap-4">
              <Button onClick={handleSystemBackup} variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Operational Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all quotations, invoices, and operational data. 
                      System settings and user accounts will be preserved. This cannot be undone.
                      <br /><br />
                      <strong>Current Storage: {storageInfo.totalRecords} records ({storageInfo.estimatedSize} KB)</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDataReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleSaveSettings}>
                Save All Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
