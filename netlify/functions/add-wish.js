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
                'Prefer': 'return=minimal' // Tells Supabase not to send the whole row back
            },
            body: JSON.stringify({ name: body.name, message: body.message })
        });

        if (!response.ok) throw new Error('Failed to insert into Supabase');

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to add wish' }) };
    }
};