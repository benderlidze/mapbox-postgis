
const tablesAndProps = { //all fields that should be send to DB 
    'poly_an': {
        fields: [
            { name: 'poly_an_id', type: "input", checkType: 'INTEGER' },
            { name: 'poly_an_name', type: "input" },
            { name: 'p_id', type: "input", checkType: 'INTEGER', callback: `getPName(this.value)` },
            { name: 'working', type: "dropdown" },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            { name: 'p_name', type: "input", disabled: true },
            { name: 'table_id', type: "input", disabled: true },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "orange"
    },
    'poly_b': {
        fields: [
            { name: 'b_id', type: "input", checkType: 'INTEGER', callback: `getBName(this.value)` },
            { name: 'default_ops', type: "dropdown" },
            { name: 'c_cat', type: "dropdown" },
            { name: 'c_type', type: "dropdown" },
            { name: 'recv_type', type: "dropdown" },
            { name: 'b_name', type: "input", disabled: true },
            { name: 'p_name', type: "input", disabled: true },
            { name: 'table_id', type: "input", disabled: true }
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },

        ],
        layerColor: "red"
    },
    'poly_p': {
        fields: [

            { name: 'p_id', type: "input", checkType: 'INTEGER', callback: `getPName(this.value)` },
            { name: 'p_group', type: "input" },
            { name: 'p_name', type: "input", disabled: true },
            { name: 'table_id', type: "input", disabled: true }
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "blue"
    },
    'poly_s_r': {
        fields: [

            { name: 'poly_s_r_name', type: "input" },
            { name: 'r_name', type: "input" },
            { name: 'table_id', type: "input" }
            // { name: 'poly_array', type: "input" },
            // { name: 'userid', type: "input" },
        ],
        layerColor: "green"
    },
    'poly_r': {
        fields: [
            //{ name: 'poly_r_id', type: "hidden", checkType: 'INTEGER' },
            { name: 'poly_r_name', type: "input" },
            { name: 'table_id', type: "input" }
            // { name: 'poly_array', type: "hidden" },
            // { name: 'userid', type: "hidden" },
        ],
        layerColor: "white"
    },
}

var colorArray = ['red', 'blue', 'green', 'orange', 'yellow',
    'purple', '#3366E6', '#999966', '#99FF99', '#B34D4D',];
let popup;
let selectedPolygonType = ""
let dataForDropdownLists = ""
let s;
const allPolygonLayers = [];
const allDOTSLayers = [];
const allPOINTSLayers = [];

let currentPolygonUniqueID;
const userName = "USER NAME";

//const info = document.getElementById("info");
const polygonInfo = document.getElementById("polygonInfo");
const toggleLayers = document.getElementById("toggleLayers");
const loadExistingPolygons = document.getElementById("loadExistingPolygons");
const savePolygon = document.getElementById("savePolygon")
const allPolygons = [];

const serverApiURL = 'http://176.223.134.242/~test/API.php';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vyc2Vyc2VyIiwiYSI6ImNrZnBpaWF5azBpMWMyeHBmdzJpdno1NzgifQ.4vBDF2DNuk-beXljllf3Yg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: { lng: -13.651979934790262, lat: 2.842170943040401 },
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


map.on("load", () => {

    map.addLayer({
        id: "raster-satellite-streets",
        source: {
            "type": "raster",
            "tiles": ["https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGV2cGFya2FzaHN1bWl0IiwiYSI6ImNqc242dmNvcTAwdno0YXFuMzQ4MGlzbWkifQ.nhpUN4VR3Lvd7_gjtsIesg"],
            "tileSize": 512
        },
        type: "raster",
        layout: { "visibility": "visible" }
    },
    );

    map.addControl(draw, 'top-left');
    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);
    map.on('draw.selectionchange', updateProps);

})

fetchDataForDropdownLists();

toggleLayers.addEventListener("click", () => {

    if (map.getLayer('raster-satellite-streets').visibility === 'visible') {
        map.setLayoutProperty('raster-satellite-streets', 'visibility', 'none')
        toggleLayers.innerHTML = "satellite"
    } else {
        map.setLayoutProperty('raster-satellite-streets', 'visibility', 'visible')
        toggleLayers.innerHTML = "streets"
    }


})

