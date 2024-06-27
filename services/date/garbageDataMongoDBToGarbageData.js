const moment = require('moment');
const initializeDatesArray = require('./initializeDatesArray')

function garbageDataMongoDBToGarbageData (garbageData){
    let datesArray = initializeDatesArray()
    for (let i = 0; i < garbageData.result.garbageRules.length; i++) {
        const days = garbageData.result.garbageRules[i].days
        for (d of days) {
            const dateEntryIndex = datesArray.findIndex(entry => moment(entry.date, 'YYYY-MM-DD').dayOfYear() === d)
            if(dateEntryIndex >= 0){
                datesArray[dateEntryIndex].code.push(garbageData.result.garbageRules[i].code)
            }
            
        }
        
    }
    return datesArray
}

module.exports = garbageDataMongoDBToGarbageData