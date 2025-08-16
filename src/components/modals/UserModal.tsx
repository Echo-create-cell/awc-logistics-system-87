
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Mail, Shield, Settings, AlertTriangle } from "lucide-react";
import { User as UserType } from "@/types";

interface UserModalProps {
  open: boolean;
  user: UserType | null;
  onClose: () => void;
  onSave: (user: UserType | Partial<UserType>) => void;
  onDelete: (id: string) => void;
}

const UserModal = ({ open, user, onClose, onSave, onDelete }: UserModalProps) => {
  const isEditing = !!user;
  const [form, setForm] = useState<Partial<UserType>>({});

  React.useEffect(() => {
    if (open) {
      setForm(isEditing ? user : {
        name: '',
        email: '',
        role: 'sales_agent',
        status: 'active'
      });
    }
  }, [user, open, isEditing]);

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f!, [field]: value }));
  };

  const handleSave = () => {
    if (form.name && form.email) {
      onSave(form);
    }
  };

  const handleDelete = () => {
    if (isEditing && user) {
      onDelete(user.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
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
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {isEditing ? 'Edit User' : 'Add New User'}
                {isEditing && form.status && (
                  <Badge variant={form.status === 'active' ? "default" : "secondary"} 
                         className={form.status === 'active' ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}>
                    {form.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isEditing ? 'Update user information and permissions.' : 'Enter details for the new user.'} All fields are required.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Personal Information Section */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Personal Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions Section */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Role & Permissions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    User Role
                  </Label>
                  <Select value={form.role} onValueChange={(value) => handleChange('role', value || 'sales_agent')}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Admin - Full Access
                        </div>
                      </SelectItem>
                      <SelectItem value="sales_director">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Sales Director - Management
                        </div>
                      </SelectItem>
                      <SelectItem value="sales_agent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Sales Agent - Standard
                        </div>
                      </SelectItem>
                      <SelectItem value="finance_officer">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Finance Officer - Financial
                        </div>
                      </SelectItem>
                      <SelectItem value="partner">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Partner - View Only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Account Status
                  </Label>
                  <Select value={form.status} onValueChange={(value) => handleChange('status', value || 'active')}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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

          {/* Role Description */}
          {form.role && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Role Permissions:</strong> {getRoleDescription(form.role)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between items-center w-full">
            {isEditing && user ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Delete User Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      This action cannot be undone. This will permanently delete the user
                      <strong> "{user.name}" </strong> and remove all associated data including quotations, 
                      invoices, and activity history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white border-gray-300">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSave} 
                className={`${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                disabled={!form.name || !form.email}
              >
                {isEditing ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Helper function for role descriptions
  function getRoleDescription(role: string): string {
    const descriptions = {
      admin: "Full system access, user management, and all administrative functions.",
      sales_director: "Manage sales team, approve quotations, access all sales data and reports.", 
      sales_agent: "Create quotations, manage clients, generate invoices from approved quotations.",
      finance_officer: "Access financial reports, manage invoices, view payment status and analytics.",
      partner: "View-only access to quotations and reports. Cannot create or modify data."
    };
    return descriptions[role as keyof typeof descriptions] || "Standard user permissions.";
  }
};

export default UserModal;