//save button 
/*
savePolygon.addEventListener("click", () => {
    const data = draw.getSelected();
    if (data.features.length > 0) {//we have at least one selected polygon
        data.features[0].geometry['crs'] = { "type": "name", "properties": { "name": "EPSG:3857" } };
        savePolygonData(data.features[0].geometry)
        draw.changeMode("simple_select")
    }
})
*/


Array.from(document.getElementsByName("points")).forEach(i => {
    i.addEventListener("change", e => {
        console.log('e.target.value', e.target.value);
        //toggleLayer(e.target.value);
        togglePOINTS(e.target.value);
    })
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


function togglePOINTS(layer) {
    console.log('layer', layer);

    const layerWithPrefix = 'points_' + layer;

    if (allPOINTSLayers.includes(layerWithPrefix)) {
        const index = allPOINTSLayers.indexOf(layerWithPrefix);
        if (index !== -1) {
            allPOINTSLayers.splice(index, 1);
        }
        //remove loaded polygons
        map.removeLayer(layerWithPrefix);
        map.removeSource(layerWithPrefix);

    } else {
        allPOINTSLayers.push(layerWithPrefix)
        fetchPOINTS(layer, 'points_')
    }
}
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

function toggleLayer(layerId) {

    if (allPolygonLayers.includes(layerId)) {
        const index = allPolygonLayers.indexOf(layerId);
        if (index !== -1) {
            allPolygonLayers.splice(index, 1);
        }
        //remove loaded polygons
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(layerId)) map.removeSource(layerId);
        map.off("click", layerId, editPolygon)

    } else {
        allPolygonLayers.push(layerId)
        fetchPolygonData(layerId)
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

function updateProps(geometry) {
    console.log('updateProps!!!!!!!!!!!', geometry);
    if (popup) popup.remove();
    if (geometry.features.length > 0) {
        //show info block with params
        /*
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
        */

        buildPropsByPolygonType(geometry.features[0].properties);

    }
}

function buildInput(data, currentValue, callback) {

    const displayName = data.name;
    const id = data.name

    let disabled = '';
    if (data.disabled) {
        disabled = "disabled"
    }

    let f = '';
    if (callback) {
        f = `oninput="${callback}"`;
    }

    let value = '';
    if (currentValue && currentValue[data.name]) {
        value = currentValue[data.name];
    }

    return ` <div class="row mb-2">
        <label class="col-sm-3 col-form-label col-form-label-sm" style="white-space: nowrap;">${displayName}</label>
        <div class="col-sm-8">
        <input type="email" class="form-control form-control-sm" ${disabled} id="${id}" value="${value}" ${f}>
        </div>
        </div>
    `
}

function buildDropDown(data, dataArray, currentValue, callback) {

    let disabled = ""
    if (dataArray.length <= 0) disabled = "disabled";


    let value = '';
    if (currentValue && currentValue[data.name]) {
        value = currentValue[data.name];
    }

    let onchange = "";
    if (callback) {
        onchange = `onchange="${callback}"`;
    }

    const list = dataArray.map(i => {
        let selected = '';
        if (i.id === value) {
            selected = 'selected';
        }
        return `<option value="${i.id}" ${selected}>${i.val}</option>`
    }).join("")

    return `
    <div class="row mb-2">
        <label class="col-sm-3 col-form-label col-form-label-sm">${data.name}</label>
        <div class="col-sm-8">
            <select class="form-select form-select-sm" id="${data.name}" ${disabled} ${onchange}>${list}</select>
        </div>
    </div>
    `

}

function updateVal(inputData) {

    document.getElementById("c_type").removeAttribute("disabled");
    document.getElementById("c_type").innerHTML = dataForDropdownLists.data.cgo
        .filter(i => i.cgo_value === document.getElementById("c_cat").value)
        .map(i => {
            let selected = '';
            if (inputData && i.cgo_id === inputData['c_type']) {
                selected = 'selected';
            }
            return `<option value="${i.cgo_id}" selected>${i.cgo_type}</option>`
        })

}


function buildPropsByPolygonType(inputData) {

    console.log('INPUT ADTA', inputData);
    // if (!table_id) table_id = "";

    if (!selectedPolygonType) { console.warn("Type of the polygon is not defined"); return; }
    if (!tablesAndProps[selectedPolygonType]) { console.warn("No props for this type of polygon"); return; }




    const fields = tablesAndProps[selectedPolygonType].fields.map(i => {

        let res;
        if (i.type === "input") {
            res = buildInput(i, inputData, i.callback)
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
                    { id: 'Yes', val: 'Yes' },
                    { id: 'No', val: 'No' },
                ]
            }

            if (i.name === 'c_cat') {
                res = buildDropDown(i, data, inputData, `updateVal()`)
                setTimeout(() => updateVal(inputData), 100);//to update the c_type dropdown 

            } else if (i.name === 'c_type') {
                res = buildDropDown(i, [], inputData)
            } else {
                res = buildDropDown(i, data, inputData)
            }

        }

        if (i.type === "hidden") {
            res = buildInput(i, "")
        }


        return res
    })

    const type_an = `
    <h3>${selectedPolygonType}</h3>

    <div class="dataBlock"  style="display:flex;flex-direction: column;">

        ${fields.join("")}    

        <div class="col-auto">
            <button class="saveButton btn btn-primary savePolygonData">Save</button>
            <button class="remove btn btn-primary removePolygonData">Remove</button>
        </div>
    </div>`

    const text = type_an;


    const uniqueId = selectedPolygonType + "_" + inputData.table_id
    if (currentPolygonUniqueID !== uniqueId) {
        currentPolygonUniqueID = uniqueId
        polygonInfo.innerHTML = text;
    }

    
    //return text;
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
        clearCurrentPolygonUniqueID()
    }
    if (e.target.classList.contains("removePolygonData")) {
        console.log('removePolygonData');
        removePolygonAndData();
    }

})


