local DecodeDate = require(script.Parent.DecodeDate)

local module = {}

--[[

     This example uses Rongo as a MongoDB API wrapper of choice 
     For more info visit: https://devforum.roblox.com/t/rongo-mongodb-api-wrapper-for-roblox/1755615)

]]
local Rongo = require(script.Parent.Rongo)
local Client = Rongo.new("API-NAME", "API-KEY") -- Replace these with the ID and key you stored earlier!
local Cluster = Client:GetCluster("Cluster0") -- Replace this with the name of your cluster (usually "Cluster0")
local Database = Cluster:GetDatabase("test") -- Replace this with the name of your database!

module.collections = {
	BansCollection = Database:GetCollection("bans"),
	ServerbansCollection = Database:GetCollection("serverbans"),
}
--

--[[ 

    If 'expires' entry is expired in passed query then delete the document from collection, else execute a callback

]]
function module.updateDocumentOnExpiration(collection, query, expiredFunction)
	assert(collection ~= nil, "Missing collection!")
	assert(query ~= nil and typeof(query) == "table", "Missing query or of incorrect type!")

	local doc = collection:FindOne(query)
	if not doc then
		-- Not listed in a collection, do nothing
		return
	end

	local decodedDate = DecodeDate(doc["expires"])
	if decodedDate.sinceEpoch - os.time() <= 0 then
		-- Expired, request to remove
		collection:DeleteOne(query)
	else
		-- Still punished
		if not expiredFunction or not typeof(expiredFunction) == "function" then
			return
		end

		expiredFunction(doc)
	end
end

return module
