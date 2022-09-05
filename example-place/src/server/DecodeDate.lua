function decodeDate(str: string)
	assert(str ~= nil and typeof(str) == "string", "Missing argument or of incorrect type!")

	local data = {}
	local y, m, d, h, i, s, t = str:match("(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+).(%d+)Z")
	data.year = y
	data.month = m
	data.day = d
	data.hour = h
	data.min = i
	data.sec = s
	data.milli = t
	data.sinceEpoch = os.time(data)

	return data
end

return decodeDate
