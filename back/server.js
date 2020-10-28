const express = require("express");
const app = express();
const port = 5000;
const fs = require('fs');
const util = require("util");
const isEmpty = require('lodash.isempty');
const bodyParser = require('body-parser');
yaml = require('js-yaml');

//flash
const session = require('express-session');
const flash = require('connect-flash');

const readFileAsync = util.promisify(fs.readFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var t;


app.use(session({
    secret: 'happy dog',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());

const path = require("path");
const BASE_DATA_PATH = "D:\\ps\\React forms\\new_up\\punjab-mdms-data\\data\\pb";
const SCHEMA_PATH = "D:\\ps\\React forms\\new_up\\punjab-mdms-data\\schema";
/* const SCHEMA_DATA_PATH = ""
let masterMetadata = {}

masterMetadata["masters"] = loadAllMastersMetadata(BASE_DATA_PATH)

masterMetadata["moduleName"]["masterName"]["tenant"]

masterMetadata = {
    "masters": [],
    "mapping": {
        "tenants": {
            "tenant": {
                "pb": 10
            }
        }
    }
}

x = [{code: "A"}, {code: "B"}, {code:"C"}]
map = {}
for (y in x) {
    map[x[y]["code"]] = x[y]
}

map["A"]

function loadAllMastersMetadata(folderPath) {
    for each folder in folderPath
     for each json file in current folder
      load the master details
       data = jsonDataFromFile
         Object.keys(data)
         {
           tenantId=
           moduleName=
           masterName=
           filePath=relative (tenants/tenant.json)
         }
}

function loadAllSchemaMetadata(folderPath) {
 similar to above function
} */

// Create a list view for all masters which have schema available  
let metaDataArr = []
let masterMetadata = {}


async function loadAllMastersMetadata(folderPath) {
    fs.readdir(folderPath, function (err, folders) {
        {
            folders.forEach(function (folder) {
                fs.readdir(path.join(folderPath, folder), function (err, subFolders) {
                    {
                        subFolders.forEach(function (subFolder) {
                            fs.readdir(path.join(folderPath, folder, subFolder), function (err, files) {
                                if(files){
                                files.forEach(function(file){
                                    if (file) {
                                        //console.log(file);
                                        fs.readFile(path.join(folderPath, folder, subFolder, file), 'utf8', function (err, fileData) {
                                            var da = JSON.parse(fileData);

                                            let arr = {
                                                moduleName: da["moduleName"],
                                                tenantId: da["tenantId"],
                                                master: file.split('.').slice(0, -1).join('.')
                                            }
                                            metaDataArr.push(arr);

                                        });

                                    }

                                })
                                }

                            });
                        })


                    }

                })

            })

        }
    })
    return metaDataArr;
}


async function getSchemaForMaster(moduleName, masterName) {


    var schemaFileName = moduleName + '.' + masterName + '.yaml';

    let schema = yaml.load(await readFileAsync(path.join(SCHEMA_PATH, schemaFileName), 'utf8'));
    //console.log(schema);
    return schema;

}



/* function getMasterFilePath(tenant, module, master) {
    // TODO: will come from the starting metaData
 // return from metaData
    return path.join(BASE_DATA_PATH, module, master + '.json');
} */

async function getMasterMetaData() {
    masterMetadata["masters"] = await loadAllMastersMetadata(BASE_DATA_PATH);

    // let data = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');
    // console.log(JSON.parse(data)["tenants"]);
    return masterMetadata["masters"];

}
function getMasterFilePath(tenant, module, master) {
    // TODO: will come from the starting metaData
 // return from metaData
 //console.log(path.join(BASE_DATA_PATH, tenant,module, master + '.json'))
    return path.join(BASE_DATA_PATH, tenant,module, master + '.json');
}

async function getMasterData(tenant, module, master) {

    let data = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');
    // console.log(JSON.parse(data)["tenants"]);
   // console.log(getMasterFilePath(tenant, module, master));
   //console.log((data))
    return JSON.parse(data)[master];

}

async function updateMasterData(tenant, module, master, updatedTenant) {

    let data = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');

    let currentData = JSON.parse(data);
    console.log(currentData[master][0]);

    var index = -1;

    for (var i in currentData[master]) {
        if (currentData[master][i].fromFY == updatedTenant.fromFY) {
            index = i;
            break;
        }
    }


    if (index == -1) {
        currentData[master].push(updatedTenant[master]);
    } else {
        currentData[master][index] = updatedTenant[master]
    }

    let newContent = JSON.stringify(currentData);

    fs.writeFile(getMasterFilePath(tenant, module, master), newContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    const lol = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');
    return JSON.parse(JSON.stringify(lol))[master];

}

async function deleteRecord(tenant, module, master, records) {

    let data = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');

    let currentData = JSON.parse(data);
    console.log(currentData);

    var index = -1;
    for (var i in records) {
        for (var j in currentData[master]) {
            if (currentData[master][j].fromFY == records[i].fromFY) {
                index = i;
                currentData[master].splice(j, 1);
                break;
            }
        }

    }



    let newContent = JSON.stringify(currentData);

    fs.writeFile(getMasterFilePath(tenant, module, master), newContent, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    const lol = await readFileAsync(getMasterFilePath(tenant, module, master), 'utf8');
    return JSON.parse(JSON.stringify(lol))[master];
}


/* app.get("/", (req, res) => {
    res.send("Hello guysss");
    console.log("Good job.Keep moving!");
}); */

app.get("/masters", async (req, res) => {



    let data = await getMasterMetaData();
    //console.log(data);
    res.send(data);
});

app.get("/schema/:moduleName/:masterName", async (req, res) => {

    let p = req.params;

    let data = await getSchemaForMaster(p.moduleName, p.masterName);
    //console.log(data);
    res.send(data);
});
app.get("/masters/:tenant/:module/:master", async (req, res) => {

    let p = req.params;
    
    let data = await getMasterData(p.tenant, p.module, p.master);
    //console.log(data);
    res.send(data);
});
app.post("/masters/:tenant/:module/:master/add", async (req, res) => {

    let p = req.params;
    var newTenant = req.body.body;
    if (isEmpty(newTenant)) {
        console.log('Empty Object');
    }

    console.log(newTenant);
    let a = await updateMasterData(p.tenant, p.module, p.master, newTenant);
    console.log(a);

    //res.send(req.flash('success', 'Form submitted successfully'));

    res.send(a);
})

app.post("/masters/:tenant/:module/:master/update", async (req, res) => {
    let p = req.params;
    var newTenant = req.body.body;

    if (isEmpty(newTenant)) {
        console.log('Empty Object');
    }
    console.log(newTenant);

    let u = await updateMasterData(p.tenant, p.module, p.master, newTenant);
    //console.log(u);
    res.send(u);

})

app.post("/masters/:tenant/:module/:master/delete", async (req, res) => {
    let p = req.params;
    var delTenants = req.body.body;

    if (isEmpty(delTenants)) {
        console.log('Empty Object');
    }
    console.log(delTenants);

    let d = await deleteRecord(p.tenant, p.module, p.master, delTenants);
    console.log(d);
    res.send(d);

})



app.listen(port, () => console.log("App running on port 5000"));