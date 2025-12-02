const SHEET_NAME = "Sheet1";

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      data.push(record);
    }
    
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headersLower = headers.map(h => h.toString().toLowerCase());
    
    const action = e.parameter.action || 'create';
    
    if (action === 'create') {
      const nextRow = sheet.getLastRow() + 1;
      const newRow = headers.map((header, i) => {
        const headerLower = headersLower[i];
        
        // Generate ID if column is 'id' (case-insensitive)
        if (headerLower === 'id') return Utilities.getUuid();
        
        // Generate Timestamp
        if (headerLower === 'timestamp') return new Date();
        
        // Match parameter case-insensitively
        // e.g. Header "Name" matches param "name"
        return e.parameter[header] || e.parameter[headerLower] || '';
      });
      
      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'action': 'create' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'delete') {
      const idToDelete = e.parameter.id;
      const data = sheet.getDataRange().getValues();
      const idColIndex = headersLower.indexOf('id');
      
      if (idColIndex === -1) {
         return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'ID column not found' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idColIndex] == idToDelete) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'action': 'delete' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    else if (action === 'update') {
      const idToUpdate = e.parameter.id;
      const updateData = JSON.parse(e.parameter.data);
      const data = sheet.getDataRange().getValues();
      const idColIndex = headersLower.indexOf('id');
      
      if (idColIndex === -1) {
         return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'ID column not found' })).setMimeType(ContentService.MimeType.JSON);
      }
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][idColIndex] == idToUpdate) {
          const rowToUpdate = i + 1;
          
          Object.keys(updateData).forEach(key => {
            // Try to find matching header (case-insensitive)
            const colIndex = headers.findIndex(h => h.toLowerCase() === key.toLowerCase());
            if (colIndex !== -1) {
              sheet.getRange(rowToUpdate, colIndex + 1).setValue(updateData[key]);
            }
          });
          
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'action': 'update' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName(SHEET_NAME);
  
  if (sheet.getLastRow() === 0) {
    const headers = [
      "id", // Added ID column
      "timestamp", 
      "name", 
      "mobile", 
      "adults", 
      "kids", 
      "nonVeg", 
      "veg"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert("Headers added successfully!");
  } else {
    SpreadsheetApp.getUi().alert("Sheet already has data. Skipping header creation.");
  }
}
