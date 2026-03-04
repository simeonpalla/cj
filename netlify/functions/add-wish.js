// netlify/functions/add-wish.js
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
    const body = JSON.parse(event.body);

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/wishes`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal' 
            },
            body: JSON.stringify({ name: body.name, message: body.message })
        });

        // If Supabase rejects it, grab the EXACT reason why
        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Supabase Error Details:', errorDetails);
            throw new Error(`Supabase rejected the insert: ${errorDetails}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Function caught an error:', error.message);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};