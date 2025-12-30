import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // Expected: /mission-api/{missionId}/{endpoint}
  const missionId = pathParts[1]
  const endpoint = pathParts[2]

  console.log(`[Mission API] ${req.method} ${endpoint} for mission ${missionId}`)

  try {
    // Validate mission exists
    if (missionId) {
      const { data: mission, error } = await supabase
        .from('missions')
        .select('id')
        .eq('id', missionId)
        .single()

      if (error || !mission) {
        return new Response(JSON.stringify({ error: 'Mission not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Route handling
    if (req.method === 'POST' && endpoint === 'vision-output') {
      const body = await req.json()
      const { data, error } = await supabase.from('vision_outputs').insert({
        mission_id: missionId,
        road_id: body.road_id,
        status: body.status,
        lat: body.lat,
        lon: body.lon,
        confidence: body.confidence || 0,
      }).select().single()

      if (error) throw error
      console.log(`[Vision Output] Created for road ${body.road_id}`)
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST' && endpoint === 'comms-output') {
      const body = await req.json()
      const { data, error } = await supabase.from('comms_outputs').insert({
        mission_id: missionId,
        location_cluster: body.location_cluster,
        urgency: body.urgency || 'medium',
        people_estimated: body.people_estimated || 0,
        needs: body.needs || [],
        lat: body.lat,
        lon: body.lon,
        confidence: body.confidence || 0,
      }).select().single()

      if (error) throw error
      console.log(`[Comms Output] Created cluster ${body.location_cluster}`)
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST' && endpoint === 'navigation-output') {
      const body = await req.json()
      const { data, error } = await supabase.from('navigation_outputs').insert({
        mission_id: missionId,
        route_geojson: body.route_geojson || {},
        eta_minutes: body.eta_minutes || 0,
        risk_level: body.risk_level || 'low',
      }).select().single()

      if (error) throw error
      // Update mission status to processing
      await supabase.from('missions').update({ status: 'processing' }).eq('id', missionId)
      console.log(`[Navigation Output] Route created`)
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST' && endpoint === 'explanation') {
      const body = await req.json()
      const { data, error } = await supabase.from('explanations').insert({
        mission_id: missionId,
        summary_text: body.summary_text,
      }).select().single()

      if (error) throw error
      // Update mission status to completed
      await supabase.from('missions').update({ status: 'completed' }).eq('id', missionId)
      console.log(`[Explanation] Created`)
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET' && missionId && !endpoint) {
      const { data, error } = await supabase
        .from('missions')
        .select('*, uploads(*)')
        .eq('id', missionId)
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[Mission API Error]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})