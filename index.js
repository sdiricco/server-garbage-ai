const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const fsProm = require('fs/promises')
const upload = multer({ dest: 'uploads/' });
const aiparse = require('./services/AIParseImage')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GarbageSchema = require('./models/GarbageSchema');
const imgFileToBase64 = require('./services/ImgFileToBase64')
const initializeDatesArray = require('./services/date/initializeDatesArray')
const garbageDataMongoDBToGarbageData = require('./services/date/garbageDataMongoDBToGarbageData')
const garbageData = require('./dummy-data/garbage');


dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));




// datesArray = garbageDataMongoDBToGarbageData(garbageData);

// fs.writeFile('datesOut.json', JSON.stringify(datesArray), (err) => {
//     if (err) {
//         console.error('Errore durante la scrittura del file', err);
//     } else {
//         console.log('File scritto correttamente');
//     }
// });


app.post('/api/raccolta', upload.array('images'), async (req, res) => {
    const files = req.files;


    try {

        //convert images to base 64
        console.info('[Convert images to base 64]')
        const base64Images = await Promise.all(files.map(async (file) => {
            const base64Image = imgFileToBase64(file.path);
            fs.unlinkSync(file.path); // Clean up temporary file
            return base64Image;
        }));

        res.json({ data: 'ok' });


        console.info('[Parse garabge list from images]')
        const r = await aiparse.imagesToListAI(base64Images)
        const garbageList = r.data;

        const garbageCalendarList = [];
        let garbageDetailsList = [];
        let garbageInfo = {};


        for(const garbage of garbageList){
            console.info('[Get Calendar for garbage]:', garbage)
            const r = await aiparse.getGarbageCalendarAI(garbage)
            const garbageCalendar = {
                type: garbage,
                calendar: r.data
            }
            console.info('[Add followig garbage calendar to main calendar]:', JSON.stringify(garbageCalendar, null, 2))
            garbageCalendarList.push(garbageCalendar)
        }

        console.info('[Get Garbage details]:')
        const r2 = await aiparse.getGarbageDetails()
        garbageDetailsList = r2.data
        console.info('[Add garbage Details]:', JSON.stringify(garbageDetailsList, null, 2))

        console.info('[Get Garbage Info]:')
        const r3 = await aiparse.getGarbageInfo()
        garbageInfo = r3.data
        console.info('[Add garbage Info]:', JSON.stringify(garbageInfo, null, 2))


        // const result_2 = await aiparse.getGarbageCalendarAI('multimateriale', result_1.conversationId)

        // Salva il risultato in MongoDB
        // const garbageSchema = new GarbageSchema({
        //     data: result,
        //     cap: result.info.cap
        // });

        // await garbageSchema.save();


        console.info('[Write data to local file]')
        const data = {
            garbageList,
            garbageCalendarList,
            garbageDetailsList,
            garbageInfo
        }

        await fsProm.writeFile('out.json', JSON.stringify(data))
        console.info('[File write succesfully]')


    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing images');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
