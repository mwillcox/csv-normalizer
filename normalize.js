const fs = require('fs');
const readline = require('readline');
const moment = require('moment-timezone');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const writeStream = fs.createWriteStream(`./${outputPath}`, { encoding: "utf8"});

let headerIsParsed = false;
let numberOfColumns = 0;

// Reading in each line of the CSV
const rl = readline.createInterface({
  input: fs.createReadStream(inputPath)
});

rl.on('line', (line) => {
  try {
    // Handle header data, do nothing with this for now
    if(!headerIsParsed) {
      numberOfColumns = convertRow(line).length;
      writeStream.write(line  + '\n');
      headerIsParsed = true;
    } else {
      // Convert string data into an array
      let rowArray = convertRow(line);

      // Sanitize data so it contains valid UTF-8 characters only
      let rowData = unicodeValidation(rowArray);
      
      // Parse each timestamp, assuming Pacific Time
      let timestamp = moment.tz(rowData[0], 'MM/DD/YY hh:mm:ss A', "America/Los_Angeles");
      // Convert and set timestamp to Eastern Time and ISO-8601 format
      let convertedTimestamp = moment.tz(timestamp, "America/New_York");
      if (!convertedTimestamp.isValid()) {
        throw "Invalid date error"
      }
      rowData[0] = convertedTimestamp.toISOString(true);
      
      // Handling zipcode data
      rowData[2] = formatZip(rowData[2]);

      // Convert name column to uppercase and account for non-english names
      rowData[3] = rowData[3].toLocaleUpperCase();

      // Write data to an output CSV file
      let outputData = rowData.toString();
      writeStream.write(outputData  + '\n');
    }
  } catch(err) {
    console.error(err);
  }
});

/* 
  Convert each string into an array using commas and ignore commas inside of double quotes

  Regex Description:
  (
      ".*?"       double quotes + anything but double quotes + double quotes
      [^",\s]+    1 or more characters excl. double quotes, comma or spaces of any kind
  )
  (?=             Followed by...
      \s*,        0 or more empty spaces and a comma
      \s*$        0 or more empty spaces and nothing else
  )
*/
function convertRow(row) {
  return row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
}

/* 
  Check each string for invalid unicode characters
  If invalid, replace it with the Unicode Replacement Character
*/
function unicodeValidation(arr) {
  var validCharExp = /(?![\x00-\x7F]|[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3})./g;
  for(let i = 0; i < numberOfColumns; i++) {
    if(arr[i]) {
      let validStr = arr[i].replace(validCharExp, "\uFFFD")
      arr[i] = validStr
    } else {
      // Edge case when row data is empty, still preserve that column
      arr[i] = '';
    }
  }
  return arr;
}

// Format zipcode to 5 digits, assume 0 as the prefix if less than 5
function formatZip(num) {
  var s = num + "";
  while (s.length < 5) {
    s = "0" + s;
  }
  return s;
}