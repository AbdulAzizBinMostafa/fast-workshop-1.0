const SPREADSHEET_ID = "";
const SHEET_NAME = "Orders";
const PAYMENT_SCREENSHOT_FOLDER_ID = "";

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
  "Payment Screenshot URL",
];

function doGet() {
  return ContentService.createTextOutput("Fast Workshop order API is running.");
}

function doPost(e) {
  try {
    const data = e.parameter || {};
    const sheet = getOrderSheet();
    const orderId = createOrderId();
    const screenshotUrl = savePaymentScreenshot(data, orderId);

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
      screenshotUrl,
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

function savePaymentScreenshot(data, orderId) {
  const base64 = data["Payment Screenshot Base64"];

  if (!base64) {
    return "";
  }

  const fileName = data["Payment Screenshot Name"] || `${orderId}-payment-screenshot.jpg`;
  const mimeType = data["Payment Screenshot Type"] || "image/jpeg";
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, `${orderId}-${fileName}`);
  const file = PAYMENT_SCREENSHOT_FOLDER_ID
    ? DriveApp.getFolderById(PAYMENT_SCREENSHOT_FOLDER_ID).createFile(blob)
    : DriveApp.createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
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
