local resourceName = GetCurrentResourceName()

local function readConfig()
    local source = LoadResourceFile(resourceName, 'config.lua')
    if not source then return nil, 'config.lua was not found' end
    local env = {}
    local chunk, err = load(source, '@' .. resourceName .. '/config.lua', 't', env)
    if not chunk then return nil, err end
    local ok, runErr = pcall(chunk)
    if not ok then return nil, runErr end
    if not env.Config or type(env.Config.Weapons) ~= 'table' then
        return nil, 'Config.Weapons must be a table'
    end
    local settings = {}
    for name, fov in pairs(env.Config.Weapons) do
        if type(name) ~= 'string' or not name:match('^WEAPON_[A-Z0-9_]+$') then
            return nil, 'Invalid weapon name: ' .. tostring(name)
        end
        if type(fov) ~= 'number' or fov ~= fov or fov < 20 or fov > 100 then
            return nil, 'FOV for ' .. name .. ' must be a number between 20 and 100'
        end
        settings[name] = fov
    end
    return settings
end

local function requestBuild()
    local settings, err = readConfig()
    if not settings then
        print('^1[Twistus FOV] ' .. tostring(err) .. '^7')
        return
    end
    TriggerEvent('twistus_fov:generate', json.encode(settings))
end

RegisterCommand('twistus_fov_apply', function(src)
    if src ~= 0 then
        print('[Twistus FOV] This command can only be used from the server console.')
        return
    end
    requestBuild()
end, false)

AddEventHandler('onResourceStart', function(name)
    if name ~= resourceName then return end
    SetTimeout(200, requestBuild)
end)
