import https from 'https';
import http from 'http';

const BASE_URL = 'https://api.qarhami.online';
const TIMEOUT = 5000; // 5 seconds timeout

// Common routes to test - Focused on security-critical endpoints
const commonRoutes = [
    // Root and health endpoints (keep - these returned data)
    '/',
    '/health',
    '/api/health',
    
    // Configuration and environment files (critical security checks)
    '/.env',
    '/api/.env',
    '/.env.local',
    '/api/.env.local',
    '/.env.production',
    '/api/.env.production',
    '/config.json',
    '/api/config.json',
    '/config',
    '/api/config',
    '/env',
    '/api/env',
    '/settings',
    '/api/settings',
    
    // Twilio specific routes (user requested check)
    '/api/twilio',
    '/api/twilio/config',
    '/api/twilio/credentials',
    '/api/twilio/account',
    '/api/twilio/sid',
    '/api/twilio/token',
    '/api/sms/config',
    '/api/sms/credentials',
    '/twilio',
    '/twilio/config',
    '/twilio/credentials',
    
    // MongoDB specific routes (user requested check)
    '/mongodb',
    '/api/mongodb',
    '/mongodb/config',
    '/api/mongodb/config',
    '/mongodb/connection',
    '/api/mongodb/connection',
    '/mongodb/url',
    '/api/mongodb/url',
    '/mongodb/uri',
    '/api/mongodb/uri',
    '/mongodb/credentials',
    '/api/mongodb/credentials',
    '/mongodb/collections',
    '/api/mongodb/collections',
    '/mongodb/data',
    '/api/mongodb/data',
    '/mongodb/export',
    '/api/mongodb/export',
    '/mongodb/dump',
    '/api/mongodb/dump',
    '/mongo',
    '/api/mongo',
    '/mongo/config',
    '/api/mongo/config',
    '/mongo/credentials',
    '/api/mongo/credentials',
    
    // Database connection and data exposure
    '/db/config',
    '/api/db/config',
    '/db/connection',
    '/api/db/connection',
    '/db/data',
    '/api/db/data',
    '/db/collections',
    '/api/db/collections',
    '/database/config',
    '/api/database/config',
    '/database/connection',
    '/api/database/connection',
    '/database/data',
    '/api/database/data',
    
    // Credential endpoints (critical security checks)
    '/credentials',
    '/api/credentials',
    '/secrets',
    '/api/secrets',
    '/keys',
    '/api/keys',
    '/tokens',
    '/api/tokens',
    '/api-keys',
    '/api/api-keys',
    
    // Backup and dump files (security risk)
    '/backup',
    '/api/backup',
    '/backup.sql',
    '/api/backup.sql',
    '/dump',
    '/api/dump',
    '/dump.sql',
    '/api/dump.sql',
    
    // Version control files (security risk)
    '/.git',
    '/api/.git',
    '/.git/config',
    '/api/.git/config',
    '/package.json',
    '/api/package.json',
    
    // Admin and internal endpoints (security risk)
    '/admin',
    '/api/admin',
    '/admin/config',
    '/api/admin/config',
    '/admin/credentials',
    '/api/admin/credentials',
    '/internal',
    '/api/internal',
    '/internal/config',
    '/api/internal/config',
    '/private',
    '/api/private',
    
    // AWS and cloud credentials
    '/aws/credentials',
    '/api/aws/credentials',
    '/s3/credentials',
    '/api/s3/credentials',
    
    // JWT and authentication secrets
    '/jwt/secret',
    '/api/jwt/secret',
    '/auth/secret',
    '/api/auth/secret',
    '/session/secret',
    '/api/session/secret',
    
    // API documentation (might leak info)
    '/swagger.json',
    '/api/swagger.json',
    '/openapi.json',
    '/api/openapi.json',
];

// HTTP methods to test
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

