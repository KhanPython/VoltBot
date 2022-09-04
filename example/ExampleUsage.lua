-- Server-side code
local MessagingService = game:GetService("MessagingService")
local HTTPService = game:GetService("HttpService")
local Players = game:GetService("Players")

local TOPIC_NAME = "Kick"

MessagingService:SubscribeAsync(TOPIC_NAME, function(msg)
	local decodedData = HTTPService:JSONDecode(msg.Data)
	local passedUserId = decodedData.UserId
	local passedReason = decodedData.Reason

	assert(passedReason ~= nil and passedUserId ~= nil, "Missing data, unable to execute the command")

	for _, player in pairs(Players:GetPlayers()) do
		if player.UserId == tonumber(passedUserId) then
			player:Kick("You have been kicked from this server: "..passedReason)
			return
		end
	end
end)
