const tablesAndProps = { //all fields that should be send to DB 
    'poly_an': {
        fields: [
            { name: 'poly_an_id', type: "input" },
            { name: 'poly_an_name', type: "input" },
            { name: 'p_id', type: "input" },
            { name: 'working', type: "dropdown" },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ]
    },
    'poly_b': {
        fields: [
            { name: 'poly_b_id', type: "input" },
            { name: 'b_id', type: "input" },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },

        ]
    },
    'poly_p': {
        fields: [
            { name: 'poly_p_id', type: "input" },
            { name: 'p_id', type: "input" },
            { name: 'p_group', type: "dropdown" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ]
    },
    'poly_s_r': {
        fields: [
            { name: 'poly_sr_id', type: "input" },
            { name: 's_r_name', type: "input" },
            { name: 'r_name', type: "dropdown" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ]
    },
    'poly_r': {
        fields: [
            { name: 'poly_r_id', type: "hidden" },
            { name: 'r_name', type: "input" },
            // { name: 'poly_array', type: "hidden" },
            // { name: 'userid', type: "hidden" },
        ]
    },
}

let selectedPolygonType = ""
let dataForDropdownLists = ""
//const info = document.getElementById("info");
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
map.addControl(draw, 'top-left');

map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);
map.on('draw.selectionchange', updateProps);

fetchDataForDropdownLists();

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
    if (popup) popup.remove();

    if (geometry.features.length > 0) {
        //show info block with params

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

    }
}

function buildInput(id, displayName, currentValue) {
    return ` <div class="row mb-2">
        <label class="col-sm-3 col-form-label col-form-label-sm" style="white-space: nowrap;">${displayName}</label>
        <div class="col-sm-8">
        <input type="email" class="form-control form-control-sm" id="${id}e" value="${currentValue}">
        </div>
        </div>
    `
}
function buildDropDown(id, displayName, dataArray) {
    if (dataArray.length <= 0) return;
    const list = dataArray.map(i => `<option value="${i}">${i}</option>`)
    return `
    <div class="row mb-2">
        <label class="col-sm-3 col-form-label col-form-label-sm">${displayName}</label>
        <div class="col-sm-8">
            <select class="form-select form-select-sm" id="${id}">${list}</select>
        </div>
    </div>
    `

}

function buildPropsByPolygonType(table_id) {

    if (!table_id) table_id = "";

    if (!selectedPolygonType) { console.warn("Type of the polygon is not defined"); return; }
    if (!tablesAndProps[selectedPolygonType]) { console.warn("No props for this type of polygon"); return; }


    const fields = tablesAndProps[selectedPolygonType].fields.map(i => {

        let res;
        if (i.type === "input") {
            res = buildInput(i.name, i.name, "")
        }

        if (i.type === "dropdown") {
            res = buildDropDown(i.name, i.name, ["123", "test"])
        }

        if (i.type === "hidden") {
            res = buildInput(i.name, i.name, "")
        }


        return res
    })

    /*
    ${buildInput('poly_an_name', 'poly an name', "")}
    ${buildInput('P ID', 'p_id', "")}
    ${buildDropDown('working', ['test a ', 'test b '])}
    */

    const type_an = `
    <h3>${selectedPolygonType}</h3>

    <div class="dataBlock" table_id="${table_id}" style="display:flex;flex-direction: column;">

        ${fields.join("")}    

        <div class="col-auto">
            <button class="saveButton btn btn-primary">Save</button>
            <button class="remove btn btn-primary">Remove</button>
        </div>
    </div>`

    const text = type_an;
    return text;
}


document.addEventListener("click", e => {

    if (e.target.classList.contains("saveButton")) {
        console.log('SAVE button');
    }


    const selectedPType = Array.from(document.getElementsByName('polygonType')).filter(i => i.checked)
    if (selectedPType.length > 0) {
        const type = selectedPType[0].id
        console.log('POLYGON type', type);
        selectedPolygonType = type
    }
})


function savePolygonAndData() {

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


async function fetchDataForDropdownLists() {

    const f = await fetch(serverApiURL + "?getDataForDropdown=true");
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {
        dataForDropdownLists = j;
        console.log('j', j);
    }

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