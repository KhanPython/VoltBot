const axios = require('axios').default


exports.UserInfoById = async function UserInfoById(userId) {
    const resp = await axios.get(`https://users.roblox.com/v1/users/${userId}/`)
        .then(response => {
            return {status: '**Success**', success: true, data: response} 
        })
        .catch(err => {
            console.log(err.response.status)
            if (err.response.status == 404) return {status: '**Error:** Invalid user id.'}  
        })

    return resp
}