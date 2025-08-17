import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, UserPlus, Mail, Shield, Settings, AlertTriangle, Key, RotateCcw, Eye, EyeOff, Copy } from "lucide-react";
import { User as UserType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface UserCredentials {
  email: string;
  password: string;
  temporaryPassword?: boolean;
  lastPasswordReset?: string;
}

interface AdminUserModalProps {
  open: boolean;
  user: UserType | null;
  onClose: () => void;
  onSave: (userData: Omit<UserType, 'id' | 'createdAt'>, password?: string) => Promise<void>;
  onUpdate: (userId: string, userData: Partial<UserType>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onResetPassword: (userId: string, newPassword?: string) => Promise<string>;
  getUserCredentials: (userId: string) => UserCredentials | null;
}

const AdminUserModal = ({ 
  open, 
  user, 
  onClose, 
  onSave, 
  onUpdate, 
  onDelete, 
  onResetPassword, 
  getUserCredentials 
}: AdminUserModalProps) => {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;
  const [form, setForm] = useState<Partial<UserType>>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const userCredentials = user ? getUserCredentials(user.id) : null;

  React.useEffect(() => {
    if (open) {
      setForm(isEditing ? user : {
        name: '',
        email: '',
        role: 'sales_agent',
        status: 'active'
      });
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowCredentials(false);
    }
  }, [user, open, isEditing]);

  if (!isAdmin) {
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f!, [field]: value }));
  };

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    
    if (!isEditing && (!password || password !== confirmPassword)) {
      alert('Password is required and must match confirmation for new users');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && user) {
        await onUpdate(user.id, form);
      } else {
        await onSave(form as Omit<UserType, 'id' | 'createdAt'>, password);
      }
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !user) return;
    
    setIsLoading(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newPassword = await onResetPassword(user.id);
      setShowCredentials(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEditing ? 'bg-blue-100' : 'bg-green-100'}`}>
              {isEditing ? (
                <User className="h-5 w-5 text-blue-600" />
              ) : (
                <UserPlus className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                {isEditing && form.status && (
                  <Badge variant={form.status === 'active' ? "default" : "secondary"} className="text-xs">
                    {form.status}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-gray-600 mt-1">
                {isEditing ? 'Update user information and manage credentials.' : 'Create a new user account with credentials.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-card-foreground">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-card-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={form.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="bg-background border-border/40 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10 bg-background border-border/40 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-card-foreground">Role & Permissions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-card-foreground">User Role</Label>
                <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className="bg-background border-border/40 focus:border-primary">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        Admin - Full Access
                      </div>
                    </SelectItem>
                    <SelectItem value="sales_director">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Sales Director
                      </div>
                    </SelectItem>
                    <SelectItem value="sales_agent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        Sales Agent
                      </div>
                    </SelectItem>
                    <SelectItem value="finance_officer">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        Finance Officer
                      </div>
                    </SelectItem>
                    <SelectItem value="partner">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        Partner
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-card-foreground">Account Status</Label>
                <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="bg-background border-border/40 focus:border-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Credentials Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-card-foreground">Credentials Management</h3>
            </div>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="bg-background border-border/40 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="bg-background border-border/40 focus:border-primary"
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  className="w-full bg-background border-border/40 hover:bg-muted"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Generate Secure Password
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userCredentials && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-card-foreground text-sm">Current Credentials</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="h-8"
                      >
                        {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {showCredentials && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Email: {userCredentials.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(userCredentials.email)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Password: {userCredentials.password}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(userCredentials.password)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {userCredentials.temporaryPassword && (
                          <Badge variant="destructive" className="text-xs">Temporary Password</Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full bg-background border-border/40 hover:bg-muted"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between items-center w-full">
            {isEditing && user ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete User Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete 
                      <strong> {user.name} </strong> and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSave} 
                disabled={!form.name || !form.email || isLoading || (!isEditing && (!password || password !== confirmPassword))}
              >
                {isLoading ? (
                  "Saving..."
                ) : isEditing ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserModal;