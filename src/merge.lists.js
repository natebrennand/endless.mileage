
const fs = require('fs');

const maleMilers = require('./men.sub4.json')
const femaleMilers = require('./women.sub430.json')


const timeRegex = /((\d{1}):)?((\d{2}):)?(\d{2})\.(\d+)/;

function resultInHundreths(result) {
  const groups = timeRegex.exec(result);
  const
    hours      = groups[2],
    minutes    = groups[4],
    seconds    = groups[5],
    hundredths = groups[6].padEnd(2, '0');

  return (
    60*60*100*parseInt(hours || '0') +
       60*100*parseInt(minutes || '0') +
          100*parseInt(seconds || '0') +
              parseInt(hundredths || '0')
  );
}

function calculateGapInHundredths(result, barrier) {
  if (!result.match(/\d{2}:\d{2}\.\d/)) {
    throw `result ${result}' does not match expected format`
  }
  return resultInHundreths(barrier) - resultInHundreths(result);
}

maleMilers.forEach(x => {
  x.date = new Date(x.date)
  x.gender = "male"
  x.hundredths_under_barrier = calculateGapInHundredths(x.result, "04:00.0")
})

femaleMilers.forEach(x => {
  x.date = new Date(x.date)
  x.gender = "female"
  x.hundredths_under_barrier = calculateGapInHundredths(x.result, "04:30.0")
})

const allMilers = maleMilers.concat(femaleMilers)

let ties = 0;

// Sort by:
// 1. date
// 2. gap under the barrier
// 3. alphabetical on last name
allMilers.sort(function(a, b) {
  if (a.date.getTime() !== b.date.getTime()) {
    return a.date - b.date;
  } else if (a.hundredths_under_barrier !== b.hundredths_under_barrier) {
    return a.hundredths_under_barrier - b.hundredths_under_barrier;
  }
  const aLastName = a.name.split(' ').at(-1),
        bLastName = b.name.split(' ').at(-1);

  return aLastName.localeCompare(bLastName);
})


allMilers.forEach((x, idx) => {
  x.index = idx
})

// write JSON string to a file
fs.writeFile('./src/all.milers.json', JSON.stringify(allMilers, null, 2), (err) => {
    if (err) {
        throw err;
    }
});

