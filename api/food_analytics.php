
<?php

header("Content-Type: application/json");

require_once __DIR__ . "/db.php";

// Summary of completed orders
$summarySql = "
    SELECT
        COUNT(DISTINCT o_id) AS total_orders,
        COALESCE(SUM(quantity), 0) AS total_units,
        COALESCE(SUM(price), 0) AS total_revenue
    FROM user_orders
    WHERE LOWER(TRIM(status)) = 'closed'
";

$summaryResult = $conn->query($summarySql);

if (!$summaryResult) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to calculate sales summary."
    ]);
    exit;
}

$summary = $summaryResult->fetch_assoc();

// Get ALL current menu items, including items with zero sales
$itemsSql = "
    SELECT
        d.d_id,
        d.name,
        COALESCE(SUM(o.quantity), 0) AS total_quantity,
        COUNT(o.o_id) AS order_count,
        COALESCE(SUM(o.price), 0) AS total_revenue
    FROM dishesh d
    LEFT JOIN user_orders o
        ON d.d_id = o.d_id
        AND LOWER(TRIM(o.status)) = 'closed'
    GROUP BY d.d_id, d.name
    ORDER BY total_quantity DESC, d.name ASC
";

$result = $conn->query($itemsSql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to fetch food item analytics."
    ]);
    exit;
}

$items = [];

while ($row = $result->fetch_assoc()) {
    $row["d_id"] = (int) $row["d_id"];
    $row["total_quantity"] = (int) $row["total_quantity"];
    $row["order_count"] = (int) $row["order_count"];
    $row["total_revenue"] = (float) $row["total_revenue"];

    $items[] = $row;
}

$totalUnits = (int) $summary["total_units"];

$topItem = "No sales yet";

if ($totalUnits > 0 && count($items) > 0) {
    $topItem = $items[0]["name"];
}

echo json_encode([
    "success" => true,

    "summary" => [
        "total_units" => $totalUnits,
        "total_orders" => (int) $summary["total_orders"],
        "total_revenue" => (float) $summary["total_revenue"],
        "top_item" => $topItem
    ],

    "items" => $items
]);

?>