function clearCurrentPolygonUniqueID(){ //clear currentPolygonUniqueID after saving the data 
    currentPolygonUniqueID = '';
}

function removePolygonAndData() {


    var r = confirm("Do you want to remove the polygon?");
    if (!r) { return; }


    const error = [];
    //const selection = draw.getSelected();
    const selection = draw.getAll();
    if (selection.features.length === 0) { console.warn('Nothing to save! Select the polygon.'); return; }
    if (!selection.features[0].properties.table_id || !Number.isInteger(+selection.features[0].properties.table_id)) { console.warn('No table_id value.'); return; }

    console.log('selection', selection);

    //update_by_table_id
    const body = JSON.stringify({
        userName: userName,
        table_name: selectedPolygonType,
        removePolygonByTableId: selection.features[0].properties.table_id
    })

    //SEND DATA TO SERVER
    fetch(serverApiURL, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(res => res.json())
        .then(res => {
            if (res.done === "ok") {
                //popup.remove()
                console.log('--------------UPDATE EDITIED LAYER------------',);
                draw.changeMode("simple_select")
                draw.deleteAll()
                map.removeLayer(selectedPolygonType)
                map.removeSource(selectedPolygonType)
                fetchPolygonData(selectedPolygonType)
                polygonInfo.innerHTML = '';
            }
        });
}


function savePolygonAndData() {

    const error = [];

    //const selection = draw.getSelected();
    const selection = draw.getAll();
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

    //update_by_table_id
    const body = JSON.stringify({
        userName: userName,
        polygon: polygon,
        selectedPolygonType: selectedPolygonType,
        ...results
    })


    //SEND DATA TO SERVER
    fetch(serverApiURL, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(res => res.json())
        .then(res => {
            if (res.done === "ok") {
                //popup.remove()

                //reload/update edited layer
                console.log('--------------UPDATE EDITIED LAYER------------',);
                draw.changeMode("simple_select")
                // draw.deleteAll()
                map.removeLayer(selectedPolygonType)
                map.removeSource(selectedPolygonType)
                fetchPolygonData(selectedPolygonType)
                polygonInfo.innerHTML = '';
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

async function getBName(b_id) {
    b_id = Number(b_id);
    let p_name = '';
    let b_name = '';

    const f = await fetch(serverApiURL + "?getBName=" + b_id);
    const j = await f.json()
    if (j && j.error === "") {
        console.log('j', j);
        if (j.data.p_name && j.data.p_name !== "") p_name = j.data.p_name;
        if (j.data.b_name && j.data.b_name !== "") b_name = j.data.b_name;
    }

    document.getElementById("p_name").value = p_name;
    document.getElementById("b_name").value = b_name;
}
async function getPName(id) {
    id = Number(id);
    let p_name = '';

    const f = await fetch(serverApiURL + "?getPName=" + id);
    const j = await f.json()
    if (j && j.error === "") {
        console.log('j', j);
        if (j.data.p_name && j.data.p_name !== "") p_name = j.data.p_name;
    }

    document.getElementById("p_name").value = p_name;
}

async function fetchDataForDropdownLists() {
    const f = await fetch(serverApiURL + "?getDataForDropdown=true");
    const j = await f.json()
    if (j && j.error === "") {
        dataForDropdownLists = j;
    }
}

let currentEditPolygon = "";

function editPolygon(e) {

    const polygon = e.features[0]
    console.log('---------------------------------',);

    console.log('polygon', polygon);
    console.log('PROPS', polygon.properties);
    console.log('SOURCE', polygon.source);
    console.log('---------------------------------',);


    if (!currentEditPolygon || currentEditPolygon !== polygon.source + "_" + polygon.properties.table_id) {
        currentEditPolygon = polygon.source + "_" + polygon.properties.table_id;
        draw.deleteAll()
        draw.add(polygon)
    }

    console.log('currentEditPolygon', currentEditPolygon === polygon.source + "_" + polygon.properties.table_id);

    /*
    console.log('currentEditPolygon===========================>', currentEditPolygon);
    const polygonType = e.features[0].source;//get the polygon type from DATA 
    if (!polygonType || !Object.keys(tablesAndProps).includes(polygonType)) { console.warn("Polygon type is not defined or is not supported"); return; }
    console.log('polygonType', polygonType)
    console.log('PROPS', tablesAndProps[polygonType])
    selectedPolygonType = polygonType;
    */

    selectedPolygonType = polygon.source
    buildPropsByPolygonType(polygon.properties);
}

async function fetchPolygonData(layerId) {
    const f = await fetch(serverApiURL + "?getPolygons=true&layerId=" + layerId);
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        const collection = turf.featureCollection(j.data);

        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(layerId)) map.removeSource(layerId);

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

        map.on("click", layerId, editPolygon)
    }
}
async function fetchPOINTS(layerId, prefix) {

    const f = await fetch(serverApiURL + "?getPOINTS&typeId=" + layerId.toLowerCase());
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        const c = j.data.map(i => {
            console.log('i', i);
            console.log('i', i.latitude);

            return turf.point([+i.longitude, +i.latitude], i)
        });

        const collection = turf.featureCollection(c);

        map.addSource(prefix + layerId, {
            'type': 'geojson',
            'data': collection
        });

        map.addLayer({
            'id': prefix + layerId,
            'type': 'symbol',
            'source': prefix + layerId,
            'layout': {
                'text-field': '■',
                'text-size': 25,
                'icon-allow-overlap': true,
                'text-allow-overlap': true,
            },
            'paint': {
                'text-color': colorArray[allPOINTSLayers.length],
            }
        });


        map.on("click", prefix + layerId, showPopup)
        map.on('mouseenter', prefix + layerId, mouseEnter);
        map.on('mouseleave', prefix + layerId, mouseLeave);
        // Add a new layer to visualize the polygon.
        /*
        map.addLayer({
            'id': prefix + layerId,
            'type': 'circle',
            'source': prefix + layerId,
            'paint': {
                'circle-radius': 5,
                'circle-color': "blue"
            }
        });
        */
    }
}
async function fetchDOTS(layerId) {
    const f = await fetch(serverApiURL + "?getDOTS&typeId=" + layerId);
    const j = await f.json()
    console.log('j', j);
    if (j && j.error === "" && j.data.length > 0) {

        const c = j.data.map(i => {
            console.log('i', i);
            console.log('i', i.latitude);

            return turf.point([+i.longitude, +i.latitude], i)
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
                'circle-color': colorArray[allDOTSLayers.length]
            }
        });

        map.on("click", layerId, showPopup)
        map.on('mouseenter', layerId, mouseEnter);
        map.on('mouseleave', layerId, mouseLeave);
    }
}

// Create a popup, but don't add it to the map yet.
const popupDOTS = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

function showPopup(e) {

}

function mouseEnter(e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const props = e.features[0].properties;

    console.log('description', e.features[0].properties);

    const descr = Object.entries(props).map(i => {
        return `
            <div>
                <b>${i[0]}</b>: ${i[1]}
            </div>
        `
    }).join("")

    map.getCanvas().style.cursor = 'pointer';
    popupDOTS.setLngLat(coordinates).setHTML(descr).addTo(map);
}

function mouseLeave(e) {
    map.getCanvas().style.cursor = '';
    popupDOTS.remove();
}



//HELPERS 
function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}