// columns
//     0   1   2   3 ...
//r 0  1st 2nd ...
//o 1
//w 2
//s 3
//  ...

const layers = [
  ['A', [[0,25]]],
  ['B', [[0,26]]],
  ['C', [[0,27]]],
  ['D', [[0,28]]],
  ['E', [[0,42]]],
  ['F', [[0,42]]],
  ['G', [[0,40]]],
  ['H', [[2,38]]],
  ['I', [[4,36]]],
  ['J', [[5,35]]],
  ['K', [[6,35]]],
  ['L', [[7,35]]],
  ['M', [[8,23], [28,34]]],
  ['N', [[11,21]]],
];

const min_row = Math.min(...layers.map(row => row[1]).flat().map(column => column[0]))
const max_row = Math.max(...layers.map(row => row[1]).flat().map(column => column[1]))

const starting_latitude = 44.0305;    // North / South
const starting_longitude = -123.0195; // East /  West

const latitude_offset = -0.0001, longitude_offset = 0.0001;

let trees = [];
let counter = 0;
for (let row = min_row; row <= max_row; row++) {
  for (let col = 0; col < layers.length; col++) {
    const sections = layers[col];
    if (sections[1].map(s => (s[0] <= row && row <= s[1])).some(x => !!x)) {
      counter += 1;
      trees = trees.concat([[counter, [col, row]]])
    }
  }
}

console.log(counter);
console.log(trees);
