import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserCredential {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'sales_director' | 'sales_agent' | 'finance_officer' | 'partner';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate secure passwords for system users
    const generateSecurePassword = (): string => {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    };

    // System users with secure generated passwords
    const systemUsers: UserCredential[] = [
      {
        email: 'n.solange@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'N. Solange',
        role: 'admin'
      },
      {
        email: 'i.arnold@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'I. Arnold',
        role: 'sales_director'
      },
      {
        email: 'a.benon@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'A. Benon',
        role: 'sales_agent'
      },
      {
        email: 'n.mariemerci@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'N. Marie-Merci',
        role: 'sales_agent'
      },
      {
        email: 'u.epiphanie@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'U. Epiphanie',
        role: 'finance_officer'
      },
      {
        email: 'k.peter@africaworldcargo.com',
        password: generateSecurePassword(),
        name: 'K. Peter',
        role: 'partner'
      }
    ]

    const results = []

    for (const user of systemUsers) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name
          }
        })

        if (authError) {
          console.error(`Failed to create auth user ${user.email}:`, authError)
          results.push({
            email: user.email,
            success: false,
            error: authError.message
          })
          continue
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: authUser.user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: 'active'
          })

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError)
          results.push({
            email: user.email,
            success: false,
            error: profileError.message
          })
        } else {
          console.log(`✅ Created user: ${user.email} with role: ${user.role}`);
          
          // Log the generated password for this user (in production, send via secure channel)
          console.log(`🔑 Generated password for ${user.email}: ${user.password}`);
          
          results.push({
            email: user.email,
            success: true,
            userId: authUser.user.id,
            message: `User created successfully with role: ${user.role}`,
            temporaryPassword: user.password // Include in response for initial setup
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
        results.push({
          email: user.email,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'System users creation completed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})