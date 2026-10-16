fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'twistus_fov'
author 'Twistus'
description 'Configurable third-person aiming FOV for GTA V and addon weapons'
version '1.3.0'

server_scripts {
    'server.js',
    'server.lua'
}

files {
    'data/weapons.meta',
    'data/weaponmachinepistol.meta',
    'data/weapons_pistol_mk2.meta',
    'data/weapons_carbinerifle_mk2.meta',
    'data/weapons_snspistol_mk2.meta',
    'data/weapon_ceramicpistol.meta',
    'data/weaponheavypistol.meta',
    'data/weaponcompactrifle.meta',
    'data/weaponvintagepistol.meta',
    'custom_weapons/generated/**/*.meta'
}

data_file 'WEAPONINFO_FILE_PATCH' 'data/weapons.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weaponmachinepistol.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weapons_pistol_mk2.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weapons_carbinerifle_mk2.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weapons_snspistol_mk2.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weapon_ceramicpistol.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weaponheavypistol.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weaponcompactrifle.meta'
data_file 'WEAPONINFO_FILE_PATCH' 'data/weaponvintagepistol.meta'
data_file 'WEAPONINFO_FILE' 'custom_weapons/generated/**/*.meta'
