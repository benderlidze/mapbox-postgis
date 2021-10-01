const info = document.getElementById("info");
const loadExistingPolygons = document.getElementById("loadExistingPolygons");
const savePolygon = document.getElementById("savePolygon")

const allPolygons = [];

const serverApiURL = 'http://176.223.134.242/~test/API.php';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyc2Vyc2VyIiwiYSI6ImNrZnBpaWF5azBpMWMyeHBmdzJpdno1NzgifQ.4vBDF2DNuk-beXljllf3Yg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: [-91.874, 42.76], // starting position [lng, lat]
    zoom: 2 // starting zoom
});

const draw = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
        polygon: true,
        trash: true
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    //defaultMode: 'draw_polygon'
});
map.addControl(draw);

map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);
map.on('draw.selectionchange', updateProps);

//save button 
savePolygon.addEventListener("click", () => {

    const data = draw.getSelected();
    if (data.features.length > 0) {//we have at least one selected polygon

        data.features[0].geometry['crs'] = { "type": "name", "properties": { "name": "EPSG:3857" } };
        savePolygonData(data.features[0].geometry)
        draw.changeMode("simple_select")
    }

})

loadExistingPolygons.addEventListener("change", () => {
    console.log('loadExistingPolygons', loadExistingPolygons);
    if (loadExistingPolygons.checked) {
        //load selected polygons 
        fetchPolygonData()
    } else {
        //remove all loaded polygons
        allPolygons.forEach(i => {
            console.log('i', i);

            const id = i.name;
            map.removeLayer(id);
            map.removeSource(id);
        })
        allPolygons.length = 0;
    }
})

let popup;
function updateProps(geometry) {
    console.log('props', geometry);

    if (geometry.features.length > 0) {
        //show info block with params
        info.style.display = "inline"
        info.innerHTML = JSON.stringify(geometry.features[0])

        const center = turf.centerOfMass(geometry.features[0]);
        console.log('center', center);

        if (center) {

            popup = new mapboxgl.Popup({
                closeOnClick: false,
                className: "mpopup",
                maxWidth: 300
            })
                .setLngLat(center.geometry.coordinates)
                .setHTML(buildPropsByPolygonType())
                .addTo(map);
        }

    } else {
        console.log('popup', popup);
        if (popup) popup.remove();

        info.style.display = "none"
    }
}



function buildPropsByPolygonType() {


    const type_an = `<div style="display:flex;">
        <div class="itemRow">
            <div class="item">poly_an_name</div>
            <div class="item"><input type="text" id="poly_an_name"></div>
        </div>
    </div>`




    const text = type_an;
    return text;
}

function updateArea(e) {
    const data = draw.getAll();
}


function savePolygonData(polygonData) {

    console.log('polygonData', polygonData);
    if (!polygonData || polygonData === "") { console.warn("Empty data"); return; }

    const userName = "USER NAME";
    fetch(serverApiURL, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: userName,
            polygon: polygonData
        })
    })
        .then(res => res.json())
        .then(res => console.log(res));

}


async function fetchPolygonData() {

    const f = await fetch(serverApiURL + "?getPolygons=true");
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        j.data.forEach(i => {
            console.log('i', i);
        });

        const collection = turf.featureCollection(j.data);
        const uniqueId = `polyLayer_${new Date().getTime()}`;

        map.addSource(uniqueId, {
            'type': 'geojson',
            'data': collection
        });

        // Add a new layer to visualize the polygon.
        map.addLayer({
            'id': uniqueId,
            'type': 'fill',
            'source': uniqueId, // reference the data source
            'layout': {},
            'paint': {
                'fill-color': '#0080ff', // blue color fill
                'fill-opacity': 0.5
            }
        });

        allPolygons.push({
            name: uniqueId,
        })
    }


}