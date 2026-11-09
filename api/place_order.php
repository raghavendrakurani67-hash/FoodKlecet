
<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Please log in again."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$items = $data["items"] ?? [];

if (!is_array($items) || count($items) === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Your cart is empty."]);
    exit;
}

$userId = (int) $_SESSION["user_id"];

try {
    $conn->begin_transaction();

    $total = 0;
    $validatedItems = [];

    foreach ($items as $item) {
        $name = trim($item["name"] ?? "");
        $foodId = trim($item["id"] ?? "");
        $quantity = filter_var($item["quantity"] ?? null, FILTER_VALIDATE_INT);
        $price = filter_var($item["price"] ?? null, FILTER_VALIDATE_FLOAT);

        if (
            $name === "" ||
            $foodId === "" ||
            $quantity === false ||
            $quantity < 1 ||
            $quantity > 100 ||
            $price === false ||
            $price < 0
        ) {
            throw new Exception("Invalid food item or quantity.");
        }

        $lineTotal = $price * $quantity;
        $total += $lineTotal;

        $validatedItems[] = [
            "id" => $foodId,
            "name" => $name,
            "quantity" => $quantity,
            "price" => $price
        ];
    }

    $stmt = $conn->prepare(
        "INSERT INTO foodklect_orders (user_id, total_amount, status)
         VALUES (?, ?, 'Confirmed')"
    );

    $stmt->bind_param("id", $userId, $total);
    $stmt->execute();

    $orderId = $conn->insert_id;
    $stmt->close();

    $itemStmt = $conn->prepare(
        "INSERT INTO foodklect_order_items
         (order_id, food_id, food_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)"
    );

    foreach ($validatedItems as $item) {
        $itemStmt->bind_param(
            "issid",
            $orderId,
            $item["id"],
            $item["name"],
            $item["quantity"],
            $item["price"]
        );

        $itemStmt->execute();
    }

    $itemStmt->close();
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully.",
        "orderId" => $orderId
    ]);

} catch (Throwable $error) {
    $conn->rollback();

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $error->getMessage()
    ]);
}

$conn->close();
?>
