// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(earthquakes) {
  // Once we get a response, send the data.features object to the createFeatures function
  // createFeatures(data.features);
  d3.json(tectonicPlates, function(faultlines) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakes.features, faultlines.features);
  })
});

function getColor(mag){
  // const mag = feature.properties.mag;
  if (mag >= 5) {
    return "#BF3100"
  } else if (mag >= 4) {
    return "#F17604"
  } else if (mag >= 3) {
    return "#EC9F05"
  } else if (mag >= 2) {
    return "#FFCB1F"
  } else if (mag >= 1) {
    return "#D5D33B"
  }

  return "#AAC705";
}

function createFeatures(earthquakeData, faultlineData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachEarthquake(feature, latlng) {
    return L.circleMarker(latlng, {
      stroke: false,
      radius: feature.properties.mag*5,
      fillColor: getColor(feature.properties.mag),
      fillOpacity: 0.4
    })
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, { pointToLayer: onEachEarthquake });

    var myStyle = {
      "color": "orange",
      "weight": 3,
      "opacity": 0.65,
      "fillOpacity": 0
  };

  var faultlines = L.geoJSON(faultlineData, {
    style: myStyle
});
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, faultlines);
}

function createMap(earthquakes, faultlines) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    // noWrap: true,
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    // noWrap: true,
    accessToken: API_KEY
  });

  var greyscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    // noWrap: true,
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Greyscale": greyscalemap,
    "Satellite": satellitemap,
    "Outdoors": streetmap
  };

  console.log(earthquakes)
  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultlines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
   /*  center: [
      37.09, -95.71
    ],
    zoom: 5, */
    'center': [0,0],
    'zoom': 2.5,
    'minZoom': 1,
    // 'maxBounds': [
    //   [90,-180],
    //   [-90, 180]
    // ],
    layers: [greyscalemap, earthquakes]
  });

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5]

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=

            '<i style="background: ' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

legend.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 

}
