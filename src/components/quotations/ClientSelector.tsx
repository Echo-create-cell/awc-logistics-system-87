
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientId?: string;
  onValueChange: (clientId: string) => void;
}

const ClientSelector = ({ clients, selectedClientId, onValueChange }: ClientSelectorProps) => {
  return (
    <div>
      <Label>Client</Label>
      <Select onValueChange={onValueChange} value={selectedClientId}>
        <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
        <SelectContent>
          {clients.map(client => (
            <SelectItem key={client.id} value={client.id}>
              {client.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
