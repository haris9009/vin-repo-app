<?php
/**
 * WheelClarify - Payment Gateway Connection Verifier for Hostinger Static Hosting
 * Tests Stripe and PayPal API credentials directly using server-side cURL.
 * Placed in public/check-payment.php so Vite copies it to dist/check-payment.php on build.
 */

// Disable PHP display errors to prevent breaking JSON output
error_reporting(0);
ini_set('display_errors', '0');

// Set proper CORS and Content-Type headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Preflight OK"]);
    exit;
}

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method Not Allowed. Only POST requests are accepted."]);
    exit;
}

// Read raw JSON from request body
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON payload received."]);
    exit;
}

// Extract payload parameters
$gateway = isset($data['gateway']) ? strtolower(trim($data['gateway'])) : '';
$secretKey = isset($data['secretKey']) ? trim($data['secretKey']) : '';
$clientId = isset($data['clientId']) ? trim($data['clientId']) : '';
$clientSecret = isset($data['clientSecret']) && !empty(trim($data['clientSecret'])) ? trim($data['clientSecret']) : $secretKey;
$sandbox = isset($data['sandbox']) ? (bool)$data['sandbox'] : (isset($data['sandboxMode']) ? (bool)$data['sandboxMode'] : (isset($data['testMode']) ? (bool)$data['testMode'] : false));

// 1. STRIPE CONNECTION VERIFICATION
if ($gateway === 'stripe') {
    if (empty($secretKey)) {
        http_response_code(400);
        echo json_encode(["success" => false, "connected" => false, "error" => "Stripe Secret Key is missing."]);
        exit;
    }

    $ch = curl_init('https://api.stripe.com/v1/balance');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $secretKey,
        'User-Agent: WheelClarify-Hostinger/1.0',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_err = curl_error($ch);
    curl_close($ch);

    if ($curl_err) {
        http_response_code(500);
        echo json_encode(["success" => false, "connected" => false, "error" => "cURL network error connecting to Stripe API: " . $curl_err]);
        exit;
    }

    $resp_data = json_decode($response, true);

    if ($http_code === 200 && is_array($resp_data)) {
        $livemode = !empty($resp_data['livemode']);
        $mode_str = $livemode ? 'Live Production Mode' : 'Sandbox / Test Mode';
        $currencies = [];
        if (!empty($resp_data['available']) && is_array($resp_data['available'])) {
            foreach ($resp_data['available'] as $bal) {
                if (!empty($bal['currency'])) {
                    $currencies[] = strtoupper($bal['currency']);
                }
            }
        }
        $curr_str = !empty($currencies) ? implode(', ', $currencies) : 'USD';

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "connected" => true,
            "message" => "Connected: Stripe API credentials verified successfully (200 OK)! Mode: {$mode_str}. Settlement currencies: {$curr_str}."
        ]);
        exit;
    } else {
        $error_msg = isset($resp_data['error']['message']) ? $resp_data['error']['message'] : "Stripe returned HTTP status {$http_code}";
        http_response_code($http_code >= 400 && $http_code < 500 ? $http_code : 400);
        echo json_encode([
            "success" => false,
            "connected" => false,
            "error" => "Stripe API Authentication Failed: {$error_msg}"
        ]);
        exit;
    }
}

// 2. PAYPAL CONNECTION VERIFICATION
if ($gateway === 'paypal') {
    if (empty($clientId) || empty($clientSecret)) {
        http_response_code(400);
        echo json_encode(["success" => false, "connected" => false, "error" => "PayPal Client ID and Secret Key are both required."]);
        exit;
    }

    $url = $sandbox ? 'https://api-m.sandbox.paypal.com/v1/oauth2/token' : 'https://api-m.paypal.com/v1/oauth2/token';
    $auth = base64_encode($clientId . ':' . $clientSecret);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json',
        'User-Agent: WheelClarify-Hostinger/1.0'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_err = curl_error($ch);
    curl_close($ch);

    if ($curl_err) {
        http_response_code(500);
        echo json_encode(["success" => false, "connected" => false, "error" => "cURL network error connecting to PayPal API: " . $curl_err]);
        exit;
    }

    $resp_data = json_decode($response, true);

    if ($http_code === 200 && is_array($resp_data) && !empty($resp_data['access_token'])) {
        $mode_str = $sandbox ? 'Sandbox Mode' : 'Live Production Mode';
        $app_id = isset($resp_data['app_id']) ? $resp_data['app_id'] : 'Active';

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "connected" => true,
            "message" => "Connected: PayPal REST credentials verified successfully! Generated active access token. Mode: {$mode_str} (App ID: {$app_id})."
        ]);
        exit;
    } else {
        $error_desc = isset($resp_data['error_description']) ? $resp_data['error_description'] : (isset($resp_data['error']) ? $resp_data['error'] : "PayPal returned HTTP status {$http_code}");
        http_response_code($http_code >= 400 && $http_code < 500 ? $http_code : 400);
        echo json_encode([
            "success" => false,
            "connected" => false,
            "error" => "PayPal API Authentication Failed: {$error_desc}"
        ]);
        exit;
    }
}

// Fallback if unsupported gateway specified
http_response_code(400);
echo json_encode(["success" => false, "connected" => false, "error" => "Unsupported gateway. Expected 'stripe' or 'paypal'."]);
