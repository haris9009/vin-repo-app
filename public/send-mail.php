<?php
/**
 * WheelClarify - Custom PHP Mailer Endpoint for Hostinger
 * Receives JSON payload from React frontend and sends email using native PHP mail().
 * Place this file in public_html/send-mail.php on your Hostinger hosting.
 */

// Disable PHP error output from breaking JSON format
error_reporting(0);
ini_set('display_errors', '0');

// Set CORS and JSON Response Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Preflight OK"]);
    exit;
}

// Only accept POST requests
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

// Extract and sanitize input fields
$name = isset($data['name']) ? trim(strip_tags($data['name'])) : 'Verified Customer';
$email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
$message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';
$vin = isset($data['vin']) && !empty(trim($data['vin'])) ? trim(strtoupper(strip_tags($data['vin']))) : 'Not Provided';
$category = isset($data['category']) ? trim(strip_tags($data['category'])) : 'General Support';
$subject = isset($data['subject']) && !empty(trim($data['subject'])) ? trim(strip_tags($data['subject'])) : "Customer Inquiry - {$category}";
$phone = isset($data['phone']) ? trim(strip_tags($data['phone'])) : 'Not Provided';

// Validation
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(["success" => false, "error" => "Please provide a valid email address."]);
    exit;
}

if (empty($message)) {
    http_response_code(422);
    echo json_encode(["success" => false, "error" => "Message field cannot be empty."]);
    exit;
}

// Target administrator email address (receives all support tickets and VIN inquiries)
$admin_email = "affandark@gmail.com";

// Security: Prevent header injection
$name = str_replace(["\r", "\n"], ' ', $name);
$subject = str_replace(["\r", "\n"], ' ', $subject);

// Generate a readable Ticket ID
$ticket_id = "TKT-" . rand(100000, 999999);
$email_subject = "[WheelClarify #{$ticket_id}] {$subject}" . ($vin !== 'Not Provided' ? " (VIN: {$vin})" : "");

// Compose HTML email body
$email_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>Customer Inquiry</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; margin: 0;'>
  <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
    
    <div style='background: #0f172a; padding: 24px; color: #ffffff;'>
      <h2 style='margin: 0; color: #facc15; font-size: 20px;'>WheelClarify Support Ticket</h2>
      <p style='margin: 4px 0 0; color: #94a3b8; font-size: 12px;'>Hostinger PHP Mail Gateway • Ticket #{$ticket_id}</p>
    </div>

    <div style='padding: 24px;'>
      <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;'><strong>Customer Name:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 14px;'><strong>" . htmlspecialchars($name) . "</strong></td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px;'><strong>Customer Email:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 14px;'><a href='mailto:" . htmlspecialchars($email) . "' style='color: #2563eb; text-decoration: none;'>" . htmlspecialchars($email) . "</a></td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px;'><strong>VIN Number:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 14px; font-family: monospace; font-weight: bold; background: #fef3c7; padding: 4px 8px; border-radius: 6px; display: inline-block;'>" . htmlspecialchars($vin) . "</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px;'><strong>Category:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 13px;'>" . htmlspecialchars($category) . "</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px;'><strong>Subject:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 13px;'>" . htmlspecialchars($subject) . "</td>
        </tr>
        <tr>
          <td style='padding: 8px 0; color: #64748b; font-size: 13px;'><strong>Phone:</strong></td>
          <td style='padding: 8px 0; color: #0f172a; font-size: 13px;'>" . htmlspecialchars($phone) . "</td>
        </tr>
      </table>

      <div style='background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #facc15; margin-top: 10px;'>
        <h4 style='margin: 0 0 8px 0; font-size: 13px; color: #475569; text-transform: uppercase;'>Customer Message:</h4>
        <div style='font-size: 14px; color: #0f172a; white-space: pre-wrap; line-height: 1.6;'>" . nl2br(htmlspecialchars($message)) . "</div>
      </div>
    </div>

    <div style='background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;'>
      Sent from WheelClarify Hostinger static site • Reply to this email to reply directly to " . htmlspecialchars($email) . "
    </div>
  </div>
</body>
</html>
";

// Prepare mail headers
$domain = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'wheelclarify.com';
$from_email = "no-reply@" . preg_replace('/^www\./', '', $domain);

$headers = [
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "From: WheelClarify Support <{$from_email}>",
    "Reply-To: {$name} <{$email}>",
    "X-Mailer: PHP/" . phpversion()
];

// Execute native PHP mail() function
$mail_sent = mail($admin_email, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Email sent successfully!",
        "ticketId" => $ticket_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "PHP mail() failed to deliver the message. Please ensure PHP mail is enabled in your Hostinger cPanel/hPanel."
    ]);
}
?>
