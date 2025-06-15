
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@/types";

interface UserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User | Partial<User>) => void;
  onDelete: (id: string) => void;
}

const UserModal = ({ open, user, onClose, onSave, onDelete }: UserModalProps) => {
  const isEditing = !!user;
  const [form, setForm] = useState<Partial<User>>({});

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Make changes to user information.' : 'Enter details for the new user.'} All fields are required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-medium">Name</Label>
            <Input
              id="name"
              value={form.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
              placeholder="Enter full name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="col-span-3"
              placeholder="Enter email address"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right font-medium">Role</Label>
            <Select value={form.role} onValueChange={(value) => handleChange('role', value || 'sales_agent')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales_director">Sales Director</SelectItem>
                <SelectItem value="sales_agent">Sales Agent</SelectItem>
                <SelectItem value="finance_officer">Finance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right font-medium">Status</Label>
            <Select value={form.status} onValueChange={(value) => handleChange('status', value || 'active')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          {isEditing && user ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mr-auto">Delete User</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user
                    "{user.name}" and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : <div></div>}
          
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} className="bg-primary text-white">
              {isEditing ? 'Save Changes' : 'Add User'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
