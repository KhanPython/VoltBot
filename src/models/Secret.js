const mongoose = require('mongoose')
const Schema = mongoose.Schema

const secretsSchema = new Schema(
  {
    msapikey: {
      type: String,
      required: true
    },
    mongodbapikey: {
      type: String,
      required: true
    },
    universeid: {
      type: String,
      required: true
    },
  },
  {
    guildid: {
      type: String,
      required: true
    }
  },
  { 
    timestamps: true 
  }
)

const name = 'Secret'


module.exports = mongoose.models[name] || mongoose.model(name, secretsSchema)
