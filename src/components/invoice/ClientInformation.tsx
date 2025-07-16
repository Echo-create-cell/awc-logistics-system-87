
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/invoice';

interface ClientInformationProps {
  clientsForSelection: Client[];
  selectedClient: Client | null;
  onClientChange: (client: Client | null) => void;
  onClientInfoChange?: (field: 'tinNumber' | 'email', value: string) => void;
  disabled?: boolean;
}

const ClientInformation = ({ clientsForSelection, selectedClient, onClientChange, onClientInfoChange, disabled }: ClientInformationProps) => {
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
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <p><strong>Company:</strong> {selectedClient.companyName}</p>
              <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
              <p><strong>Address:</strong> {selectedClient.address}, {selectedClient.city}, {selectedClient.country}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <RequiredLabel htmlFor="tinNumber">TIN Number</RequiredLabel>
                <Input
                  id="tinNumber"
                  value={selectedClient.tinNumber || ''}
                  onChange={(e) => onClientInfoChange?.('tinNumber', e.target.value)}
                  placeholder="Enter TIN number"
                  disabled={disabled}
                  className={!selectedClient.tinNumber?.trim() ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              
              <div>
                <RequiredLabel htmlFor="email">Email</RequiredLabel>
                <Input
                  id="email"
                  type="email"
                  value={selectedClient.email || ''}
                  onChange={(e) => onClientInfoChange?.('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={disabled}
                  className={!selectedClient.email?.trim() ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientInformation;
