const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_APYKEY
});



const messages = []

async function executeAi(message){
    messages.push(message);
    const stream = await openai.chat.completions.create({
        stream: true,
        messages,
        temperature: 0.2,
        model: "gpt-4o-2024-05-13",
    });

    let result = ''

    for await (const chunk of stream) {
        const data = chunk.choices[0]?.delta?.content || "";
        result = result + data
        // process.stdout.write(data);
    }

    messages.push({
        "role": "assistant",
        "content": [
            {
                "type": "text",
                "text": result
            }
        ]  
    })

    console.log('[Result-Raw]:', result)

    return {
        data: JSON.parse(result),
    }

}

/**************************************************************************************************/
/**************************************************************************************************/
/**************************************************************************************************/
async function imagesToListAI(base64Images = []) {
    const sampleResponse = `
    ['multimateriale', 'carta'...]
    `
    const imageMessages = base64Images.map(base64Image => ({
        "type": "image_url",
        "image_url": {
            "url": `data:image/jpeg;base64,${base64Image}`
        }
    }))

    const message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": `
                    Ricava la lista dei rifiuti da conferire e restituisci un array sotto forma di stringa JSON.
                    Esempio: ${sampleResponse}.
                    Devi solo ricavare la tipologia/categoria tecnica di rifiuto ed ecludere eventuali proprietà:
                    Esempi: 
                        "multimateriale" => OK 
                        "carta" => OK, 
                        "pannolini_oni" => NO ("pannolini" => OK), 
                        "verde_su_richiesta" => NO ("verde" => OK),
                        "carta_e_cartone" => NO ("carta" => OK),
                        "umido_organico" => NO ("organico" => OK)
                    Come regole dell'item dell'array: 
                        - non usare spazi o a capo
                        - non usare maiscole
                        - come carattere speciale usa solo "_".
                    Come regole di formattazione del JSON:
                        - Restituisci un JSON in formato stringa
                        - Non usare alcun tipo di formattazione
                        - Non usare markdown
                        - Deve essere un JSON convertito in stringa
                        `

            },
            ...imageMessages

        ]
    }
    return executeAi(message)
}

/**************************************************************************************************/
/**************************************************************************************************/
/**************************************************************************************************/
async function getGarbageCalendarAI(garbage = '') {
    const sampleResponse = `
{
    "0": [1, 5, 8, 12, 15, 19, 22, 26, 29],
    "1": [ 2, 5, 9, 12, 16, 19, 23, 26],
    ....
}
    `

    const message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": `
                    Per quanto riguarda il rifiuto <${garbage}> fornisci la lista completa dei giorni dell'anno in cui deve essere conferito sotto forma di stringa JSON.
                    Esempio: ${sampleResponse}
                    Come regole di formattazione del JSON:
                        - Restituisci un JSON in formato stringa
                        - Non usare alcun tipo di formattazione
                        - Non usare markdown
                        - Deve essere un JSON convertito in stringa`

            }
        ]  
    }

    return executeAi(message)
}

/**************************************************************************************************/
/**************************************************************************************************/
/**************************************************************************************************/
async function getGarbageDetails() {
    const sampleResponse = `
[
{
    "type": "multimateriale",
    "name": "Multimateriale",
    "description": "Plastica, bottglie ecc...",
    "content": {
        "valid": "Tetrapak, tappi bottiglie",
        "notValid": "Metallo, carta ecc"
    }
},
{
    "type": "carta",
    "name": "Carta",
    "description": "Carta, giornali ecc...",
    "content": {
        "valid": "Carta, giornali, ",
        "notValid": "Metallo, plastica ecc"
    }
},
...
]
    `

    const message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": `
                    Per quanto riguarda ogni type di rifiuto fornisci i dettagli sotto forma di stringa JSON.
                    Esempio: ${sampleResponse}
                    Come regole di formattazione del JSON:
                        - Restituisci un JSON in formato stringa
                        - Non usare alcun tipo di formattazione
                        - Non usare markdown
                        - Deve essere un JSON convertito in stringa`

            }
        ]  
    }
    return executeAi(message)
}


/**************************************************************************************************/
/**************************************************************************************************/
/**************************************************************************************************/
async function getGarbageInfo() {
    const sampleResponse = `
{
        contacts: [
            {
                name: "URP",
                phone: "Numero di telefono",
                email: "urp@ascit.it"
            },
            {
                name: "Ritiro ingrombranti",
                phone: "800 146219",
                email: null
            },
            ...
        ],
        ... //altre info
}
    `

    const message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": `
                    Inserisci delle info utili in oggetto JSON utilizzando chiavi in inglese.
                    Esempio: ${sampleResponse}
                    Restituisci un JSON in formato stringa senza nessun tipo di formattazione poichè deve essere parsato direttamente da JSON.parse()`

            }
        ]  
    }
    return executeAi(message)
}



module.exports = {
    getGarbageCalendarAI,
    imagesToListAI,
    getGarbageDetails,
    getGarbageInfo
}