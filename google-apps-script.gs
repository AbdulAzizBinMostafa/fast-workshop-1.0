const SPREADSHEET_ID = "";
const SHEET_NAME = "Orders";
const HEADERS = [
  "Order ID",
  "Submitted At",
  "Name",
  "Phone Number",
  "Address",
  "Product",
  "Product Code",
  "Quantity",
  "Payment Method",
  "Transaction ID",
  "Order Total",
];

function doGet() {
  return ContentService.createTextOutput("Fast Workshop order API is running.");
}

function doPost(e) {
  try {
    const data = e.parameter || {};
    const sheet = getOrderSheet();
    const orderId = createOrderId();

    sheet.appendRow([
      orderId,
      data["Submitted At"] || new Date(),
      data["Name"] || "",
      data["Phone Number"] || "",
      data["Address"] || "",
      data["Product"] || "",
      data["Product Code"] || "",
      data["Quantity"] || "",
      data["Payment Method"] || "",
      data["Transaction ID"] || "",
      data["Order Total"] || "",
    ]);

    return jsonResponse({
      success: true,
      message: "Order received",
      orderId,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message,
    });
  }
}

function getOrderSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Spreadsheet পাওয়া যায়নি। SPREADSHEET_ID দিন অথবা Sheet-bound script ব্যবহার করুন।");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function createOrderId() {
  const datePart = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyyMMdd-HHmmss");
  const randomPart = Math.floor(Math.random() * 9000) + 1000;
  return `FW-${datePart}-${randomPart}`;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
