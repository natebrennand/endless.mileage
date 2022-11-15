const fs = require('fs');

const maleMilers = require('./men.sub4.json')
const nonbinaryMilers = require('./nonbinary.sub430.json')
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

// Sort by:
// 1. date
// 2. gender
// 3. gap under the barrier
// 4. alphabetical on last name
//
// JS sorting rules:
// return -1 => a then b
// return 0  => original order
// return 1  => b then a
function sortMilersOriginal(a, b) {
  // 1. date
  if (a.date.getTime() !== b.date.getTime()) {
    return a.date - b.date;
  }

  // 2. gender
  if (a.gender !== b.gender) {
    if (a.gender === "nonbinary") {
      return -1;
    } else if (a.gender === "female") {
      return -1;
    } else {
      return 1;
    }
  }

  // 3. gap under the barrier
  if (a.hundredths_under_barrier !== b.hundredths_under_barrier) {
    return b.hundredths_under_barrier - a.hundredths_under_barrier;
  }

  // 4. alphabetical on last name
  const aLastName = a.name.split(' ').at(-1),
        bLastName = b.name.split(' ').at(-1);
  return aLastName.localeCompare(bLastName);
}

// Sort by:
// 1. date
// 2. gender
// 3. index
//
// JS sorting rules:
// return -1 => a then b
// return 0  => original order
// return 1  => b then a
function sortMilers(a, b) {
  // 1. date
  if (a.date.getTime() !== b.date.getTime()) {
    return a.date - b.date;
  }

  // 2. gender
  if (a.gender !== b.gender) {
    if (a.gender === "male") {
      return -1;
    } else if (a.gender === "nonbinary") {
      return -1;
    } else {
      return 1;
    }
  }

  return a.index - b.index;
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

  // We trust the accuracy of our underlying data to be sub 4, but it has been
  // rounded to the tenths. "Fix" the results set to 4 flat.
  if (x.result == "04:00.0") {
    x.result = "03:59.9"
  }
  x.hundredths_under_barrier = calculateGapInHundredths(x.result, "04:00.0")
})
maleMilers.sort(sortMilers)
maleMilers.forEach((x, idx) => {
  x.category_index = idx + 1
})

nonbinaryMilers.forEach(x => {
  x.date = new Date(x.date)
  x.gender = "non-binary"
  x.hundredths_under_barrier = calculateGapInHundredths(x.result, "04:30.0")
})
nonbinaryMilers.sort(sortMilers)
nonbinaryMilers.forEach((x, idx) => {
  x.category_index = idx + 1
})

femaleMilers.forEach(x => {
  x.date = new Date(x.date)
  x.gender = "female"
  x.hundredths_under_barrier = calculateGapInHundredths(x.result, "04:30.0")
})
femaleMilers.sort(sortMilers)
femaleMilers.forEach((x, idx) => {
  x.category_index = idx + 1
})

const allMilers = maleMilers.concat(nonbinaryMilers).concat(femaleMilers)

allMilers.sort(sortMilers);



allMilers.forEach((x, idx) => {
  x.catagory_index = x.index
  x.index = idx
  x.readable_date = x.date.toLocaleDateString();
  x.result = x.result.slice(1); // remove leading 0
  allMilers[idx] = Object.fromEntries(Object.entries(x).sort())
})

// write JSON string to a file
fs.writeFile('./all.milers.json', JSON.stringify(allMilers, null, 2), (err) => {
    if (err) {
        throw err;
    }
});

