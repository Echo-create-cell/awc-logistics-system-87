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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border shadow-xl">
        <DialogHeader className="pb-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isEditing ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
              {isEditing ? (
                <User className="h-6 w-6 text-blue-600" />
              ) : (
                <UserPlus className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                {isEditing && form.status && (
                  <Badge 
                    variant={form.status === 'active' ? "default" : "secondary"} 
                    className={form.status === 'active' 
                      ? "bg-green-100 text-green-800 border border-green-200 px-3 py-1" 
                      : "bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1"
                    }
                  >
                    {form.status}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-gray-600 mt-2 text-base">
                {isEditing ? 'Update user information and manage credentials.' : 'Create a new user account with credentials.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-8 space-y-8 bg-gray-50">
          {/* Personal Information Section */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions Section */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Role & Permissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">User Role</Label>
                  <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Admin - Full Access
                        </div>
                      </SelectItem>
                      <SelectItem value="sales_director">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Sales Director
                        </div>
                      </SelectItem>
                      <SelectItem value="sales_agent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Sales Agent
                        </div>
                      </SelectItem>
                      <SelectItem value="finance_officer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Finance Officer
                        </div>
                      </SelectItem>
                      <SelectItem value="partner">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Partner
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Account Status</Label>
                  <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Management Section */}
          <Card className="border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Credentials Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 h-11"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Generate Secure Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userCredentials && (
                    <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-base">Current Credentials</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCredentials(!showCredentials)}
                          className="h-9 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {showCredentials && (
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                            <span className="text-gray-700 font-medium">Email: {userCredentials.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(userCredentials.email)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                            <span className="text-gray-700 font-medium">Password: {userCredentials.password}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(userCredentials.password)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4 text-gray-500" />
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
                    className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-200 bg-white -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
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
                <Button variant="outline" disabled={isLoading} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSave} 
                disabled={!form.name || !form.email || isLoading || (!isEditing && (!password || password !== confirmPassword))}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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