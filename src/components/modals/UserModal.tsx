
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface UserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
  onDelete: (id: string) => void;
  mode?: "view" | "edit";
}

const UserModal = ({ open, user, onClose, onSave, onDelete, mode="view" }: UserModalProps) => {
  const [form, setForm] = useState<User | null>(user);

  React.useEffect(() => {
    setForm(user);
  }, [user]);

  if (!form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f!, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (form) onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit User" : "User Details"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {mode === "view" ? (
            <div className="space-y-2">
              <div><strong>Name:</strong> {form.name}</div>
              <div><strong>Email:</strong> {form.email}</div>
              <div><strong>Role:</strong> {form.role}</div>
              <div><strong>Status:</strong> {form.status}</div>
              <div><strong>Created At:</strong> {new Date(form.createdAt).toLocaleString()}</div>
            </div>
          ) : (
            <form className="space-y-3">
              <Input value={form.name} name="name" onChange={handleChange} placeholder="Name" />
              <Input value={form.email} name="email" onChange={handleChange} placeholder="Email" />
            </form>
          )}
        </DialogDescription>
        <DialogFooter>
          {mode === "edit" && (
            <Button onClick={handleSave} className="bg-primary text-white">Save</Button>
          )}
          <Button variant="destructive" onClick={() => { onDelete(form.id); onClose(); }}>Delete</Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