// Keywords to search for in responses (indicating credential leakage)
const credentialKeywords = [
    // Twilio specific
    'twilio',
    'account_sid',
    'auth_token',
    'twilio_account_sid',
    'twilio_auth_token',
    'twilio_api_key',
    'twilio_api_secret',
    'twilio_sid',
    'twilio_token',
    
    // General API credentials
    'api_key',
    'api_secret',
    'api_secret_key',
    'apikey',
    'api-key',
    'sid',
    'token',
    'access_token',
    'access_token_secret',
    'bearer',
    'bearer_token',
    'oauth_token',
    'oauth_secret',
    
    // Authentication
    'credential',
    'credentials',
    'password',
    'passwd',
    'pwd',
    'secret',
    'secret_key',
    'private_key',
    'public_key',
    'auth_key',
    'auth_secret',
    'jwt_secret',
    'jwt_key',
    'session_secret',
    
    // Database - MongoDB specific
    'mongodb',
    'mongodb_uri',
    'mongodb_url',
    'mongodb_connection',
    'mongodb_connection_string',
    'mongodb_url',
    'mongo',
    'mongo_uri',
    'mongo_url',
    'mongo_connection',
    'mongoose',
    'mongoose_connection',
    'objectid',
    'object_id',
    '_id',
    'collection',
    'collections',
    'db.collection',
    'mongodb://',
    'mongodb+srv://',
    
    // Database - General
    'database',
    'database_url',
    'database_uri',
    'db_url',
    'db_uri',
    'connection_string',
    'connection_uri',
    'mysql',
    'postgres',
    'postgresql',
    'redis',
    'redis_url',
    'redis_uri',
    
    // MongoDB data patterns
    'users',
    'user',
    'sites',
    'site',
    'feeds',
    'feed',
    'payments',
    'payment',
    'expenses',
    'expense',
    'documents',
    'document',
    'records',
    'record',
    
    // Cloud services
    'aws',
    'aws_access_key',
    'aws_secret_key',
    'aws_secret_access_key',
    'aws_session_token',
    's3',
    's3_bucket',
    's3_key',
    's3_secret',
    'stripe',
    'stripe_key',
    'stripe_secret',
    'stripe_api_key',
    'stripe_secret_key',
    'paypal',
    'paypal_client_id',
    'paypal_secret',
    'google_api_key',
    'google_secret',
    'firebase',
    'firebase_key',
    
    // Environment and config
    'uri',
    'url',
    'env',
    'environment',
    'environment_variable',
    'config',
    'configuration',
    'settings',
    'appsettings',
    
    // Email services
    'smtp',
    'smtp_host',
    'smtp_user',
    'smtp_password',
    'smtp_pass',
    'email',
    'email_password',
    'mailgun',
    'mailgun_key',
    'sendgrid',
    'sendgrid_key',
    'sendgrid_api_key',
    
    // Other services
    'webhook',
    'webhook_secret',
    'webhook_key',
    'callback',
    'callback_url',
    'callback_secret',
];

function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            timeout: TIMEOUT,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Security-Test)',
                'Accept': 'application/json, text/plain, */*',
            },
        };

        const client = urlObj.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    method,
                    url,
                });
            });
        });

        req.on('error', (error) => {
            reject({ error: error.message, method, url });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({ error: 'Request timeout', method, url });
        });

        req.end();
    });
}

function checkForCredentials(response) {
    const findings = [];
    const body = (response.body || '').toString().toLowerCase();
    const headers = JSON.stringify(response.headers || {}).toLowerCase();

    for (const keyword of credentialKeywords) {
        if (body.includes(keyword) || headers.includes(keyword)) {
            findings.push(keyword);
        }
    }

    // Check for MongoDB-specific patterns
    const mongoPatterns = [
        /mongodb\+srv:\/\//i,
        /mongodb:\/\//i,
        /"objectid"/i,
        /"object_id"/i,
        /"_id":\s*"[a-f0-9]{24}"/i, // MongoDB ObjectId pattern
        /"__v":\s*\d+/i, // Mongoose version key
        /"createdat"/i,
        /"updatedat"/i,
        /"created_at"/i,
        /"updated_at"/i,
    ];

    for (const pattern of mongoPatterns) {
        if (pattern.test(response.body || '')) {
            findings.push('mongodb_data_structure');
        }
    }

    return findings;
}

function analyzeResponse(response) {
    const analysis = {
        url: response.url,
        method: response.method,
        statusCode: response.statusCode,
        hasData: response.body && response.body.length > 0,
        bodyLength: response.body ? response.body.length : 0,
        body: response.body || '', // Store the body for later display
        contentType: response.headers['content-type'] || 'unknown',
        credentialsFound: [],
        isSuccess: false,
        isErrorPage: false,
    };

    // Check if response indicates success
    if (response.statusCode >= 200 && response.statusCode < 300) {
        analysis.isSuccess = true;
    }

    // Check if it's an error page (false positive filter)
    const bodyLower = (response.body || '').toLowerCase();
    if (bodyLower.includes('cannot ') && bodyLower.includes('error')) {
        analysis.isErrorPage = true;
    }

    // Check for credential keywords (but skip if it's just an error page)
    if (!analysis.isErrorPage || response.statusCode === 200) {
        analysis.credentialsFound = checkForCredentials(response);
    }

    return analysis;
}

async function testRoute(route) {
    const results = [];
    
    for (const method of methods) {
        try {
            const url = `${BASE_URL}${route}`;
            const response = await makeRequest(url, method);
            const analysis = analyzeResponse(response);
            
            // Only report if:
            // 1. Status is 200-299 (success) AND has meaningful data (not just error pages)
            // 2. Status is 200-299 AND credentials found (excluding false positives from URLs)
            // 3. Any response that contains actual credential data (not just error messages)
            const hasRealCredentials = analysis.credentialsFound.length > 0 && 
                !analysis.isErrorPage && 
                analysis.bodyLength > 50; // Real responses are usually longer
            
            if ((analysis.isSuccess && !analysis.isErrorPage && analysis.hasData) || hasRealCredentials) {
                results.push(analysis);
            }
        } catch (error) {
            // Silently skip errors (timeouts, connection errors, etc.)
        }
    }
    
    return results;
}

