"use strict";
window.onload = getState();

// variable
let state;
let district;
let api_link;
let tbody;
let dtObj;
let date;
let age;
let dose;
let jsobj;
const music = new Audio("https://www.dropbox.com/s/lelq91cxaa0mwcm/music.mp3?raw=1");
let stop;
let times = 0;
let check = true;

// get states

function getState() {
    let link = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
    let req = new XMLHttpRequest();
    req.open("GET", link, true);
    req.send();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            let jsobj = JSON.parse(req.responseText);
            // console.log(jsobj);
            for (let i = 0; i < jsobj.states.length; i++) {
                let opt = document.createElement("OPTION");
                opt.setAttribute("value", jsobj.states[i].state_id);
                let name = document.createTextNode(jsobj.states[i].state_name);
                opt.appendChild(name);
                document.getElementById("state").appendChild(opt);
            }

        }
    };
}

// get district

function getDistrict(statecode) {
    document.getElementById("district").innerHTML = "<option value='0'>Select District</option>";

    let link = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + statecode;
    let req = new XMLHttpRequest();
    req.open("GET", link, true);
    req.send();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            let jsobj = JSON.parse(req.responseText);
            // console.log(jsobj)
            for (let i = 0; i < jsobj.districts.length; i++) {
                let opt = document.createElement("OPTION");
                opt.setAttribute("value", jsobj.districts[i].district_id);
                let name = document.createTextNode(jsobj.districts[i].district_name);
                opt.appendChild(name);
                document.getElementById("district").appendChild(opt);
            }

        }
    };
}


// validation

function search() {
    state = document.getElementById("state").value;
    district = document.getElementById("district").value;
    dtObj = new Date(document.getElementById("date").value);
    date = dtObj.getDate() + "-" + (dtObj.getMonth() + 1) + "-" + dtObj.getFullYear();
    console.log(typeof (date) + " , " + date);
    age = document.getElementById("age").value;
    dose = document.getElementById("dose").value;

    console.log(age, dose);
    tbody = document.getElementById("data");
    api_link = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=" + district + "&date=" + date;
    console.log(state);
    console.log(district);
    if (state == 0 || district == 0 || age == 0 || dose == 0 || date === "NaN-NaN-NaN") {
        alert("Plese select State, District, age, dose and Date");
    }
    else {
        if (check) {
            document.getElementById("search").classList.add("d-none");
            document.getElementById("stop").classList.remove("d-none");
            fetch_data();
            stop = setInterval(fetch_data, 20000); //fetch data after every 20 sec
            check = false;
        }
    }
}

// get data

function fetch_data() {
    tbody.innerHTML = "";
    times++;
    document.getElementById("loader").classList.remove("d-none"); //show spinner
    document.getElementById("times").innerHTML = "Search " + times + " times" //how many times search
    let req = new XMLHttpRequest();
    req.open("GET", api_link, true);
    req.send();
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            jsobj = JSON.parse(req.responseText);
            console.log(jsobj);
            if (jsobj.sessions.length == 0) {
                document.getElementById("result").innerHTML = "NO Slot Available"
            }
            else {
                if (dose == 1)
                    printData_dose1();
                else if (dose == 2)
                    printData_dose2();
            }
            document.getElementById("loader").classList.add("d-none"); //hide spinner after data print
        }

    };
}


// print data dose 1

function printData_dose1() {

    document.getElementById("result").innerHTML = "Available Slots";
    let flag = true;
    for (let i = 0; i < jsobj.sessions.length; i++) {
        if ((jsobj.sessions[i].min_age_limit==age || (jsobj.sessions[i].allow_all_age === true && age>=jsobj.sessions[i].min_age_limit)) && jsobj.sessions[i].available_capacity_dose1 > 0) {
            flag = false;
            let name = `${jsobj.sessions[i].name}`;
            let address = `${jsobj.sessions[i].address} ,${jsobj.sessions[i].pincode}`;
            let vaccineType = `${jsobj.sessions[i].vaccine}`;
            let fee = `${jsobj.sessions[i].fee_type}`;
            let slot = jsobj.sessions[i].available_capacity_dose1;
            let dose = "Dose 1";
            let card = create_card(name, address, vaccineType, fee, slot, dose);

            tbody.appendChild(card);
        }
    }
    if (flag) {
        document.getElementById("result").innerHTML = "NO Slot Available"
    }
    else {
        music.play();
    }
}



// print data dose 2

function printData_dose2() {

    document.getElementById("result").innerHTML = "Available Slots";
    let flag = true;
    for (let i = 0; i < jsobj.sessions.length; i++) {
        if ((jsobj.sessions[i].min_age_limit==age || (jsobj.sessions[i].allow_all_age === true && age>= jsobj.sessions[i].min_age_limit)) && jsobj.sessions[i].available_capacity_dose2 > 0) {
            flag = false;
            let name = `${jsobj.sessions[i].name}`;
            let address = `${jsobj.sessions[i].address} ,${jsobj.sessions[i].pincode}`;
            let vaccineType = `${jsobj.sessions[i].vaccine}`;
            let fee = `${jsobj.sessions[i].fee_type}`;
            let slot = jsobj.sessions[i].available_capacity_dose2;
            let dose = "Dose 2";
            let card = create_card(name, address, vaccineType, fee, slot, dose);
            tbody.appendChild(card);
        }
    }
    if (flag) {
        document.getElementById("result").innerHTML = "NO Slot Available"
    }
    else {
        music.play();
    }
}

// create td 

function create_card(name, address, vaccineType, fee, slot, dose) {
    let card, h6, p, span;
    card = document.createElement("div");
    card.classList.add("col-md-5", "border", "border-secondary", "rounded", "m-sm-2", "mb-3", "shadow");
    h6 = document.createElement("h6");
    h6.classList.add("mt-1", "text-uppercase", "d-inline-block", "bg-info", "text-white", "rounded", "p-1");
    h6.append(document.createTextNode(name));
    card.appendChild(h6);

    p = document.createElement("p");
    p.appendChild(document.createTextNode(address));
    card.appendChild(p);

    p = document.createElement("p");
    p.appendChild(document.createTextNode(vaccineType + " "));
    span = document.createElement("span");
    span.classList.add("bg-success", "p-1", "rounded", "text-white");
    span.appendChild(document.createTextNode(fee));
    p.appendChild(span);
    card.appendChild(p);

    p = document.createElement("p");
    p.appendChild(document.createTextNode(dose + " "));
    span = document.createElement("span");
    span.classList.add("bg-primary", "p-1", "rounded", "text-white");
    span.appendChild(document.createTextNode(slot + " slots"));
    p.appendChild(span);
    card.appendChild(p)

    return (card);
}

// stop
function stop_all() {
    clearInterval(stop);
    document.getElementById("search").classList.remove("d-none");
    document.getElementById("stop").classList.add("d-none");
    times = 0;
    check = true;
}
