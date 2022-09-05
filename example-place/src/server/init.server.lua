-- Services
local MessagingService = game:GetService("MessagingService")
local HTTPService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- libs
local CollectionHandler = require(script.CollectionHandler)
local DecodeDate = require(script.DecodeDate)

function kickPlayer(userId: string, reason: string)
	assert(userId ~= nil and typeof(userId) == "string", "userId field is missing or of incorrect type")
	assert(reason ~= nil and typeof(reason) == "string", "reason field is missing or of incorrect type")

	for _, player in pairs(Players:GetPlayers()) do
		if player.UserId == tonumber(userId) then
			player:Kick(reason)
			return
		end
	end
end

MessagingService:SubscribeAsync("DiscordBan", function(msg)
	local decodedData = HTTPService:JSONDecode(msg.Data)
	local passedUserId = decodedData.UserId
	local passedReason = decodedData.Reason

	assert(passedReason ~= nil and passedUserId ~= nil, "Required data is missing, unable to execute the command")
	kickPlayer(passedUserId, passedReason)
end)

MessagingService:SubscribeAsync("ServerBan", function(msg)
	local decodedData = HTTPService:JSONDecode(msg.Data)
	local passedUserId = decodedData.UserId
	local passedReason = decodedData.Reason
	local passedJobId = decodedData.JobId

	assert(
		passedReason ~= nil and passedUserId ~= nil and passedJobId ~= nil,
		"Required data is missing, unable to execute the command"
	)
	if passedJobId == game.JobId then
		kickPlayer(passedUserId, passedReason)
	end
end)

MessagingService:SubscribeAsync("DiscordKick", function(msg)
	local decodedData = HTTPService:JSONDecode(msg.Data)
	local passedUserId = decodedData.UserId
	local passedReason = decodedData.Reason

	assert(passedReason ~= nil and passedUserId ~= nil, "Required data is missing, unable to execute the command")
	kickPlayer(passedUserId, passedReason)
end)

Players.PlayerAdded:Connect(function(player)
	--[[
		Search for whether the user is banned, if so, then kick them with a specified reason and duration of the ban
	]]
	local bansQuery = {
		["userId"] = player.UserId,
	}
	CollectionHandler.updateDocumentOnExpiration(
		CollectionHandler.collections.BansCollection,
		bansQuery,
		function(document)
			kickPlayer(
				player,
				" Ban: "
					.. document["reason"]
					.. ". Time remaining: "
					.. (DecodeDate(document["expires"]).sinceEpoch - os.time())
			)
		end
	)

	--[[
		 Search for whether the user is banned in the given server (by JobId), if so, then kick them with a specified reason and duration of the server ban
	]]
	local serverBansQuery = {
		["userId"] = player.UserId,
		["jobId"] = game.JobId,
	}
	CollectionHandler.updateDocumentOnExpiration(
		CollectionHandler.collections.ServerbansCollection,
		serverBansQuery,
		function(document)
			assert(document ~= nil, "Error, document not found")
			kickPlayer(
				player,
				" Server ban: "
					.. document["reason"]
					.. ". Time remaining: "
					.. (DecodeDate(document["expires"]).sinceEpoch - os.time())
			)
		end
	)
end)
