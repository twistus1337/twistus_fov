# Twistus FOV

Custom third-person aiming FOV for FiveM, configured separately for each weapon in `config.lua`.
No ESX or QBCore required. No addon weapons are included in this resource.

**What it changes:** the `CameraFov` value in the weapon metadata. This affects aiming in
third person (RMB by default), **not** the regular walking camera or first-person FOV.

## 1. Install Twistus FOV

1. Remove or disable any older version of this FOV resource. Do not run both versions together.
2. Extract the archive into your server's `resources` directory. The resource folder must be
   called `twistus_fov`, with `fxmanifest.lua` directly inside it.
3. Add this to `server.cfg`:

   ```cfg
   ensure twistus_fov
   ```

4. Start or restart the server and reconnect to test the aiming FOV.

## 2. Set FOV for standard GTA V weapons

1. Open `twistus_fov/config.lua`.
2. Edit the number beside the weapon ID in `Config.Weapons`, for example:

   ```lua
   ['WEAPON_PISTOL'] = 65.0,
   ['WEAPON_CARBINERIFLE'] = 70.0,
   ```

3. Save the file. Accepted values: **20.0 to 100.0** (degrees).
4. Run these commands **in the server console**, not in the game's chat/F8 console:

   ```text
   twistus_fov_apply
   restart twistus_fov
   ```

5. Reconnect if the FOV does not update. A full server restart is the safest way to
   reload changed weapon metadata.

## 3. Add a custom addon weapon

**The important rule:** the weapon's `weapons.meta` must be **registered by exactly one
resource**. You can let `twistus_fov` load it and remove its registration from the
original weapon resource. You do **not** need to keep the original physical file after
this, provided you have backed it up and cleaned up any manifest references.

For example, a custom weapon might have the ID `WEAPON_MYWEAPON`. Replace this example
ID and all example folder names with your own.

1. **Test and back up the weapon.** Make sure it can be equipped normally with your
   current weapon resource and your inventory system. Save a backup of the original weapon
   resource, especially `weapons.meta` and `fxmanifest.lua`.
2. **Copy `weapons.meta` to Twistus FOV** (do not remove the original yet):

   ```text
   resources/
   ├── my_weapon_resource/
   │   ├── fxmanifest.lua
   │   ├── stream/                    (models and textures)
   │   └── metas/weapons.meta         (original, for now)
   └── twistus_fov/
       ├── config.lua
       └── custom_weapons/
           └── sources/
               └── my_weapon/
                   └── weapons.meta   (copy)
   ```

   The source filename can differ, but it must end with `.meta`. The models (`.ydr`,
   `.ytd`), animations and other required weapon metadata remain in the original
   weapon resource.
3. **Find the weapon ID** in the `<Name>` field inside that `weapons.meta`.
4. **Add its FOV** to `Config.Weapons` in `twistus_fov/config.lua`:

   ```lua
   ['WEAPON_MYWEAPON'] = 70.0,
   ```

5. **Generate the metadata.** While the server is running, execute in the
   **server console**:

   ```text
   twistus_fov_apply
   ```

   Check that this file now exists:

   ```text
   twistus_fov/custom_weapons/generated/my_weapon/weapons.meta
   ```

   If it is missing, check the server console for errors, the exact weapon ID, and
   the source file location. **Do not disable the original metadata registration
   until the generated file exists.**
6. **Stop registering that `weapons.meta` in the ORIGINAL weapon resource.**
   Open its `fxmanifest.lua` and remove the `data_file` line for **that exact file**.
   For example, remove:

   ```lua
   data_file 'WEAPONINFO_FILE' 'metas/weapons.meta'
   ```

   Some addons use `WEAPONINFO_FILE_PATCH` instead; remove only the matching line.
   Leave registrations for other files (components, animations, archetypes, etc.)
   unchanged.
7. **Decide what to do with the original file.** You may:
   - **Leave** `metas/weapons.meta` inside the original resource as an unused copy; or
   - **Remove** it from the original resource **after backing it up**. If you remove
     it, also remove its entry from the original manifest's `files` list (if present),
     so the manifest does not reference a missing file.

   The important part is that `twistus_fov` now registers the generated version,
   and the original addon no longer registers the same weapon info.
8. **Keep the original resource and correct start order** in `server.cfg`:

   ```cfg
   ensure my_weapon_resource
   ensure twistus_fov
   ```

   Replace `my_weapon_resource` with the actual folder name. Do not delete the
   original weapon resource: it is still needed for streamed models and other files.
9. **Fully restart the server** after adding the custom weapon or changing which
   resource loads its metadata. Reconnect and test equipping it through your inventory.

**Adding more guns:** create a separate folder under `custom_weapons/sources/` for each
addon and repeat the steps. You do not need to change `twistus_fov/fxmanifest.lua` for
each new source file. A weapon addon may contain several weapon-info `.meta` files;
copy and transfer registration only for the files you actually want Twistus FOV to load.

## 4. If you cannot equip a custom weapon

- Confirm that `custom_weapons/generated/<your_folder>/<your_file>.meta` exists and
  contains the correct `<Name>` and `CameraFov`.
- Check that `WEAPON_MYWEAPON` (your real ID, not this example) matches the weapon
  configured in your inventory system.
- Check both manifests: the generated weapon-info metadata must be registered **once**,
  not zero times or twice. The original addon must still register its other required
  metadata and stream its model files.
- If you removed the original `.meta`, ensure the original manifest does not still
  reference that missing file under `files`.
- Check server logs and client F8 for errors. A full server restart is recommended
  after adding new weapon metadata.
- To roll back: restore the original weapon resource and its manifest from backup,
  remove the copied source under `twistus_fov/custom_weapons/sources/`, remove the
  weapon's `Config.Weapons` entry, run `twistus_fov_apply`, then restart the server.

## 5. Files and commands

| File or folder | Purpose |
| --- | --- |
| `config.lua` | Per-weapon FOV values |
| `templates/` | Input metadata for standard GTA V weapons |
| `data/` | Generated metadata for standard GTA V weapons |
| `custom_weapons/sources/` | Copies of custom weapon metadata you supply |
| `custom_weapons/generated/` | Generated custom metadata; **do not edit manually** |
| `server.lua`, `server.js` | Generator, called on resource start and by `twistus_fov_apply` |
| `fxmanifest.lua` | Resource scripts and registered metadata |
| `README_PL.md` | Polish installation guide |

The standard-weapon templates come from a previously modified weapon pack and may
contain **changes besides FOV**. The generator changes only `CameraFov`; it does not
undo existing edits. Compatibility with every addon and other weapon packs is not
guaranteed. The generator has been checked locally, but actual behaviour must be
verified on your own FiveM server.
