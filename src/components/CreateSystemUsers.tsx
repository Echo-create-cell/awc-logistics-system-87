import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateSystemUsers = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Auto-create users on component mount
  React.useEffect(() => {
    createSystemUsers();
  }, []);

  const createSystemUsers = async () => {
    setIsCreating(true);
    try {
      console.log('Calling create-system-users Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('create-system-users', {
        body: {}
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      console.log('Edge Function response:', data);

      toast({
        title: "Success",
        description: "System users created successfully! You can now login with the provided credentials.",
      });

    } catch (error) {
      console.error('Failed to create system users:', error);
      toast({
        title: "Error",
        description: "Failed to create system users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Setup System Users</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create all system users in Supabase Auth with their proper credentials.
      </p>
      <Button 
        onClick={createSystemUsers} 
        disabled={isCreating}
      >
        {isCreating ? 'Creating Users...' : 'Create System Users'}
      </Button>
    </div>
  );
};

export default CreateSystemUsers;