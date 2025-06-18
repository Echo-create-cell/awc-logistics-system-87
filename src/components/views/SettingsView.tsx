
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Database, Mail, FileText, Users } from 'lucide-react';

const SettingsView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'AWC Logistics',
    companyAddress: '123 Business Avenue, Kigali, Rwanda',
    companyPhone: '+250 788 123 456',
    companyEmail: 'admin@awclogistics.com',
    companyTin: 'TIN123456789',
    allowUserRegistration: false,
    requireApprovalForQuotations: true,
    autoGenerateInvoiceNumbers: true,
    defaultCurrency: 'USD',
    emailNotifications: true,
    smsNotifications: false,
    backupFrequency: 'daily',
    dataRetentionPeriod: '365',
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableTwoFactor: false,
    sessionTimeout: 480, // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
  });

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: "All system settings have been updated successfully.",
    });
  };

  const handleBackupDatabase = () => {
    // In a real app, this would trigger a database backup
    toast({
      title: "Backup Initiated",
      description: "Database backup has been started. You will be notified when complete.",
    });
  };

  const handleTestEmail = () => {
    // In a real app, this would send a test email
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify email configuration.",
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground">Only administrators can access system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
          <p className="text-muted-foreground mt-1">Manage system configuration and preferences</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield size={14} className="mr-1" />
          Admin Only
        </Badge>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={systemSettings.companyName}
                onChange={(e) => handleSystemSettingChange('companyName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={systemSettings.companyEmail}
                onChange={(e) => handleSystemSettingChange('companyEmail', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Company Phone</Label>
              <Input
                id="companyPhone"
                value={systemSettings.companyPhone}
                onChange={(e) => handleSystemSettingChange('companyPhone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyTin">Company TIN</Label>
              <Input
                id="companyTin"
                value={systemSettings.companyTin}
                onChange={(e) => handleSystemSettingChange('companyTin', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea
              id="companyAddress"
              value={systemSettings.companyAddress}
              onChange={(e) => handleSystemSettingChange('companyAddress', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allowUserRegistration">Allow User Registration</Label>
                <Switch
                  id="allowUserRegistration"
                  checked={systemSettings.allowUserRegistration}
                  onCheckedChange={(checked) => handleSystemSettingChange('allowUserRegistration', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireApprovalForQuotations">Require Approval for Quotations</Label>
                <Switch
                  id="requireApprovalForQuotations"
                  checked={systemSettings.requireApprovalForQuotations}
                  onCheckedChange={(checked) => handleSystemSettingChange('requireApprovalForQuotations', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoGenerateInvoiceNumbers">Auto-Generate Invoice Numbers</Label>
                <Switch
                  id="autoGenerateInvoiceNumbers"
                  checked={systemSettings.autoGenerateInvoiceNumbers}
                  onCheckedChange={(checked) => handleSystemSettingChange('autoGenerateInvoiceNumbers', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Input
                  id="defaultCurrency"
                  value={systemSettings.defaultCurrency}
                  onChange={(e) => handleSystemSettingChange('defaultCurrency', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataRetentionPeriod">Data Retention Period (days)</Label>
                <Input
                  id="dataRetentionPeriod"
                  type="number"
                  value={systemSettings.dataRetentionPeriod}
                  onChange={(e) => handleSystemSettingChange('dataRetentionPeriod', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => handleSecuritySettingChange('passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="requireStrongPassword">Require Strong Passwords</Label>
                <Switch
                  id="requireStrongPassword"
                  checked={securitySettings.requireStrongPassword}
                  onCheckedChange={(checked) => handleSecuritySettingChange('requireStrongPassword', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                <Switch
                  id="enableTwoFactor"
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={(checked) => handleSecuritySettingChange('enableTwoFactor', checked)}
                />
              </div>
              <div>
                <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => handleSecuritySettingChange('lockoutDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <Switch
              id="emailNotifications"
              checked={systemSettings.emailNotifications}
              onCheckedChange={(checked) => handleSystemSettingChange('emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="smsNotifications">SMS Notifications</Label>
            <Switch
              id="smsNotifications"
              checked={systemSettings.smsNotifications}
              onCheckedChange={(checked) => handleSystemSettingChange('smsNotifications', checked)}
            />
          </div>
          <Button onClick={handleTestEmail} variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Frequency</Label>
              <p className="text-sm text-muted-foreground">Current: {systemSettings.backupFrequency}</p>
            </div>
            <Button onClick={handleBackupDatabase} variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Backup Now
            </Button>
          </div>
          <Separator />
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Database Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-yellow-600">Total Users</p>
                <p className="font-medium text-yellow-800">4</p>
              </div>
              <div>
                <p className="text-yellow-600">Total Quotations</p>
                <p className="font-medium text-yellow-800">25</p>
              </div>
              <div>
                <p className="text-yellow-600">Total Invoices</p>
                <p className="font-medium text-yellow-800">15</p>
              </div>
              <div>
                <p className="text-yellow-600">Database Size</p>
                <p className="font-medium text-yellow-800">2.4 MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsView;
