const axios = require('axios').default


exports.UserInfoById = async function RetrieveUserInformationById(userId) {
    const resp = await axios.get(`https://users.roblox.com/v1/users/${userId}/`)
    .then(response => {
        console.log(response)
        return response
    })
    .catch(err => {
        console.log(err.response.status)
        if (err.response.status == 404) return `**Error:** Invalid user id `
    })

    return resp
}