
mapboxgl.accessToken = 'pk.eyJ1IjoibmF0ZWJyZW5uYW5kIiwiYSI6ImNsNTNhNmV0YzBtb3Yza3FxZ2tkbmd4ZnEifQ.e6naaLlF3f-pQqSkQ7aV7Q';

const athletesResp = await fetch("/all.milers.json");
const athletes = await athletesResp.json();

const index = new FlexSearch.Index({
  "preset": "performance",
  "tokenize": "reverse",
  "charset": "latin:extra",
});
athletes.forEach(a => {
  index.add(a.index, a.name.toLowerCase())
})

function setup_map(map_settings, trees) {
  var map = new mapboxgl.Map(map_settings);
  map.on('load', () => {
   map.addSource('trees', {
     // This GeoJSON contains features that include an "icon"
     // property. The value of the "icon" property corresponds
     // to an image in the Mapbox Streets style's sprite.
     'type': 'geojson',
     'data': {
       'type': 'FeatureCollection',
       'features': trees,
     }
   });

    // Add a layer showing the trees
    map.addLayer({
      'id': 'trees',
      'type': 'symbol',
      'source': 'trees',
      'layout': {
        'icon-image': '{icon}',
        'icon-allow-overlap': true
      }
    });

    // When a click event occurs on a feature in the trees layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'trees', (e) => {
      const athlete = athletes[e.features[0].properties.id];

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .setMaxWidth("50%")
        .addTo(map);
    });

    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's
        // location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which
        // direction the device is heading.
        showUserHeading: true
      })
    );
  });
  return map;
}

// columns
//     0   1   2   3 ...
//r 0  1st 2nd ...
//o 1
//w 2
//s 3
//  ...

// map_settings: {start, row_offset, col_offset}
function calculate_coordinate(map_settings, row, col) {
  return (map_settings['start'] +
          row * map_settings['row_offset'] +
          col * map_settings['col_offset'])
}

// layers: [ column id, [list, of, columns, by, [start, end]] ]
// map_settings: { latitude: {start, row_offset, col_offset},
//                longitude: {start, row_offset, col_offset} }
function build_trees_array(layers, map_settings, first_athlete_index, last_athlete_index) {
  const min_row = Math.min(...layers.map(row => row[1]).flat().map(column => column[0]))
  const max_row = Math.max(...layers.map(row => row[1]).flat().map(column => column[1]))

  let trees = [];
  let counter = first_athlete_index;
  for (let row = min_row; row <= max_row; row++) {
    for (let col = 0; col < layers.length; col++) {
      const sections = layers[col];
      if (sections[1].map(s => (s[0] <= row && row <= s[1])).some(x => !!x)) {
        const athlete = athletes[counter];
        trees = trees.concat({
           'type': 'Feature',
           'properties': {
             'description': (
                 `#${athlete.category_index}: ${athlete.name}<br>Ran ${athlete.result} in ${athlete.location} on ${athlete.readable_date}<br>` +
                 `<img class="tree-pic" src="/assets/images/trees/${athlete.category}.${athlete.index}.jpg">`
             ),
             'icon': 'park',
             'id': counter,
           },
           'geometry': {
           'type': 'Point',
             'coordinates': [
               calculate_coordinate(map_settings['longitude'], row, col),
               calculate_coordinate(map_settings['latitude'], row, col),
             ]
           }
         });
        counter += 1;
        if (counter > last_athlete_index) {
          return trees;
        }
      }
    }
  }
  return trees;
}

// historic grove
const hg_first_athlete_index = 0, hg_last_athlete_index = 430;
const hg_layers = [
  ['A', [[0,  25]]],
  ['B', [[0,  26]]],
  ['C', [[0,  27]]],
  ['D', [[0,  28]]],
  ['E', [[0,  42]]],
  ['F', [[0,  42]]],
  ['G', [[0,  40]]],
  ['H', [[2,  38]]],
  ['I', [[4,  36]]],
  ['J', [[5,  35]]],
  ['K', [[6,  35]]],
  ['L', [[7,  35]]],
  ['M', [[8,  23], [28, 34]]],
  ['N', [[11, 21]]],
];
const hg_map_settings = {
  latitude: { // North / South
    start: 44.03066,
    row_offset: -0.000053,
    col_offset: 0,
  },
  longitude: { // East / West
    start: -123.01955,
    row_offset: 0.000006,
    col_offset: 0.000075,
  },
}
const hg_trees = build_trees_array(hg_layers, hg_map_settings, hg_first_athlete_index, hg_last_athlete_index)
// const historic_grove_map = setup_map({
//   container: 'historic_grove_map',
//   style: 'mapbox://styles/natebrennand/cl53adi83001d15o20w8ac36t', // illustrated
//   // style: 'mapbox://styles/natebrennand/cl54gib86000x15o1sfvcdt6h', // sattelite
//   center: [-123.0190, 44.0295],
//   zoom: 17
// }, hg_trees);



