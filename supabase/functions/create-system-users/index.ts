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

    // System users with exact credentials specified
    const systemUsers: UserCredential[] = [
      {
        email: 'n.solange@africaworldcargo.com',
        password: 'Action@AWC',
        name: 'N. Solange',
        role: 'admin'
      },
      {
        email: 'i.arnold@africaworldcargo.com',
        password: 'Director@AWC',
        name: 'I. Arnold',
        role: 'sales_director'
      },
      {
        email: 'a.benon@africaworldcargo.com',
        password: 'Agent@AWC',
        name: 'A. Benon',
        role: 'sales_agent'
      },
      {
        email: 'n.mariemerci@africaworldcargo.com',
        password: 'Agent2@AWC',
        name: 'N. Marie-Merci',
        role: 'sales_agent'
      },
      {
        email: 'u.epiphanie@africaworldcargo.com',
        password: 'Finance@AWC',
        name: 'U. Epiphanie',
        role: 'finance_officer'
      },
      {
        email: 'k.peter@africaworldcargo.com',
        password: 'Partner@AWC',
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
          results.push({
            email: user.email,
            success: true,
            userId: authUser.user.id
          })
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