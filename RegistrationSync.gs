/**
 * Bind this script to the private registration response workbook. The trigger
 * runs as the workbook owner and sends only the five approved fields.
 */
const IAC_SYNC_ENDPOINT = 'https://ylobnofwmryltbzdtkla.supabase.co/rest/v1/rpc/iac_sync_google_registrations';

function installIacRegistrationSync() {
  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  if (!workbook || !workbook.getSheetByName('Form Responses 1')) {
    throw new Error('Open Apps Script from the official response workbook.');
  }
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('IAC_SYNC_CREDENTIAL') || !properties.getProperty('IAC_SUPABASE_PUBLISHABLE_KEY')) {
    throw new Error('Configure the restricted sync credential and Supabase publishable key.');
  }
  properties.setProperty('IAC_RESPONSE_WORKBOOK', workbook.getId());
  syncIacRegistrationResponses();
  if (!ScriptApp.getProjectTriggers().some(trigger => trigger.getHandlerFunction() === 'syncIacRegistrationResponses')) {
    ScriptApp.newTrigger('syncIacRegistrationResponses').timeBased().everyMinutes(15).create();
  }
}

function findIacResponseColumns(headers) {
  const patterns = {
    response_timestamp: /^timestamp$/i,
    student: /^student(?:'s|’s)? (?:full )?name\b/i,
    grade: /^class(?:\b|\/)/i,
    school: /^school(?:\b|\/)/i,
    guardian_mobile: /(?:guardian|parent).*?(?:whatsapp|mobile|phone)/i
  };
  const columns = {};
  for (const [field, pattern] of Object.entries(patterns)) {
    const matches = headers.map((header, index) => pattern.test(header.trim()) ? index : -1).filter(index => index !== -1);
    if (matches.length !== 1) throw new Error('Expected one registration column for ' + field);
    columns[field] = matches[0];
  }
  return columns;
}

function syncIacRegistrationResponses() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const properties = PropertiesService.getScriptProperties();
    const sheet = SpreadsheetApp.openById(properties.getProperty('IAC_RESPONSE_WORKBOOK')).getSheetByName('Form Responses 1');
    const lastColumn = sheet.getLastColumn();
    const columns = findIacResponseColumns(sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0]);
    const lastRow = sheet.getLastRow();
    let cursor = Number(properties.getProperty('IAC_SYNC_NEXT_ROW') || '2');
    if (!Number.isSafeInteger(cursor) || cursor < 2) throw new Error('Invalid registration sync checkpoint.');
    for (let batch = 0; cursor <= lastRow && batch < 5; batch++) {
      const count = Math.min(100, lastRow - cursor + 1);
      const values = sheet.getRange(cursor, 1, count, lastColumn).getDisplayValues();
      const rows = values.filter(row => row[columns.response_timestamp].trim()).map(row => ({
        response_timestamp: row[columns.response_timestamp].trim(),
        student: row[columns.student].trim(),
        grade: row[columns.grade].trim().replace(/^class\s*/i, '').replace(/^(9|10|11|12)(?:th|st|nd)$/i, '$1'),
        school: row[columns.school].trim(),
        guardian_mobile: row[columns.guardian_mobile].trim().replace(/^\+91\s*/, '').replace(/\s+/g, '')
      }));
      if (rows.length) {
        const response = UrlFetchApp.fetch(IAC_SYNC_ENDPOINT, {
          method: 'post', contentType: 'application/json',
          headers: {apikey: properties.getProperty('IAC_SUPABASE_PUBLISHABLE_KEY')},
          payload: JSON.stringify({p_credential: properties.getProperty('IAC_SYNC_CREDENTIAL'), p_rows: rows}),
          muteHttpExceptions: true
        });
        if (response.getResponseCode() !== 200) {
          throw new Error('Registration sync returned HTTP ' + response.getResponseCode() + ' at response row ' + cursor);
        }
      }
      cursor += count;
      properties.setProperty('IAC_SYNC_NEXT_ROW', String(cursor));
    }
  } finally {
    lock.releaseLock();
  }
}
