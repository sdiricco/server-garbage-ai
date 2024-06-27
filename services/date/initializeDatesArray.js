
const moment = require('moment');
const { extendMoment } = require('moment-range');   

// Estendi moment con moment-range
const momentRange = extendMoment(moment);

// Ottieni l'anno attuale
const currentYear = moment().year();

// Crea un range per tutto l'anno attuale
const startOfYear = moment(`${currentYear}-01-01`);
const endOfYear = moment(`${currentYear}-12-31`);
const yearRange = momentRange.range(startOfYear, endOfYear);


// Array per contenere gli oggetti {date, code}

function initializeDatesArray(){
    let datesArray = [];

    // Itera attraverso ogni giorno dell'anno
    for (let day of yearRange.by('day')) {
        datesArray.push({
            date: day.format('YYYY-MM-DD'),
            code: []
        });
    }

    return datesArray
}

module.exports = initializeDatesArray
