
const tablesAndProps = { //all fields that should be send to DB 
    'poly_an': {
        fields: [
            { name: 'poly_an_id', type: "input", checkType: 'INTEGER' },
            { name: 'poly_an_name', type: "input" },
            { name: 'p_id', type: "input", checkType: 'INTEGER' },
            { name: 'working', type: "dropdown" },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "orange"
    },
    'poly_b': {
        fields: [
            { name: 'b_id', type: "input", checkType: 'INTEGER' },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            { name: 'b_name', type: "input" },
            { name: 'p_name', type: "input" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },

        ],
        layerColor: "red"
    },
    'poly_p': {
        fields: [

            { name: 'p_id', type: "input", checkType: 'INTEGER' },
            { name: 'p_group', type: "input" },
            { name: 'p_name', type: "input" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "blue"
    },
    'poly_s_r': {
        fields: [

            { name: 'poly_s_r_name', type: "input" },
            { name: 'r_name', type: "input" },
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "green"
    },
    'poly_r': {
        fields: [
            //{ name: 'poly_r_id', type: "hidden", checkType: 'INTEGER' },
            { name: 'poly_r_name', type: "input" },
            // { name: 'poly_array', type: "hidden" },
            // { name: 'userid', type: "hidden" },
        ],
        layerColor: "white"
    },
}

let selectedPolygonType = ""
let dataForDropdownLists = ""
let s;
const allPolygonLayers = [];
const allDOTSLayers = [];

const userName = "USER NAME";

//const info = document.getElementById("info");
const loadExistingPolygons = document.getElementById("loadExistingPolygons");
const savePolygon = document.getElementById("savePolygon")
const allPolygons = [];

const serverApiURL = 'http://176.223.134.242/~test/API.php';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyc2Vyc2VyIiwiYSI6ImNrZnBpaWF5azBpMWMyeHBmdzJpdno1NzgifQ.4vBDF2DNuk-beXljllf3Yg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center:  {lng: -13.651979934790262, lat: 2.842170943040401},
    zoom: 0 // starting zoom
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


Array.from(document.getElementsByName("dots")).forEach(i => {
    i.addEventListener("change", e => {
        console.log('e.target.value', e.target.value);
        //toggleLayer(e.target.value);
        toggleDOTS(e.target.value);
    })
})

Array.from(document.getElementsByName("load")).forEach(i => {
    i.addEventListener("change", e => {
        console.log('e.target.value', e.target.value);
        toggleLayer(e.target.value);
    })
})
function toggleDOTS(layer) {
    if (allDOTSLayers.includes(layer)) {
        const index = allDOTSLayers.indexOf(layer);
        if (index !== -1) {
            allDOTSLayers.splice(index, 1);
        }
        //remove loaded polygons
        map.removeLayer(layer);
        map.removeSource(layer);

    } else {
        allDOTSLayers.push(layer)
        fetchDOTS(layer)
    }
}

function toggleLayer(layer) {

    if (allPolygonLayers.includes(layer)) {
        const index = allPolygonLayers.indexOf(layer);
        if (index !== -1) {
            allPolygonLayers.splice(index, 1);
        }
        //remove loaded polygons
        map.removeLayer(layer);
        map.removeSource(layer);

    } else {
        allPolygonLayers.push(layer)
        fetchPolygonData(layer)
    }



}
/*
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
*/
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
        <input type="email" class="form-control form-control-sm" id="${id}" value="${currentValue}">
        </div>
        </div>
    `
}
function buildDropDown(id, displayName, dataArray, callback) {

    let disabled = ""
    if (dataArray.length <= 0) disabled = "disabled";

    let onchange = "";
    if (callback) {
        onchange = `onchange="${callback}"`;
    }
    const list = dataArray.map(i => `<option value="${i.id}">${i.val}</option>`)
    return `
    <div class="row mb-2">
        <label class="col-sm-3 col-form-label col-form-label-sm">${displayName}</label>
        <div class="col-sm-8">
            <select class="form-select form-select-sm" id="${id}" ${disabled} ${onchange}>${list}</select>
        </div>
    </div>
    `
}

function updateVal() {

    console.log('this', this);
    document.getElementById("c_type").removeAttribute("disabled");
    document.getElementById("c_type").innerHTML = dataForDropdownLists.data.cgo
        .filter(i => i.cgo_value === document.getElementById("c_cat").value)
        .map(i => `<option value="${i.cgo_id}">${i.cgo_type}</option>`)

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


            if (i.name === 'c_cat') {
                data = [...new Set(dataForDropdownLists.data.cgo.map(i => i.cgo_value))].map(i => {
                    return { id: i, val: i }
                })
            }
            if (i.name === 'c_type') {
                data = dataForDropdownLists.data.cgo.map(i => {
                    return { id: i.cgo_id, val: i.cgo_value }
                })
            }
            if (i.name === 'default_ops') {
                data = dataForDropdownLists.data.default_ops.map(i => {
                    return { id: i.default_ops_id, val: i.default_ops_value }
                })
            }
            if (i.name === 'recv_type') {
                data = dataForDropdownLists.data.recv_type.map(i => {
                    return { id: i.recv_type_id, val: i.recv_type }
                })
            }
            if (i.name === 'working') {
                data = [
                    { id: 'true', val: 'Yes' },
                    { id: 'false', val: 'No' },
                ]
            }

            console.log('i.name', i.name);

            if (i.name === 'c_cat') {
                res = buildDropDown(i.name, i.name, data, `updateVal()`)
            } else if (i.name === 'c_type') {
                res = buildDropDown(i.name, i.name, [])
            } else {
                res = buildDropDown(i.name, i.name, data)
            }

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
            <button class="saveButton btn btn-primary savePolygonData">Save</button>
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
        selectedPolygonType = type
    }

    if (e.target.classList.contains("savePolygonData")) {
        console.log('savePolygonData');
        savePolygonAndData();
    }

})


function savePolygonAndData() {

    const error = [];

    const selection = draw.getSelected();
    if (selection.features.length === 0) { console.warn('Nothing to save! Select the polygon.'); return; }

    const polygon = selection.features[0].geometry

    const results = {};
    const fields = tablesAndProps[selectedPolygonType].fields;

    fields.forEach(i => {
        console.log('i', i);
        const node = document.getElementById(i.name)
        //results.push({ name: i.name, value: node.value })

        if (i.checkType && i.checkType === "INTEGER") {//check for input type
            if (!isInt(node.value)) {
                console.log('node.value!!!!', node.value);
                error.push(`${i.name} must be integer`);
            }
        }

        results[i.name] = node.value;
    })

    if (error.length > 0) {
        alert(error.join("\n"));
        return;
    }

    //SEND DATA TO SERVER
    fetch(serverApiURL, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: userName,
            polygon: polygon,
            selectedPolygonType: selectedPolygonType,
            ...results
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.done === "ok") {
                popup.remove()
            }
        });

}

function updateArea(e) {
    const data = draw.getAll();
}


function savePolygonData(polygonData) {

    console.log('polygonData', polygonData);
    if (!polygonData || polygonData === "") { console.warn("Empty data"); return; }

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
    if (j && j.error === "") {
        dataForDropdownLists = j;
    }
}

async function fetchPolygonData(layerId) {
    const f = await fetch(serverApiURL + "?getPolygons=true&layerId=" + layerId);
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        j.data.forEach(i => {
            console.log('i', i);
        });

        const collection = turf.featureCollection(j.data);

        map.addSource(layerId, {
            'type': 'geojson',
            'data': collection
        });

        // Add a new layer to visualize the polygon.
        map.addLayer({
            'id': layerId,
            'type': 'fill',
            'source': layerId, // reference the data source
            'layout': {},
            'paint': {
                // 'fill-color': '#0080ff', // blue color fill
                'fill-color': tablesAndProps[layerId]?.layerColor || "blue",
                'fill-opacity': 0.5
            }
        });
    }
}
async function fetchDOTS(layerId) {
    const f = await fetch(serverApiURL + "?getDOTS&typeId=" + layerId);
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        const c = j.data.map(i => {
            console.log('i', i);
            console.log('i',i.latitude);

            return turf.point([+i.longitude,+i.latitude], i)
        });

        const collection = turf.featureCollection(c);

        map.addSource(layerId, {
            'type': 'geojson',
            'data': collection
        });

        // Add a new layer to visualize the polygon.
        map.addLayer({
            'id': layerId,
            'type': 'circle',
            'source': layerId,
            'paint': {
                'circle-radius': 5,
                'circle-color': "red"
            }
        });
    }
}


//HELPERS 
function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}