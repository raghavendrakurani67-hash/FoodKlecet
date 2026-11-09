
<?php

header("Content-Type: application/json");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$fullName = trim($data["fullName"] ?? "");
$studentId = trim($data["studentId"] ?? "");
$phone = trim($data["phone"] ?? "");
$address = trim($data["address"] ?? "");
$password = $data["password"] ?? "";

if (
    $fullName === "" ||
    $studentId === "" ||
    $phone === "" ||
    $address === "" ||
    $password === ""
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all fields."
    ]);
    exit;
}

if (!preg_match("/^[0-9]{10}$/", $phone)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Enter a valid 10-digit phone number."
    ]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters."
    ]);
    exit;
}

// Split full name
$nameParts = preg_split('/\s+/', $fullName, 2);
$firstName = $nameParts[0];
$lastName = $nameParts[1] ?? "";

// Check duplicate Student ID
$check = $conn->prepare(
    "SELECT u_id FROM users WHERE username = ? LIMIT 1"
);

$check->bind_param("s", $studentId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "This Student ID is already registered."
    ]);
    $check->close();
    exit;
}

$check->close();

// Hash password securely
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Save registration
$stmt = $conn->prepare(
    "INSERT INTO users
    (username, f_name, l_name, phone, password, address)
    VALUES (?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "ssssss",
    $studentId,
    $firstName,
    $lastName,
    $phone,
    $hashedPassword,
    $address
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Account created successfully!"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Registration failed. Please try again."
    ]);
}

$stmt->close();
$conn->close();

?>
