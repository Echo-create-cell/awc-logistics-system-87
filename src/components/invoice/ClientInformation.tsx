
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/invoice';

interface ClientInformationProps {
  clientsForSelection: Client[];
  selectedClient: Client | null;
  onClientChange: (client: Client | null) => void;
  disabled?: boolean;
}

const ClientInformation = ({ clientsForSelection, selectedClient, onClientChange, disabled }: ClientInformationProps) => {
  const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </Label>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <RequiredLabel htmlFor="client">Select Client</RequiredLabel>
          <Select
            value={selectedClient?.id}
            onValueChange={(value) => {
              const client = clientsForSelection.find(c => c.id === value);
              onClientChange(client || null);
            }}
            disabled={disabled}
          >
            <SelectTrigger className={!selectedClient ? 'border-red-300 focus:border-red-500' : ''}>
              <SelectValue placeholder="Choose a client" />
            </SelectTrigger>
            <SelectContent>
              {clientsForSelection.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.companyName}{client.contactPerson ? ` - ${client.contactPerson}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedClient && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <p><strong>Company:</strong> {selectedClient.companyName}</p>
            <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
            <p className={!selectedClient.tinNumber?.trim() ? 'text-red-600 font-medium' : ''}>
              <strong>TIN:</strong> {selectedClient.tinNumber || 'Missing - Required for invoice'}
            </p>
            <p><strong>Address:</strong> {selectedClient.address}, {selectedClient.city}, {selectedClient.country}</p>
            <p className={!selectedClient.email?.trim() ? 'text-red-600 font-medium' : ''}>
              <strong>Email:</strong> {selectedClient.email || 'Missing - Required for invoice'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientInformation;