// new grove
const ng_first_athlete_index = 431, ng_last_athlete_index = 691;
const ng_layers = [
  ['A', [[58, 85]]],
  ['B', [[31, 85]]],
  ['C', [[18, 85]]],
  ['D', [[11, 85]]],
  ['E', [[2, 85]]],
  ['F', [[0, 85]]],
  ['G', [[0, 85]]],
  ['H', [[0, 85]]],
  ['I', [[0, 85]]],
  ['J', [[1, 85]]],
  ['K', [[2, 85]]],
  ['L', [[3, 50]]],
  ['M', [[3, 48]]],
  ['N', [[4, 23]]],
  ['O', [[5, 23]]],
  ['P', [[5, 19]]],
  ['Q', [[6, 18]]],
];
const ng_map_settings = {
  latitude: { // North / South
    start:      44.03099,
    row_offset: -0.000053,
    col_offset:  0,
  },
  longitude: { // East / West
    start:   -123.0226,
    row_offset: 0.000006,
    col_offset: 0.000075,
  },
}
const ng_trees = build_trees_array(ng_layers, ng_map_settings, ng_first_athlete_index, ng_last_athlete_index)
// const new_grove_map = setup_map({
//   container: 'new_grove_map',
//   // style: 'mapbox://styles/natebrennand/cl53adi83001d15o20w8ac36t', // illustrated
//   style: 'mapbox://styles/natebrennand/cl54gib86000x15o1sfvcdt6h', // sattelite
//   center: [-123.0216, 44.0288],
//   zoom: 16.5
// }, ng_trees);

// set the zoom based on window size.
let zoomLevel = 15.5;
if (window.innerWidth > 800) {
  zoomLevel = 17;
} else if (window.innerWidth > 600) {
  zoomLevel = 16;
}

// both groves
const doris_ranch_map = setup_map({
  container: 'doris_ranch_map',
  // style: 'mapbox://styles/natebrennand/cl53adi83001d15o20w8ac36t', // illustrated
  style: 'mapbox://styles/natebrennand/cl54gib86000x15o1sfvcdt6h', // sattelite
  center: [-123.0204, 44.0297],
  zoom: zoomLevel,
}, hg_trees.concat(ng_trees));


const searchInput = document.querySelector('.input');
const searchResults = document.getElementById('results-list');
const clearButton = document.getElementById('clear');

function clearList() {
    // looping through each child of the search results list and remove each child
    while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.firstChild)
    }
}
clearButton.addEventListener("click", () => {
    clearList()
})

// creating and declaring a function called "setList"
// setList takes in a param of "results"
function setList(results) {
  for (const person of results){
    // creating a li element for each result item
    const resultItem = document.createElement('li')

    // adding a class to each item of the results
    resultItem.classList.add('result-item')

    // grabbing the name of the current point of the loop and adding the
    // name as the list item's text
    const text = document.createTextNode(person.name)

    // appending the text to the result item
    resultItem.appendChild(text)

    // appending the result item to the list
    searchResults.appendChild(resultItem)
  }
};

searchInput.addEventListener("input", (e) => {
  const value = e.target.value || e.target.value.trim().toLowerCase();

  if (value && value.length > 0) {
    clearList();

    // 4. return the results only if the value of the search is included
    // in the person's name we need to write code (a function for filtering
    // through our data to include the search input value)
    const athleteIndexes = index.search(value);

    doris_ranch_map.setFilter('trees', [
      "in",
      ["get", "id"],
      ["literal", athleteIndexes],
    ]);

    const results = athleteIndexes.map(i => athletes[i]);
    setList(results);
  } else {
    doris_ranch_map.setFilter('trees', null);
    clearList();
  }
});