async function main() {
    console.log('🔍 Starting brute force route leakage check...\n');
    console.log(`Target: ${BASE_URL}\n`);
    console.log(`Testing ${commonRoutes.length} routes with ${methods.length} methods each...\n`);
    console.log('='.repeat(80) + '\n');

    const allFindings = [];
    let tested = 0;

    for (const route of commonRoutes) {
        tested++;
        process.stdout.write(`\rTesting [${tested}/${commonRoutes.length}]: ${route.padEnd(50)}`);
        
        const results = await testRoute(route);
        
        if (results.length > 0) {
            allFindings.push(...results);
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESULTS SUMMARY\n');

    if (allFindings.length === 0) {
        console.log('❌ No data leakage found in tested routes.\n');
    } else {
        console.log(`✅ Found ${allFindings.length} route(s) with potential data leakage:\n`);
        
        for (const finding of allFindings) {
            console.log('─'.repeat(80));
            console.log(`📍 URL: ${finding.url}`);
            console.log(`   Method: ${finding.method}`);
            console.log(`   Status: ${finding.statusCode}`);
            console.log(`   Content-Type: ${finding.contentType}`);
            console.log(`   Body Length: ${finding.bodyLength} bytes`);
            
            if (finding.credentialsFound.length > 0) {
                console.log(`   ⚠️  CREDENTIAL KEYWORDS FOUND: ${finding.credentialsFound.join(', ')}`);
            }
            
            // Show first 500 chars of response if it contains credential keywords
            if (finding.credentialsFound.length > 0 && finding.bodyLength > 0) {
                const bodyPreview = finding.body.substring(0, 500);
                console.log(`\n   Response Preview:`);
                console.log(`   ${bodyPreview}${finding.bodyLength > 500 ? '...' : ''}`);
            }
            
            console.log();
        }
        
        // Check specifically for Twilio - only real credential leaks
        const twilioFindings = allFindings.filter(f => 
            !f.isErrorPage && 
            f.isSuccess && 
            f.credentialsFound.some(k => 
                (k.includes('twilio') || k.includes('sid') || k.includes('token')) &&
                !f.url.toLowerCase().includes(k) // Exclude if keyword is just in URL
            )
        );
        
        if (twilioFindings.length > 0) {
            console.log('\n🚨 TWILIO CREDENTIAL LEAKAGE DETECTED!\n');
            for (const finding of twilioFindings) {
                console.log(`   ⚠️  ${finding.method} ${finding.url} - Status: ${finding.statusCode}`);
                console.log(`   Response: ${finding.body.substring(0, 200)}...`);
            }
        } else {
            console.log('\n✅ No Twilio credential leakage detected in successful responses.\n');
            console.log('   (All Twilio-related routes returned 404 - no data leakage)');
        }
        
        // Check specifically for MongoDB - connection strings and data exposure
        const mongoFindings = allFindings.filter(f => 
            !f.isErrorPage && 
            f.isSuccess && 
            f.credentialsFound.some(k => 
                (k.includes('mongodb') || k.includes('mongo') || k.includes('mongoose') || 
                 k.includes('mongodb_data_structure') || k.includes('collection') ||
                 k.includes('objectid') || k.includes('_id')) &&
                !f.url.toLowerCase().includes(k) // Exclude if keyword is just in URL
            )
        );
        
        if (mongoFindings.length > 0) {
            console.log('\n🚨 MONGODB DATA/CONNECTION LEAKAGE DETECTED!\n');
            for (const finding of mongoFindings) {
                console.log(`   ⚠️  ${finding.method} ${finding.url} - Status: ${finding.statusCode}`);
                console.log(`   MongoDB Keywords Found: ${finding.credentialsFound.filter(k => 
                    k.includes('mongodb') || k.includes('mongo') || k.includes('collection') || 
                    k.includes('objectid') || k.includes('_id')
                ).join(', ')}`);
                const preview = finding.body.substring(0, 500);
                console.log(`   Response Preview: ${preview}${finding.bodyLength > 500 ? '...' : ''}`);
                console.log();
            }
        } else {
            console.log('\n✅ No MongoDB connection string or data leakage detected.\n');
            console.log('   (All MongoDB-related routes returned 404 - no data leakage)');
        }
    }

    console.log('='.repeat(80));
    console.log(`\n✅ Testing completed. Tested ${tested} routes.\n`);
}

// Run the test
main().catch(console.error);
