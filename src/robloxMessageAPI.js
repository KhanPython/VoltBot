const axios = require('axios').default


// Returns a status string
exports.MessageSend = async function MessageSend(message, universeId, topic) {
    const resp = await axios.post(
        `https://apis.roblox.com/messaging-service/v1/universes/${universeId}/topics/${topic}`,
        {
            'message': message
        },
        {
            headers: {
                'x-api-key': process.env.robloxAPIKey,
                'Content-Type': 'application/json'
            }
        }
    )
    .then(response => {
        if (response.status == 200) return {status: '**Success**' , success: true}
        if (response.status != 200) return {status: '**Error:** An unknown issue has occurred.'}
    })
    .catch(err =>{
        console.log(err.response.status)
        if (err.response.status == 401) return {status: '**Error:** API key not valid for operation, user does not have authorization'}
        if (err.response.status == 403) return {status: '**Error:** Publish is not allowed on universe.'}
        if (err.response.status == 500) return {status: '**Error:** Server internal error / Unknown error.'}
        if (err.response.status == 400){
            if (err.response.data == "requestMessage cannot be longer than 1024 characters. (Parameter 'requestMessage')") return {status: '**Error:** The request message cannot be longer then 1024 characters long.'}
        }
    })

    return resp
}