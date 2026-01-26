// Locations CRUD operations
const { query } = require('./utils/db');
const { verifyToken } = require('./utils/auth');

// Helper to verify authentication
function verifyAuth(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    return verifyToken(token);
}

exports.handler = async (event) => {
    // Handle CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Verify authentication
    const user = verifyAuth(event);
    if (!user) {
        return {
            statusCode: 401,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    const userId = user.userId;

    try {
        // GET - Fetch all locations for user
        if (event.httpMethod === 'GET') {
            const result = await query(
                'SELECT * FROM locations WHERE user_id = $1 ORDER BY display_order, date_added DESC',
                [userId]
            );

            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    locations: result.rows.map(loc => ({
                        id: loc.id.toString(),
                        name: loc.name,
                        description: loc.description || '',
                        priority: loc.priority,
                        visited: loc.visited,
                        dateAdded: loc.date_added.toISOString(),
                        order: loc.display_order
                    }))
                })
            };
        }

        // POST - Create new location
        if (event.httpMethod === 'POST') {
            const { name, description, priority, visited } = JSON.parse(event.body);

            if (!name) {
                return {
                    statusCode: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Location name is required' })
                };
            }

            // Get max order
            const orderResult = await query(
                'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM locations WHERE user_id = $1',
                [userId]
            );
            const nextOrder = orderResult.rows[0].next_order;

            const result = await query(
                `INSERT INTO locations (user_id, name, description, priority, visited, display_order)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [userId, name, description || null, priority || 'medium', visited || false, nextOrder]
            );

            const location = result.rows[0];
            return {
                statusCode: 201,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: {
                        id: location.id.toString(),
                        name: location.name,
                        description: location.description || '',
                        priority: location.priority,
                        visited: location.visited,
                        dateAdded: location.date_added.toISOString(),
                        order: location.display_order
                    }
                })
            };
        }

        // PUT - Update location
        if (event.httpMethod === 'PUT') {
            const { id, name, description, priority, visited, order } = JSON.parse(event.body);

            if (!id) {
                return {
                    statusCode: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Location ID is required' })
                };
            }

            // Verify ownership
            const checkResult = await query(
                'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
                [id, userId]
            );

            if (checkResult.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Location not found' })
                };
            }

            const result = await query(
                `UPDATE locations 
                 SET name = $1, description = $2, priority = $3, visited = $4, 
                     display_order = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6 AND user_id = $7
                 RETURNING *`,
                [name, description || null, priority, visited, order !== undefined ? order : null, id, userId]
            );

            const location = result.rows[0];
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: {
                        id: location.id.toString(),
                        name: location.name,
                        description: location.description || '',
                        priority: location.priority,
                        visited: location.visited,
                        dateAdded: location.date_added.toISOString(),
                        order: location.display_order
                    }
                })
            };
        }

        // DELETE - Delete location
        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body || '{}');

            if (!id) {
                return {
                    statusCode: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Location ID is required' })
                };
            }

            // Verify ownership
            const checkResult = await query(
                'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
                [id, userId]
            );

            if (checkResult.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Location not found' })
                };
            }

            await query(
                'DELETE FROM locations WHERE id = $1 AND user_id = $2',
                [id, userId]
            );

            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Location deleted successfully' })
            };
        }

        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (error) {
        console.error('Locations API error:', error);
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

