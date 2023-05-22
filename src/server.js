const fs = require('fs');
const express = require("express");
const crypto = require("crypto");

const app = express();

/*mein Code*/
app.get('/records', (req, res) => {
    headers(req, res);
    res.status(200);
    res.contentType('application/json');
    res.json(getAllRecords());
});

app.get('/records/{record-id}', (req, res) => {
    const recordId = req.params['record-id'];
    console.log(`Get record for ID '${recordId}'`)

    const record = getRecordById(recordId);
    headers(req, res);
    if (record) {
        res.status(200);
        res.json(record);
    } else if (record === null) {
        res.status(404);
        res.send();
    } else {
        console.error(err);
        res.status(500);
        res.send();
    }

});

/*mein Code Ende*/

app.use(express.json());

/*mein Code*/
app.post('/records', (req, res) => {
    console.log(`Create record`)
    const record = req.body;
    console.log(record);
    headers(req, res);
    if (validateRecord(record)) {
        record.id = generateId();
        createRecord(record);
        record.url = getRecordUrl(req, record.id);
        res.status(201);
        res.send();
    } else if (record === null) {
        res.status(400);
        res.send();
    } else {
        console.error(err);
        res.status(500);
        res.send();
    }
});

app.delete('/records', (req, res) => {
    console.log(`Delete all records`);
    headers(req, res);
    deleteAllRecords();
    if {
    res.status(204);
    res.send();
    } else {
        console.error(err);
        res.status(500);
        res.send();
    }
});

app.delete('/records/:record-id', (req, res) => {
    const recordId = req.params['record-id'];
    console.log(`Delete record for ID '${recordId}'`);

    const deleted = deleteRecordById(recordId);
    headers(req, res);
    if (deleted) {
        res.status(204);
        res.send();
    } else if (deleted === null) {
        res.status(404);
        res.send();
    } else {
        console.error(err);
        res.status(500);
        res.send();
    }
});

/*mein Code Ende*/

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('yaml').parse(fs.readFileSync('./spec/powertrack.yaml', 'utf8'));
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/*mein Code */
app.options('/*', (req, res) => {
    headers(req, res, err);
    res.status(200);
    res.send();
});

app.listen(8080, () => {
    console.log("Server up and running");
});

function headers(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Api-Key,Content-Type,Accept');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
}
/*mein Code Ende*/

function generateId() {
    return crypto.randomUUID();
}
function getRecordUrl(req, recordId) {
    return `${req.protocol}://${req.header('host')}/records/${recordId}`;
}

function validateRecord(record) {
    const dateRegex = new RegExp("^\\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$");
    return record &&
        record.date && typeof record.date === "string" && dateRegex.test(record.date) &&
        record.reading && typeof record.reading === "number";
}

/*mein Code*/

function saveDataToFile(data) {
    fs.writeFileSync('data.json', JSON.stringify(data));
}

function saveAllRecords(records) {
    saveDataToFile(records);
}

function createRecord(record) {
    const records = getAllRecords();
    records.items.push(record);
    saveAllRecords(records);
}

function getRecordById(id) {
    const records = getAllRecords();
    for (let record of records.items) {
        if (record.id === id) {
            return record;
        }
    }
}

function deleteAllRecords() {
    const records = {
        items: []
    };
    saveAllRecords(records);
}

function deleteRecordById(id) {
    const records = getAllRecords();
    for (let i = 0; i < records.items.length; i++) {
        if (records.items[i].id === id) {
            records.items.splice(i, 1);
            saveDataToFile(records);
            return true;
        }
    }
    return false;
}

function getAllRecords() {
    const fileContent = loadDataFromFile();

    if (fileContent) {
        return JSON.parse(fileContent.toString());
    } else {
        return {
            items: []
        };
    }
}

function loadDataFromFile() {
    if (fs.existsSync('data.json')) {
        console.debug('File exists');
        return fs.readFileSync('data.json', 'utf8');
    } else {
        return null;
    }
}

/*mein Code Ende*/