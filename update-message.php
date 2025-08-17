<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$messagesFile = 'messages.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
    
    // Read existing messages
    if (!file_exists($messagesFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Messages file not found']);
        exit;
    }
    
    $content = file_get_contents($messagesFile);
    $messages = json_decode($content, true) ?: [];
    
    // Find and update the message
    $updated = false;
    foreach ($messages as &$message) {
        if ($message['id'] == $input['id']) {
            if (isset($input['status'])) {
                $message['status'] = $input['status'];
            }
            if (isset($input['reply'])) {
                $message['replies'][] = [
                    'subject' => $input['reply']['subject'],
                    'message' => $input['reply']['message'],
                    'timestamp' => date('c')
                ];
                $message['status'] = 'replied';
            }
            $updated = true;
            break;
        }
    }
    
    if ($updated) {
        if (file_put_contents($messagesFile, json_encode($messages, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'Message updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update message']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Message not found']);
    }
}
?>