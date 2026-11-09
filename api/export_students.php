
<?php

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Fill;

require_once __DIR__ . "/../vendor/autoload.php";
require_once __DIR__ . "/db.php";

$sql = "SELECT u_id, username, f_name, l_name, phone, address
        FROM users
        ORDER BY u_id DESC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    exit("Unable to retrieve students.");
}

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$sheet->setTitle("Registered Students");

$sheet->fromArray([
    ["Record ID", "Student ID", "First Name", "Last Name", "Phone", "Address"]
], null, "A1");

$rowNumber = 2;

while ($row = $result->fetch_assoc()) {

    $sheet->setCellValue("A$rowNumber", $row["u_id"]);

    $sheet->setCellValueExplicit(
        "B$rowNumber", $row["username"], DataType::TYPE_STRING
    );

    $sheet->setCellValue("C$rowNumber", $row["f_name"]);
    $sheet->setCellValue("D$rowNumber", $row["l_name"]);

    $sheet->setCellValueExplicit(
        "E$rowNumber", $row["phone"], DataType::TYPE_STRING
    );

    $sheet->setCellValue("F$rowNumber", $row["address"]);

    $rowNumber++;
}

$sheet->getStyle("A1:F1")->applyFromArray([
    "font" => [
        "bold" => true,
        "color" => ["rgb" => "FFFFFF"],
        "size" => 12
    ],
    "fill" => [
        "fillType" => Fill::FILL_SOLID,
        "startColor" => ["rgb" => "FF6B35"]
    ]
]);

foreach (range("A", "F") as $column) {
    $sheet->getColumnDimension($column)->setAutoSize(true);
}

$sheet->freezePane("A2");
$sheet->setAutoFilter("A1:F" . ($rowNumber - 1));

$conn->close();

header("Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
header('Content-Disposition: attachment; filename="Foodklect_Students_List.xlsx"');
header("Cache-Control: max-age=0");

$writer = new Xlsx($spreadsheet);
$writer->save("php://output");

exit;
