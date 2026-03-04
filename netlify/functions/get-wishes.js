// netlify/functions/get-wishes.js
exports.handler = async (event, context) => {
    // These variables will be safely stored in your Netlify dashboard
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // Calling Supabase REST API securely from the server
        const response = await fetch(`${SUPABASE_URL}/rest/v1/wishes?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch wishes' }) };
    }
};