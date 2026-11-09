
<?php

session_start();
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

$studentId = trim($data["studentId"] ?? "");
$password = $data["password"] ?? "";

if ($studentId === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter Student ID and password."
    ]);
    exit;
}

// Find the student in MySQL
$stmt = $conn->prepare(
    "SELECT u_id, username, f_name, l_name, phone, password
     FROM users
     WHERE username = ?
     LIMIT 1"
);

$stmt->bind_param("s", $studentId);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();

if (!$user || !password_verify($password, $user["password"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Invalid Student ID or password."
    ]);
    $conn->close();
    exit;
}

// Create PHP session
session_regenerate_id(true);

$_SESSION["user_id"] = $user["u_id"];
$_SESSION["student_id"] = $user["username"];

$fullName = trim($user["f_name"] . " " . $user["l_name"]);

echo json_encode([
    "success" => true,
    "message" => "Login successful!",
    "user" => [
        "id" => $user["u_id"],
        "name" => $fullName,
        "studentId" => $user["username"],
        "phone" => $user["phone"]
    ]
]);

$conn->close();

?>
