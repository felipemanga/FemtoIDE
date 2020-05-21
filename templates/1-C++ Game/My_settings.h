// This file is organized into the following sections:
// COMMON       - Stuff you are very likely to customize
// SOUND        - All the sound-related options
// TASMODE      - Settings specific to TASMode
// MISC         - Other stuff

// If you change anything, DO A CLEAN BUILD!

// ---- SECTION: COMMON ----


// Choose a Screen Mode
// For more information on each mode, see:
// https://talk.pokitto.com/t/wiki-5-pokitto-screen-modes/1180
// Optional. Default is MODE_FAST_16COLOR.
#define PROJ_SCREENMODE MODE_FAST_16COLOR
//#define PROJ_SCREENMODE MODE_HI_4COLOR
//#define PROJ_SCREENMODE MODE13
//#define PROJ_SCREENMODE MODE15
//#define PROJ_SCREENMODE MODE64
//#define PROJ_SCREENMODE MIXMODE
//#define PROJ_SCREENMODE TASMODE // See also SECTION: TASMODE
//#define PROJ_SCREENMODE TASMODELOW


// Show the actual framerate
// Optional. Uncomment this define to show.
// #define PROJ_SHOW_FPS_COUNTER


// Limit the framerate so the game doesn't run too fast
// Optional. Default is 30.
#define PROJ_FPS 60


// Choose how to use Pokitto's "extra" 4kb of RAM.
// Optional. Can be:
//   HIGH_RAM_OFF   - Needed for USB to work
//   HIGH_RAM_ON    - Simply enable the RAM hardware
//   HIGH_RAM_MUSIC - Enable and move the sound buffers to high RAM
// Default is HIGH_RAM_OFF.
#define PROJ_HIGH_RAM HIGH_RAM_OFF


// Define if the screen should be cleared automatically
// every frame or if the previous frame should persist.
// Does not apply to TASMODE.
// Optional. Can be true or false. Default is true.
#define PROJ_PERSISTENCE true


// ---- SECTION: SOUND ----


// Choose whether to enable sound or not.
// Optional. Can be 0 or 1. Default is 1.
#define PROJ_ENABLE_SOUND 1


// Enable Pokitto::Sound::playSFX
// Optional. Comment to disable.
#define PROJ_ENABLE_SFX


// Enable streaming music from SD
// Optional. Comment to disable.
#define PROJ_ENABLE_SD_MUSIC


// Defines the rate your audio has been encoded with.
// A higher rate sounds better but takes up more CPU
// and Flash space.
// Optional. Default is 22050.
#define PROJ_AUD_FREQ 8000


// Automatically restart streaming music when it ends.
// Optional. Default is 1.
#define PROJ_STREAM_LOOP 1


// Tell the sound system which SD library to use.
// If you use one of these libraries, it's important that sound
// is streamed using the same one.
// Optional. Default is PokittoDisk (PFFS).
// #define PROJ_SDFS_STREAMING
// #define PROJ_FILE_STREAMING


// Enable Synth
// Optional. Can be 0 or 1. Default is 0.
#define PROJ_ENABLE_SYNTH 0


// ---- SECTION: TASMODE ----
// These settings only apply to TASMODE


// Choose the maximum amount of sprites that can be drawn per frame.
// Higher values consume more RAM.
// Optional. Default is 100.
#define PROJ_MAX_SPRITES 100


// Choose the height in pixels of each tile
// Higher values consume more RAM.
// Optional. Default is 16.
#define PROJ_TILE_H 16


// Choose the width in pixels of each tile
// Higher values consume more RAM.
// Optional. Default is 16.
#define PROJ_TILE_W 16


// ---- SECTION: MISC ----

// Skips the initial Pokitto/Loader/Volume screens.
// Don't release binaries with this enabled!
// Optional. Can be 0 or 1, default is 0.
#define PROJ_DEVELOPER_MODE 0


// Tells the Tilemap library if tiles are stored in
// 1-tile-per-byte (256 tiles maximum) or
// 2-tiles-per-byte (16 tiles maximum) format.
// Optional. Can be 16 or 256. Default is 16.
#define MAX_TILE_COUNT 16
