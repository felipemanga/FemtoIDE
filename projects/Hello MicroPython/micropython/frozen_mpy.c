#include "py/mpconfig.h"
#include "py/objint.h"
#include "py/objstr.h"
#include "py/emitglue.h"

#if MICROPY_OPT_CACHE_MAP_LOOKUP_IN_BYTECODE != 0
#error "incompatible MICROPY_OPT_CACHE_MAP_LOOKUP_IN_BYTECODE"
#endif

#if MICROPY_LONGINT_IMPL != 0
#error "incompatible MICROPY_LONGINT_IMPL"
#endif

#if MICROPY_PY_BUILTINS_FLOAT
typedef struct _mp_obj_float_t {
    mp_obj_base_t base;
    mp_float_t value;
} mp_obj_float_t;
#endif

#if MICROPY_PY_BUILTINS_COMPLEX
typedef struct _mp_obj_complex_t {
    mp_obj_base_t base;
    mp_float_t real;
    mp_float_t imag;
} mp_obj_complex_t;
#endif

enum {
    MP_QSTR_upg = MP_QSTRnumber_of,
    MP_QSTR_random,
    MP_QSTR_screen_sf,
    MP_QSTR_w2,
    MP_QSTR_h2,
    MP_QSTR_pokittoPixels,
    MP_QSTR_hero_sf,
    MP_QSTR_vx,
    MP_QSTR_vy,
    MP_QSTR_eventtype,
    MP_QSTR_i,
    MP_QSTR_x2,
    MP_QSTR_y2,
    MP_QSTR_main_dot_py,
    MP_QSTR_pygame,
    MP_QSTR_Sprite,
    MP_QSTR_AbstractGroup,
    MP_QSTR_Group,
    MP_QSTR_RenderPlain,
    MP_QSTR_RenderClear,
    MP_QSTR_collide_mask,
    MP_QSTR_spritecollide,
    MP_QSTR_groupcollide,
    MP_QSTR_spritecollideany,
    MP_QSTR_micropython_slash_sprite_dot_py,
    MP_QSTR_add,
    MP_QSTR_add_internal,
    MP_QSTR_remove_internal,
    MP_QSTR_kill,
    MP_QSTR_groups,
    MP_QSTR_alive,
    MP_QSTR___g,
    MP_QSTR_group,
    MP_QSTR_truth,
    MP_QSTR__spritegroup,
    MP_QSTR_sprites,
    MP_QSTR_has_internal,
    MP_QSTR_has,
    MP_QSTR_empty,
    MP_QSTR___nonzero__,
    MP_QSTR_spritedict,
    MP_QSTR_lostsprites,
    MP_QSTR_sprite,
    MP_QSTR_image,
    MP_QSTR_bgd,
    MP_QSTR_mask,
    MP_QSTR_from_surface,
    MP_QSTR_overlap,
    MP_QSTR_left,
    MP_QSTR_right,
    MP_QSTR_dokill,
    MP_QSTR_collided,
    MP_QSTR_groupa,
    MP_QSTR_groupb,
    MP_QSTR_dokilla,
    MP_QSTR_dokillb,
};

extern const qstr_pool_t mp_qstr_const_pool;
const qstr_pool_t mp_qstr_frozen_const_pool = {
    (qstr_pool_t*)&mp_qstr_const_pool, // previous pool
    MP_QSTRnumber_of, // previous pool size
    10, // allocated entries
    56, // used entries
    {
        (const byte*)"\xc7\x03" "upg",
        (const byte*)"\xbe\x06" "random",
        (const byte*)"\x83\x09" "screen_sf",
        (const byte*)"\x20\x02" "w2",
        (const byte*)"\x5f\x02" "h2",
        (const byte*)"\x2c\x0d" "pokittoPixels",
        (const byte*)"\x5f\x07" "hero_sf",
        (const byte*)"\x4b\x02" "vx",
        (const byte*)"\x4a\x02" "vy",
        (const byte*)"\x51\x09" "eventtype",
        (const byte*)"\xcc\x01" "i",
        (const byte*)"\x4f\x02" "x2",
        (const byte*)"\x6e\x02" "y2",
        (const byte*)"\xa9\x07" "main.py",
        (const byte*)"\x82\x06" "pygame",
        (const byte*)"\x8c\x06" "Sprite",
        (const byte*)"\xda\x0d" "AbstractGroup",
        (const byte*)"\xda\x05" "Group",
        (const byte*)"\x55\x0b" "RenderPlain",
        (const byte*)"\x96\x0b" "RenderClear",
        (const byte*)"\x4a\x0c" "collide_mask",
        (const byte*)"\x28\x0d" "spritecollide",
        (const byte*)"\xfe\x0c" "groupcollide",
        (const byte*)"\x9e\x10" "spritecollideany",
        (const byte*)"\x6a\x15" "micropython/sprite.py",
        (const byte*)"\x44\x03" "add",
        (const byte*)"\x1c\x0c" "add_internal",
        (const byte*)"\x1b\x0f" "remove_internal",
        (const byte*)"\x67\x04" "kill",
        (const byte*)"\x89\x06" "groups",
        (const byte*)"\x92\x05" "alive",
        (const byte*)"\x62\x03" "__g",
        (const byte*)"\xba\x05" "group",
        (const byte*)"\x0a\x05" "truth",
        (const byte*)"\x2c\x0c" "_spritegroup",
        (const byte*)"\x5f\x07" "sprites",
        (const byte*)"\x07\x0c" "has_internal",
        (const byte*)"\xff\x03" "has",
        (const byte*)"\xb0\x05" "empty",
        (const byte*)"\xa8\x0b" "__nonzero__",
        (const byte*)"\x16\x0a" "spritedict",
        (const byte*)"\x3b\x0b" "lostsprites",
        (const byte*)"\xac\x06" "sprite",
        (const byte*)"\x42\x05" "image",
        (const byte*)"\xa4\x03" "bgd",
        (const byte*)"\x91\x04" "mask",
        (const byte*)"\xf9\x0c" "from_surface",
        (const byte*)"\x76\x07" "overlap",
        (const byte*)"\xde\x04" "left",
        (const byte*)"\xe5\x05" "right",
        (const byte*)"\x2c\x06" "dokill",
        (const byte*)"\xe5\x08" "collided",
        (const byte*)"\x9b\x06" "groupa",
        (const byte*)"\x98\x06" "groupb",
        (const byte*)"\xcd\x07" "dokilla",
        (const byte*)"\xce\x07" "dokillb",
    },
};

// frozen bytecode for file main.py, scope main_<module>
STATIC const byte bytecode_data_main__lt_module_gt_[516] = {
    0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33,
    MP_QSTR__lt_module_gt_ & 0xff, MP_QSTR__lt_module_gt_ >> 8,
    MP_QSTR_main_dot_py & 0xff, MP_QSTR_main_dot_py >> 8,
    0x81, 0x0c, 0x28, 0x48, 0x2c, 0x6e, 0x79, 0x24, 0x24, 0x85, 0x13, 0x77, 0x24, 0x24, 0x24, 0x24, 0x40, 0x2e, 0x2d, 0x30, 0x30, 0x24, 0x30, 0x24, 0x30, 0x24, 0x30, 0x24, 0x30, 0x30, 0x24, 0x30, 0x24, 0x30, 0x24, 0x30, 0x44, 0x28, 0x2e, 0x2e, 0x5d, 0x2a, 0x2a, 0x52, 0x00, 0x00, 0xff,
    0x80, 
    0x11, 
    0x68, MP_QSTR_upygame & 0xff, MP_QSTR_upygame >> 8, 
    0x24, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x80, 
    0x11, 
    0x68, MP_QSTR_urandom & 0xff, MP_QSTR_urandom >> 8, 
    0x24, MP_QSTR_random & 0xff, MP_QSTR_random >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_display & 0xff, MP_QSTR_display >> 8, 
    0x1e, MP_QSTR_init & 0xff, MP_QSTR_init >> 8, 
    0x66, 0x00, 
    0x32, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_display & 0xff, MP_QSTR_display >> 8, 
    0x1e, MP_QSTR_set_mode & 0xff, MP_QSTR_set_mode >> 8, 
    0x66, 0x00, 
    0x24, MP_QSTR_screen_sf & 0xff, MP_QSTR_screen_sf >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_display & 0xff, MP_QSTR_display >> 8, 
    0x1e, MP_QSTR_set_palette_16bit & 0xff, MP_QSTR_set_palette_16bit >> 8, 
    0x80, 
    0x14, 0xa0, 0x1c, 
    0x14, 0x8f, 0x40, 
    0x14, 0x83, 0xff, 0x7f, 
    0x51, 0x04, 
    0x66, 0x01, 
    0x32, 
    0x90, 
    0x24, MP_QSTR_w2 & 0xff, MP_QSTR_w2 >> 8, 
    0x90, 
    0x24, MP_QSTR_h2 & 0xff, MP_QSTR_h2 >> 8, 
    0x17, 0x00, 
    0x24, MP_QSTR_pokittoPixels & 0xff, MP_QSTR_pokittoPixels >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_surface & 0xff, MP_QSTR_surface >> 8, 
    0x1e, MP_QSTR_Surface & 0xff, MP_QSTR_Surface >> 8, 
    0x1b, MP_QSTR_w2 & 0xff, MP_QSTR_w2 >> 8, 
    0x1b, MP_QSTR_h2 & 0xff, MP_QSTR_h2 >> 8, 
    0x1b, MP_QSTR_pokittoPixels & 0xff, MP_QSTR_pokittoPixels >> 8, 
    0x66, 0x03, 
    0x24, MP_QSTR_hero_sf & 0xff, MP_QSTR_hero_sf >> 8, 
    0x94, 
    0x24, MP_QSTR_x & 0xff, MP_QSTR_x >> 8, 
    0x94, 
    0x24, MP_QSTR_y & 0xff, MP_QSTR_y >> 8, 
    0x80, 
    0x24, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0x80, 
    0x24, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_event & 0xff, MP_QSTR_event >> 8, 
    0x1e, MP_QSTR_poll & 0xff, MP_QSTR_poll >> 8, 
    0x66, 0x00, 
    0x24, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_NOEVENT & 0xff, MP_QSTR_NOEVENT >> 8, 
    0xdc, 
    0x37, 0xc0, 0x80, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_type & 0xff, MP_QSTR_type >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_KEYDOWN & 0xff, MP_QSTR_KEYDOWN >> 8, 
    0xd9, 
    0x37, 0x50, 0x80, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_RIGHT & 0xff, MP_QSTR_K_RIGHT >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x81, 
    0x24, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_LEFT & 0xff, MP_QSTR_K_LEFT >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x7f, 
    0x24, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_UP & 0xff, MP_QSTR_K_UP >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x7f, 
    0x24, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_DOWN & 0xff, MP_QSTR_K_DOWN >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x81, 
    0x24, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_type & 0xff, MP_QSTR_type >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_KEYUP & 0xff, MP_QSTR_KEYUP >> 8, 
    0xd9, 
    0x37, 0x50, 0x80, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_RIGHT & 0xff, MP_QSTR_K_RIGHT >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x80, 
    0x24, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_LEFT & 0xff, MP_QSTR_K_LEFT >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x80, 
    0x24, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_UP & 0xff, MP_QSTR_K_UP >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x80, 
    0x24, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0x1b, MP_QSTR_eventtype & 0xff, MP_QSTR_eventtype >> 8, 
    0x1d, MP_QSTR_key & 0xff, MP_QSTR_key >> 8, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_K_DOWN & 0xff, MP_QSTR_K_DOWN >> 8, 
    0xd9, 
    0x37, 0x04, 0x80, 
    0x80, 
    0x24, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0x81, 
    0x35, 0x34, 0x80, 
    0x30, 
    0x24, MP_QSTR_i & 0xff, MP_QSTR_i >> 8, 
    0x1b, MP_QSTR_random & 0xff, MP_QSTR_random >> 8, 
    0x1e, MP_QSTR_getrandbits & 0xff, MP_QSTR_getrandbits >> 8, 
    0x86, 
    0x66, 0x01, 
    0x94, 
    0xf1, 
    0x24, MP_QSTR_x2 & 0xff, MP_QSTR_x2 >> 8, 
    0x1b, MP_QSTR_random & 0xff, MP_QSTR_random >> 8, 
    0x1e, MP_QSTR_getrandbits & 0xff, MP_QSTR_getrandbits >> 8, 
    0x86, 
    0x66, 0x01, 
    0x85, 
    0xf1, 
    0x24, MP_QSTR_y2 & 0xff, MP_QSTR_y2 >> 8, 
    0x1b, MP_QSTR_screen_sf & 0xff, MP_QSTR_screen_sf >> 8, 
    0x1e, MP_QSTR_blit & 0xff, MP_QSTR_blit >> 8, 
    0x1b, MP_QSTR_hero_sf & 0xff, MP_QSTR_hero_sf >> 8, 
    0x1b, MP_QSTR_x2 & 0xff, MP_QSTR_x2 >> 8, 
    0x1b, MP_QSTR_y2 & 0xff, MP_QSTR_y2 >> 8, 
    0x66, 0x03, 
    0x32, 
    0x81, 
    0xe5, 
    0x30, 
    0x14, 0x81, 0x48, 
    0xd7, 
    0x36, 0xc4, 0x7f, 
    0x32, 
    0x1b, MP_QSTR_x & 0xff, MP_QSTR_x >> 8, 
    0x1b, MP_QSTR_vx & 0xff, MP_QSTR_vx >> 8, 
    0xf1, 
    0x24, MP_QSTR_x & 0xff, MP_QSTR_x >> 8, 
    0x1b, MP_QSTR_y & 0xff, MP_QSTR_y >> 8, 
    0x1b, MP_QSTR_vy & 0xff, MP_QSTR_vy >> 8, 
    0xf1, 
    0x24, MP_QSTR_y & 0xff, MP_QSTR_y >> 8, 
    0x1b, MP_QSTR_screen_sf & 0xff, MP_QSTR_screen_sf >> 8, 
    0x1e, MP_QSTR_blit & 0xff, MP_QSTR_blit >> 8, 
    0x1b, MP_QSTR_hero_sf & 0xff, MP_QSTR_hero_sf >> 8, 
    0x1b, MP_QSTR_x & 0xff, MP_QSTR_x >> 8, 
    0x1b, MP_QSTR_y & 0xff, MP_QSTR_y >> 8, 
    0x66, 0x03, 
    0x32, 
    0x1b, MP_QSTR_upg & 0xff, MP_QSTR_upg >> 8, 
    0x1d, MP_QSTR_display & 0xff, MP_QSTR_display >> 8, 
    0x1e, MP_QSTR_flip & 0xff, MP_QSTR_flip >> 8, 
    0x66, 0x00, 
    0x32, 
    0x35, 0xaf, 0x7e, 
    0x11, 
    0x5b, 
};
STATIC const mp_obj_str_t const_obj_main__lt_module_gt__0 = {{&mp_type_bytes}, 69, 128, (const byte*)"\x00\x03\x33\x33\x33\x33\x33\x00\x00\x32\x22\x22\x22\x22\x32\x00\x00\x32\x33\x33\x33\x33\x22\x00\x00\x32\x31\x11\x11\x11\x22\x00\x00\x32\x31\x13\x11\x31\x22\x00\x02\x32\x31\x11\x11\x11\x22\x23\x03\x32\x31\x13\x33\x11\x22\x30\x00\x32\x31\x11\x11\x11\x22\x00\x00\x32\x22\x22\x22\x22\x22\x00\x00\x32\x23\x22\x22\x23\x32\x00\x00\x32\x33\x32\x23\x33\x32\x00\x00\x32\x23\x22\x23\x32\x22\x00\x00\x32\x22\x23\x32\x22\x22\x00\x00\x32\x22\x22\x22\x22\x32\x00\x00\x33\x33\x33\x33\x33\x33\x00\x00\x32\x00\x00\x00\x00\x32\x00"};
STATIC const mp_rom_obj_t const_table_data_main__lt_module_gt_[1] = {
    MP_ROM_PTR(&const_obj_main__lt_module_gt__0),
};
const mp_raw_code_t raw_code_main__lt_module_gt_ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 0,
    .data.u_byte = {
        .bytecode = bytecode_data_main__lt_module_gt_,
        .const_table = (mp_uint_t*)const_table_data_main__lt_module_gt_,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 516,
        .n_obj = 1,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite___init__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite___init__[39] = {
    0x06, 0x00, 0x01, 0x01, 0x00, 0x00, 0x0b,
    MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x61, 0x20, 0x26, 0x24, 0x00, 0x00, 0xff,
    0x53, 0x00, 
    0xb0, 
    0x26, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0xb1, 
    0x37, 0x09, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0xb1, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite___init__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite___init__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite___init__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite___init__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 39,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_add
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_add[87] = {
    0x0c, 0x00, 0x01, 0x01, 0x00, 0x00, 0x0f,
    MP_QSTR_add & 0xff, MP_QSTR_add >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x09, 0x28, 0x26, 0x2b, 0x27, 0x28, 0x4b, 0x00, 0x00, 0xff,
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x1d, MP_QSTR___contains__ & 0xff, MP_QSTR___contains__ >> 8, 
    0xc2, 
    0xb1, 
    0x47, 
    0x43, 0x32, 0x00, 
    0xc3, 
    0x1c, MP_QSTR_hasattr & 0xff, MP_QSTR_hasattr >> 8, 
    0xb3, 
    0x17, 0x01, 
    0x64, 0x02, 
    0x37, 0x1a, 0x80, 
    0xb2, 
    0xb3, 
    0x64, 0x01, 
    0x36, 0x10, 0x80, 
    0xb3, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0xb0, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x09, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0xb3, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x35, 0xcb, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_obj_str_t const_obj_micropython_sprite__lt_module_gt__Sprite_add_0 = {{&mp_type_str}, 44, 12, (const byte*)"\x5f\x73\x70\x72\x69\x74\x65\x67\x72\x6f\x75\x70"};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_add[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_PTR(&const_obj_micropython_sprite__lt_module_gt__Sprite_add_0),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_add = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_add,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_add,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 87,
        .n_obj = 1,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_remove
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_remove[87] = {
    0x0c, 0x00, 0x01, 0x01, 0x00, 0x00, 0x0f,
    MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x13, 0x28, 0x26, 0x2b, 0x27, 0x28, 0x4b, 0x00, 0x00, 0xff,
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x1d, MP_QSTR___contains__ & 0xff, MP_QSTR___contains__ >> 8, 
    0xc2, 
    0xb1, 
    0x47, 
    0x43, 0x32, 0x00, 
    0xc3, 
    0x1c, MP_QSTR_hasattr & 0xff, MP_QSTR_hasattr >> 8, 
    0xb3, 
    0x17, 0x01, 
    0x64, 0x02, 
    0x37, 0x1a, 0x80, 
    0xb2, 
    0xb3, 
    0x64, 0x01, 
    0x37, 0x10, 0x80, 
    0xb3, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0xb0, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x09, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8, 
    0xb3, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x35, 0xcb, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_obj_str_t const_obj_micropython_sprite__lt_module_gt__Sprite_remove_0 = {{&mp_type_str}, 44, 12, (const byte*)"\x5f\x73\x70\x72\x69\x74\x65\x67\x72\x6f\x75\x70"};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_remove[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_PTR(&const_obj_micropython_sprite__lt_module_gt__Sprite_remove_0),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_remove = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_remove,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_remove,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 87,
        .n_obj = 1,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_add_internal
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_add_internal[25] = {
    0x05, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x1d, 0x00, 0x00, 0xff,
    0x80, 
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0xb1, 
    0x27, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_add_internal[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_group),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_add_internal = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_add_internal,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_add_internal,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 25,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_remove_internal
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_remove_internal[26] = {
    0x05, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x20, 0x00, 0x00, 0xff,
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0xb1, 
    0x18, 
    0x34, 
    0x27, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_remove_internal[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_group),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_remove_internal = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_remove_internal,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_remove_internal,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 26,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_update
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_update[18] = {
    0x03, 0x00, 0x01, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR_update & 0xff, MP_QSTR_update >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x23, 0x00, 0x00, 0xff,
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_update[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_update = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_update,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_update,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 18,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_kill
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_kill[50] = {
    0x09, 0x00, 0x00, 0x01, 0x00, 0x00, 0x0b,
    MP_QSTR_kill & 0xff, MP_QSTR_kill >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x26, 0x29, 0x2b, 0x00, 0x00, 0xff,
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x47, 
    0x43, 0x0c, 0x00, 
    0xc1, 
    0xb1, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0xf1, 0x7f, 
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x1e, MP_QSTR_clear & 0xff, MP_QSTR_clear >> 8, 
    0x66, 0x00, 
    0x32, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_kill[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_kill = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_kill,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_kill,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 50,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_groups
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_groups[26] = {
    0x03, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR_groups & 0xff, MP_QSTR_groups >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x2b, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_list & 0xff, MP_QSTR_list >> 8, 
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_groups[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_groups = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_groups,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_groups,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 26,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite_alive
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite_alive[26] = {
    0x03, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR_alive & 0xff, MP_QSTR_alive >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x2e, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_truth & 0xff, MP_QSTR_truth >> 8, 
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite_alive[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite_alive = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite_alive,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite_alive,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 26,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite___repr__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite___repr__[38] = {
    0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR___repr__ & 0xff, MP_QSTR___repr__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x31, 0x00, 0x00, 0xff,
    0x17, 0x01, 
    0xb0, 
    0x1d, MP_QSTR___class__ & 0xff, MP_QSTR___class__ >> 8, 
    0x1d, MP_QSTR___name__ & 0xff, MP_QSTR___name__ >> 8, 
    0x1c, MP_QSTR_len & 0xff, MP_QSTR_len >> 8, 
    0xb0, 
    0x1d, MP_QSTR___g & 0xff, MP_QSTR___g >> 8, 
    0x64, 0x01, 
    0x50, 0x02, 
    0xf6, 
    0x5b, 
};
STATIC const mp_obj_str_t const_obj_micropython_sprite__lt_module_gt__Sprite___repr___0 = {{&mp_type_str}, 243, 25, (const byte*)"\x3c\x25\x73\x20\x73\x70\x72\x69\x74\x65\x28\x69\x6e\x20\x25\x64\x20\x67\x72\x6f\x75\x70\x73\x29\x3e"};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite___repr__[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_PTR(&const_obj_micropython_sprite__lt_module_gt__Sprite___repr___0),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite___repr__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite___repr__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite___repr__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 38,
        .n_obj = 1,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Sprite
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Sprite[92] = {
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x15,
    MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x6d, 0x65, 0x40, 0x85, 0x0a, 0x85, 0x0a, 0x65, 0x65, 0x65, 0x65, 0x40, 0x65, 0x65, 0x00, 0x00, 0xff,
    0x1b, MP_QSTR___name__ & 0xff, MP_QSTR___name__ >> 8, 
    0x24, MP_QSTR___module__ & 0xff, MP_QSTR___module__ >> 8, 
    0x16, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x24, MP_QSTR___qualname__ & 0xff, MP_QSTR___qualname__ >> 8, 
    0x60, 0x00, 
    0x24, MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8, 
    0x60, 0x01, 
    0x24, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0x60, 0x02, 
    0x24, MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8, 
    0x60, 0x03, 
    0x24, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0x60, 0x04, 
    0x24, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0x60, 0x05, 
    0x24, MP_QSTR_update & 0xff, MP_QSTR_update >> 8, 
    0x60, 0x06, 
    0x24, MP_QSTR_kill & 0xff, MP_QSTR_kill >> 8, 
    0x60, 0x07, 
    0x24, MP_QSTR_groups & 0xff, MP_QSTR_groups >> 8, 
    0x60, 0x08, 
    0x24, MP_QSTR_alive & 0xff, MP_QSTR_alive >> 8, 
    0x60, 0x09, 
    0x24, MP_QSTR___repr__ & 0xff, MP_QSTR___repr__ >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Sprite[10] = {
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite___init__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_add),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_remove),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_add_internal),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_remove_internal),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_update),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_kill),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_groups),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite_alive),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite___repr__),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Sprite = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 0,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Sprite,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Sprite,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 92,
        .n_obj = 0,
        .n_raw_code = 10,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___init__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___init__[31] = {
    0x03, 0x00, 0x00, 0x01, 0x00, 0x00, 0x0a,
    MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x3a, 0x26, 0x00, 0x00, 0xff,
    0x53, 0x00, 
    0xb0, 
    0x26, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0x51, 0x00, 
    0xb0, 
    0x26, MP_QSTR_lostsprites & 0xff, MP_QSTR_lostsprites >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___init__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___init__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___init__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___init__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 31,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_sprites
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_sprites[26] = {
    0x03, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x3e, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_list & 0xff, MP_QSTR_list >> 8, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_sprites[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_sprites = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_sprites,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_sprites,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 26,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_add_internal
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_add_internal[25] = {
    0x05, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x41, 0x00, 0x00, 0xff,
    0x80, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0xb1, 
    0x27, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_add_internal[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_sprite),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_add_internal = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_add_internal,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_add_internal,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 25,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_remove_internal
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal[51] = {
    0x06, 0x00, 0x00, 0x02, 0x00, 0x00, 0x0c,
    MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x44, 0x27, 0x24, 0x2b, 0x00, 0x00, 0xff,
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0xb1, 
    0x21, 
    0xc2, 
    0xb2, 
    0x37, 0x0b, 0x80, 
    0xb0, 
    0x1d, MP_QSTR_lostsprites & 0xff, MP_QSTR_lostsprites >> 8, 
    0x1e, MP_QSTR_append & 0xff, MP_QSTR_append >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x32, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0xb1, 
    0x18, 
    0x34, 
    0x27, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_sprite),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 51,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_has_internal
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_has_internal[23] = {
    0x04, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x4a, 0x00, 0x00, 0xff,
    0xb1, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0xdd, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_has_internal[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_sprite),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_has_internal = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_has_internal,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_has_internal,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 23,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_copy
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_copy[29] = {
    0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR_copy & 0xff, MP_QSTR_copy >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x4d, 0x00, 0x00, 0xff,
    0xb0, 
    0x1e, MP_QSTR___class__ & 0xff, MP_QSTR___class__ >> 8, 
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x66, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_copy[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_copy = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_copy,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_copy,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 29,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___iter__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___iter__[28] = {
    0x04, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR___iter__ & 0xff, MP_QSTR___iter__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x50, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_iter & 0xff, MP_QSTR_iter >> 8, 
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___iter__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___iter__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___iter__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___iter__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 28,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___contains__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___contains__[24] = {
    0x05, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR___contains__ & 0xff, MP_QSTR___contains__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x53, 0x00, 0x00, 0xff,
    0xb0, 
    0x1e, MP_QSTR_has & 0xff, MP_QSTR_has >> 8, 
    0xb1, 
    0x66, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___contains__[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_sprite),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___contains__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___contains__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___contains__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 24,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_add
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_add[202] = {
    0x12, 0x01, 0x01, 0x01, 0x00, 0x00, 0x1a,
    MP_QSTR_add & 0xff, MP_QSTR_add >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x56, 0x66, 0x20, 0x2c, 0x2a, 0x28, 0x4b, 0x63, 0x2d, 0x6d, 0x40, 0x2c, 0x2b, 0x2a, 0x28, 0x2e, 0x2a, 0x28, 0x00, 0x00, 0xff,
    0xb1, 
    0x47, 
    0x43, 0xa2, 0x00, 
    0xc2, 
    0x1c, MP_QSTR_isinstance & 0xff, MP_QSTR_isinstance >> 8, 
    0xb2, 
    0x1c, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x64, 0x02, 
    0x37, 0x1d, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x36, 0x10, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x32, 
    0xb2, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x75, 0x80, 
    0x3f, 0x0c, 0x00, 
    0xb0, 
    0x1e, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0xb2, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x44, 0x66, 0x00, 
    0x30, 
    0x1c, MP_QSTR_TypeError & 0xff, MP_QSTR_TypeError >> 8, 
    0x1c, MP_QSTR_AttributeError & 0xff, MP_QSTR_AttributeError >> 8, 
    0x50, 0x02, 
    0xdf, 
    0x37, 0x58, 0x80, 
    0x32, 
    0x1c, MP_QSTR_hasattr & 0xff, MP_QSTR_hasattr >> 8, 
    0xb2, 
    0x16, MP_QSTR__spritegroup & 0xff, MP_QSTR__spritegroup >> 8, 
    0x64, 0x02, 
    0x37, 0x2b, 0x80, 
    0xb2, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x1e, 0x00, 
    0xc3, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x36, 0x10, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x32, 
    0xb3, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0xdf, 0x7f, 
    0x35, 0x1d, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x36, 0x13, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x32, 
    0xb2, 
    0x1e, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x00, 0x80, 
    0x44, 0x01, 0x00, 
    0x41, 
    0x35, 0x5b, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_add[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_add = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_add,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_add,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 202,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_remove
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_remove[200] = {
    0x12, 0x01, 0x01, 0x01, 0x00, 0x00, 0x18,
    MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x79, 0x26, 0x2c, 0x2a, 0x28, 0x4b, 0x23, 0x2d, 0x2d, 0x2c, 0x2b, 0x2a, 0x28, 0x2e, 0x2a, 0x28, 0x00, 0x00, 0xff,
    0xb1, 
    0x47, 
    0x43, 0xa2, 0x00, 
    0xc2, 
    0x1c, MP_QSTR_isinstance & 0xff, MP_QSTR_isinstance >> 8, 
    0xb2, 
    0x1c, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x64, 0x02, 
    0x37, 0x1d, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x37, 0x10, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x32, 
    0xb2, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x75, 0x80, 
    0x3f, 0x0c, 0x00, 
    0xb0, 
    0x1e, MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8, 
    0xb2, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x44, 0x66, 0x00, 
    0x30, 
    0x1c, MP_QSTR_TypeError & 0xff, MP_QSTR_TypeError >> 8, 
    0x1c, MP_QSTR_AttributeError & 0xff, MP_QSTR_AttributeError >> 8, 
    0x50, 0x02, 
    0xdf, 
    0x37, 0x58, 0x80, 
    0x32, 
    0x1c, MP_QSTR_hasattr & 0xff, MP_QSTR_hasattr >> 8, 
    0xb2, 
    0x16, MP_QSTR__spritegroup & 0xff, MP_QSTR__spritegroup >> 8, 
    0x64, 0x02, 
    0x37, 0x2b, 0x80, 
    0xb2, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x1e, 0x00, 
    0xc3, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x37, 0x10, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x32, 
    0xb3, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0xdf, 0x7f, 
    0x35, 0x1d, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x37, 0x13, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb2, 
    0x66, 0x01, 
    0x32, 
    0xb2, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0x00, 0x80, 
    0x44, 0x01, 0x00, 
    0x41, 
    0x35, 0x5b, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_remove[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_remove = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_remove,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_remove,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 200,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_has
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_has[185] = {
    0x13, 0x01, 0x01, 0x01, 0x00, 0x00, 0x1c,
    MP_QSTR_has & 0xff, MP_QSTR_has >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0x8c, 0x42, 0x26, 0x4c, 0x2a, 0x45, 0x45, 0x23, 0x2b, 0x45, 0x26, 0x2d, 0x2c, 0x2b, 0x2a, 0x45, 0x48, 0x2a, 0x45, 0x49, 0x00, 0x00, 0xff,
    0x10, 
    0xc2, 
    0xb1, 
    0x47, 
    0x43, 0x8d, 0x00, 
    0xc3, 
    0x1c, MP_QSTR_isinstance & 0xff, MP_QSTR_isinstance >> 8, 
    0xb3, 
    0x1c, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x64, 0x02, 
    0x37, 0x14, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x37, 0x05, 0x80, 
    0x12, 
    0xc2, 
    0x35, 0x02, 0x80, 
    0x10, 
    0x5b, 
    0x35, 0x69, 0x80, 
    0x3f, 0x15, 0x00, 
    0xb0, 
    0x1e, MP_QSTR_has & 0xff, MP_QSTR_has >> 8, 
    0xb3, 
    0x18, 
    0x67, 0x00, 
    0x37, 0x05, 0x80, 
    0x12, 
    0xc2, 
    0x35, 0x02, 0x80, 
    0x10, 
    0x5b, 
    0x44, 0x51, 0x00, 
    0x30, 
    0x1c, MP_QSTR_TypeError & 0xff, MP_QSTR_TypeError >> 8, 
    0x1c, MP_QSTR_AttributeError & 0xff, MP_QSTR_AttributeError >> 8, 
    0x50, 0x02, 
    0xdf, 
    0x37, 0x43, 0x80, 
    0x32, 
    0x1c, MP_QSTR_hasattr & 0xff, MP_QSTR_hasattr >> 8, 
    0xb3, 
    0x16, MP_QSTR__spritegroup & 0xff, MP_QSTR__spritegroup >> 8, 
    0x64, 0x02, 
    0x37, 0x22, 0x80, 
    0xb3, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x15, 0x00, 
    0xc4, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb4, 
    0x66, 0x01, 
    0x37, 0x05, 0x80, 
    0x12, 
    0xc2, 
    0x35, 0x02, 0x80, 
    0x10, 
    0x5b, 
    0x35, 0xe8, 0x7f, 
    0x35, 0x11, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0xb3, 
    0x66, 0x01, 
    0x37, 0x05, 0x80, 
    0x12, 
    0xc2, 
    0x35, 0x02, 0x80, 
    0x10, 
    0x5b, 
    0x44, 0x01, 0x00, 
    0x41, 
    0x35, 0x70, 0x7f, 
    0xb2, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_has[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_has = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_has,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_has,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 185,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_update
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_update[42] = {
    0x0b, 0x00, 0x01, 0x01, 0x00, 0x00, 0x0a,
    MP_QSTR_update & 0xff, MP_QSTR_update >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xab, 0x2b, 0x00, 0x00, 0xff,
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x0d, 0x00, 
    0xc2, 
    0xb2, 
    0x1e, MP_QSTR_update & 0xff, MP_QSTR_update >> 8, 
    0xb1, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x35, 0xf0, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_update[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_update = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_update,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_update,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 42,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_draw
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_draw[76] = {
    0x0d, 0x00, 0x00, 0x02, 0x00, 0x00, 0x0d,
    MP_QSTR_draw & 0xff, MP_QSTR_draw >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xaf, 0x27, 0x25, 0x26, 0x3e, 0x00, 0x00, 0xff,
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0xc2, 
    0xb1, 
    0x1d, MP_QSTR_blit & 0xff, MP_QSTR_blit >> 8, 
    0xc3, 
    0xb2, 
    0x47, 
    0x43, 0x1f, 0x00, 
    0xc4, 
    0xb3, 
    0xb4, 
    0x1d, MP_QSTR_image & 0xff, MP_QSTR_image >> 8, 
    0xb4, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x1d, MP_QSTR_x & 0xff, MP_QSTR_x >> 8, 
    0xb4, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x1d, MP_QSTR_y & 0xff, MP_QSTR_y >> 8, 
    0x64, 0x03, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0xb4, 
    0x27, 
    0x35, 0xde, 0x7f, 
    0x51, 0x00, 
    0xb0, 
    0x26, MP_QSTR_lostsprites & 0xff, MP_QSTR_lostsprites >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_draw[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_surface),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_draw = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_draw,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_draw,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 76,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_clear
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_clear[138] = {
    0x0d, 0x00, 0x00, 0x03, 0x00, 0x00, 0x14,
    MP_QSTR_clear & 0xff, MP_QSTR_clear >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xb6, 0x29, 0x29, 0x29, 0x2e, 0x24, 0x4c, 0x25, 0x29, 0x2a, 0x2e, 0x24, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_callable & 0xff, MP_QSTR_callable >> 8, 
    0xb2, 
    0x64, 0x01, 
    0x37, 0x30, 0x80, 
    0xb0, 
    0x1d, MP_QSTR_lostsprites & 0xff, MP_QSTR_lostsprites >> 8, 
    0x47, 
    0x43, 0x0a, 0x00, 
    0xc3, 
    0xb2, 
    0xb1, 
    0xb3, 
    0x64, 0x02, 
    0x32, 
    0x35, 0xf3, 0x7f, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0x1e, MP_QSTR_values & 0xff, MP_QSTR_values >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x0e, 0x00, 
    0xc3, 
    0xb3, 
    0x37, 0x06, 0x80, 
    0xb2, 
    0xb1, 
    0xb3, 
    0x64, 0x02, 
    0x32, 
    0x35, 0xef, 0x7f, 
    0x35, 0x34, 0x80, 
    0xb1, 
    0x1d, MP_QSTR_blit & 0xff, MP_QSTR_blit >> 8, 
    0xc4, 
    0xb0, 
    0x1d, MP_QSTR_lostsprites & 0xff, MP_QSTR_lostsprites >> 8, 
    0x47, 
    0x43, 0x0b, 0x00, 
    0xc3, 
    0xb4, 
    0xb2, 
    0xb3, 
    0xb3, 
    0x64, 0x03, 
    0x32, 
    0x35, 0xf2, 0x7f, 
    0xb0, 
    0x1d, MP_QSTR_spritedict & 0xff, MP_QSTR_spritedict >> 8, 
    0x1e, MP_QSTR_values & 0xff, MP_QSTR_values >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x0f, 0x00, 
    0xc3, 
    0xb3, 
    0x37, 0x07, 0x80, 
    0xb4, 
    0xb2, 
    0xb3, 
    0xb3, 
    0x64, 0x03, 
    0x32, 
    0x35, 0xee, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_clear[3] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_QSTR(MP_QSTR_surface),
    MP_ROM_QSTR(MP_QSTR_bgd),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_clear = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 3,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_clear,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_clear,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 138,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup_empty
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_empty[50] = {
    0x09, 0x00, 0x00, 0x01, 0x00, 0x00, 0x0b,
    MP_QSTR_empty & 0xff, MP_QSTR_empty >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xc5, 0x2b, 0x28, 0x00, 0x00, 0xff,
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x14, 0x00, 
    0xc1, 
    0xb0, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb1, 
    0x66, 0x01, 
    0x32, 
    0xb1, 
    0x1e, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0x35, 0xe9, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_empty[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup_empty = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup_empty,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup_empty,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 50,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___nonzero__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__[28] = {
    0x04, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR___nonzero__ & 0xff, MP_QSTR___nonzero__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xca, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_truth & 0xff, MP_QSTR_truth >> 8, 
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 28,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___len__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___len__[28] = {
    0x04, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR___len__ & 0xff, MP_QSTR___len__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xcd, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_len & 0xff, MP_QSTR_len >> 8, 
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x64, 0x01, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___len__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___len__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___len__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___len__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 28,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup___repr__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___repr__[35] = {
    0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x09,
    MP_QSTR___repr__ & 0xff, MP_QSTR___repr__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xd0, 0x00, 0x00, 0xff,
    0x17, 0x01, 
    0xb0, 
    0x1d, MP_QSTR___class__ & 0xff, MP_QSTR___class__ >> 8, 
    0x1d, MP_QSTR___name__ & 0xff, MP_QSTR___name__ >> 8, 
    0x1c, MP_QSTR_len & 0xff, MP_QSTR_len >> 8, 
    0xb0, 
    0x64, 0x01, 
    0x50, 0x02, 
    0xf6, 
    0x5b, 
};
STATIC const mp_obj_str_t const_obj_micropython_sprite__lt_module_gt__AbstractGroup___repr___0 = {{&mp_type_str}, 235, 16, (const byte*)"\x3c\x25\x73\x28\x25\x64\x20\x73\x70\x72\x69\x74\x65\x73\x29\x3e"};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___repr__[2] = {
    MP_ROM_QSTR(MP_QSTR_self),
    MP_ROM_PTR(&const_obj_micropython_sprite__lt_module_gt__AbstractGroup___repr___0),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup___repr__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup___repr__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup___repr__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 35,
        .n_obj = 1,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__AbstractGroup
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup[151] = {
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24,
    MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x8d, 0x37, 0x44, 0x65, 0x20, 0x65, 0x65, 0x65, 0x60, 0x65, 0x65, 0x65, 0x65, 0x85, 0x1c, 0x85, 0x1a, 0x85, 0x1f, 0x65, 0x20, 0x85, 0x07, 0x85, 0x0f, 0x65, 0x40, 0x65, 0x65, 0x00, 0x00, 0xff,
    0x1b, MP_QSTR___name__ & 0xff, MP_QSTR___name__ >> 8, 
    0x24, MP_QSTR___module__ & 0xff, MP_QSTR___module__ >> 8, 
    0x16, MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8, 
    0x24, MP_QSTR___qualname__ & 0xff, MP_QSTR___qualname__ >> 8, 
    0x12, 
    0x24, MP_QSTR__spritegroup & 0xff, MP_QSTR__spritegroup >> 8, 
    0x60, 0x00, 
    0x24, MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8, 
    0x60, 0x01, 
    0x24, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x60, 0x02, 
    0x24, MP_QSTR_add_internal & 0xff, MP_QSTR_add_internal >> 8, 
    0x60, 0x03, 
    0x24, MP_QSTR_remove_internal & 0xff, MP_QSTR_remove_internal >> 8, 
    0x60, 0x04, 
    0x24, MP_QSTR_has_internal & 0xff, MP_QSTR_has_internal >> 8, 
    0x60, 0x05, 
    0x24, MP_QSTR_copy & 0xff, MP_QSTR_copy >> 8, 
    0x60, 0x06, 
    0x24, MP_QSTR___iter__ & 0xff, MP_QSTR___iter__ >> 8, 
    0x60, 0x07, 
    0x24, MP_QSTR___contains__ & 0xff, MP_QSTR___contains__ >> 8, 
    0x60, 0x08, 
    0x24, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0x60, 0x09, 
    0x24, MP_QSTR_remove & 0xff, MP_QSTR_remove >> 8, 
    0x60, 0x0a, 
    0x24, MP_QSTR_has & 0xff, MP_QSTR_has >> 8, 
    0x60, 0x0b, 
    0x24, MP_QSTR_update & 0xff, MP_QSTR_update >> 8, 
    0x60, 0x0c, 
    0x24, MP_QSTR_draw & 0xff, MP_QSTR_draw >> 8, 
    0x60, 0x0d, 
    0x24, MP_QSTR_clear & 0xff, MP_QSTR_clear >> 8, 
    0x60, 0x0e, 
    0x24, MP_QSTR_empty & 0xff, MP_QSTR_empty >> 8, 
    0x60, 0x0f, 
    0x24, MP_QSTR___nonzero__ & 0xff, MP_QSTR___nonzero__ >> 8, 
    0x60, 0x10, 
    0x24, MP_QSTR___len__ & 0xff, MP_QSTR___len__ >> 8, 
    0x60, 0x11, 
    0x24, MP_QSTR___repr__ & 0xff, MP_QSTR___repr__ >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__AbstractGroup[18] = {
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___init__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_sprites),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_add_internal),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_remove_internal),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_has_internal),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_copy),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___iter__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___contains__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_add),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_remove),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_has),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_update),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_draw),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_clear),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup_empty),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___nonzero__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___len__),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup___repr__),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__AbstractGroup = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 0,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__AbstractGroup,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__AbstractGroup,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 151,
        .n_obj = 0,
        .n_raw_code = 18,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Group___init__
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Group___init__[38] = {
    0x06, 0x00, 0x01, 0x01, 0x00, 0x00, 0x0a,
    MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xd5, 0x2a, 0x00, 0x00, 0xff,
    0x1c, MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8, 
    0x1e, MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8, 
    0xb0, 
    0x66, 0x01, 
    0x32, 
    0xb0, 
    0x1e, MP_QSTR_add & 0xff, MP_QSTR_add >> 8, 
    0xb1, 
    0x18, 
    0x67, 0x00, 
    0x32, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Group___init__[1] = {
    MP_ROM_QSTR(MP_QSTR_self),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Group___init__ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x01,
    .n_pos_args = 1,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Group___init__,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Group___init__,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 38,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__Group
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__Group[35] = {
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09,
    MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x8d, 0xd4, 0x00, 0x00, 0xff,
    0x1b, MP_QSTR___name__ & 0xff, MP_QSTR___name__ >> 8, 
    0x24, MP_QSTR___module__ & 0xff, MP_QSTR___module__ >> 8, 
    0x16, MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8, 
    0x24, MP_QSTR___qualname__ & 0xff, MP_QSTR___qualname__ >> 8, 
    0x60, 0x00, 
    0x24, MP_QSTR___init__ & 0xff, MP_QSTR___init__ >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__Group[1] = {
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Group___init__),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__Group = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 0,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__Group,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__Group,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 35,
        .n_obj = 0,
        .n_raw_code = 1,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__collide_mask
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__collide_mask[132] = {
    0x0c, 0x01, 0x00, 0x02, 0x00, 0x00, 0x11,
    MP_QSTR_collide_mask & 0xff, MP_QSTR_collide_mask >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x81, 0xdc, 0x2e, 0x2e, 0x23, 0x51, 0x2e, 0x23, 0x51, 0x2e, 0x00, 0x00, 0xff,
    0xb1, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x80, 
    0x21, 
    0xb0, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x80, 
    0x21, 
    0xf2, 
    0xc2, 
    0xb1, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x81, 
    0x21, 
    0xb0, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x81, 
    0x21, 
    0xf2, 
    0xc3, 
    0x3f, 0x08, 0x00, 
    0xb0, 
    0x1d, MP_QSTR_mask & 0xff, MP_QSTR_mask >> 8, 
    0xc4, 
    0x44, 0x17, 0x00, 
    0x30, 
    0x1c, MP_QSTR_AttributeError & 0xff, MP_QSTR_AttributeError >> 8, 
    0xdf, 
    0x37, 0x0e, 0x80, 
    0x32, 
    0x1c, MP_QSTR_from_surface & 0xff, MP_QSTR_from_surface >> 8, 
    0xb0, 
    0x1d, MP_QSTR_image & 0xff, MP_QSTR_image >> 8, 
    0x64, 0x01, 
    0xc4, 
    0x44, 0x01, 0x00, 
    0x41, 
    0x3f, 0x08, 0x00, 
    0xb1, 
    0x1d, MP_QSTR_mask & 0xff, MP_QSTR_mask >> 8, 
    0xc5, 
    0x44, 0x17, 0x00, 
    0x30, 
    0x1c, MP_QSTR_AttributeError & 0xff, MP_QSTR_AttributeError >> 8, 
    0xdf, 
    0x37, 0x0e, 0x80, 
    0x32, 
    0x1c, MP_QSTR_from_surface & 0xff, MP_QSTR_from_surface >> 8, 
    0xb1, 
    0x1d, MP_QSTR_image & 0xff, MP_QSTR_image >> 8, 
    0x64, 0x01, 
    0xc5, 
    0x44, 0x01, 0x00, 
    0x41, 
    0xb4, 
    0x1e, MP_QSTR_overlap & 0xff, MP_QSTR_overlap >> 8, 
    0xb5, 
    0xb2, 
    0xb3, 
    0x50, 0x02, 
    0x66, 0x02, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__collide_mask[2] = {
    MP_ROM_QSTR(MP_QSTR_left),
    MP_ROM_QSTR(MP_QSTR_right),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__collide_mask = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__collide_mask,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__collide_mask,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 132,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__spritecollide_<listcomp>
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_[41] = {
    0x0c, 0x00, 0x00, 0x03, 0x00, 0x00, 0x09,
    MP_QSTR__lt_listcomp_gt_ & 0xff, MP_QSTR__lt_listcomp_gt_ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x89, 0xfd, 0x00, 0x00, 0xff,
    0x51, 0x00, 
    0xb2, 
    0x47, 
    0x43, 0x11, 0x00, 
    0xc3, 
    0x1a, 0x01, 
    0x1a, 0x00, 
    0xb3, 
    0x64, 0x02, 
    0x37, 0xf2, 0x7f, 
    0xb3, 
    0x57, 0x14, 
    0x35, 0xec, 0x7f, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_[3] = {
    MP_ROM_QSTR(MP_QSTR__star_),
    MP_ROM_QSTR(MP_QSTR__star_),
    MP_ROM_QSTR(MP_QSTR__star_),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 3,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 41,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__spritecollide_<listcomp>
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2[42] = {
    0x0a, 0x00, 0x00, 0x02, 0x00, 0x00, 0x09,
    MP_QSTR__lt_listcomp_gt_ & 0xff, MP_QSTR__lt_listcomp_gt_ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x99, 0x00, 0x00, 0x00, 0xff,
    0x51, 0x00, 
    0xb1, 
    0x47, 
    0x43, 0x12, 0x00, 
    0xc2, 
    0x1a, 0x00, 
    0xb2, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x64, 0x01, 
    0x37, 0xf1, 0x7f, 
    0xb2, 
    0x57, 0x14, 
    0x35, 0xeb, 0x7f, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2[2] = {
    MP_ROM_QSTR(MP_QSTR__star_),
    MP_ROM_QSTR(MP_QSTR__star_),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2 = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 2,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 42,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__spritecollide
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__spritecollide[174] = {
    0x0f, 0x00, 0x00, 0x04, 0x00, 0x01, 0x19,
    MP_QSTR_spritecollide & 0xff, MP_QSTR_spritecollide >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x84, 0xe9, 0x44, 0x23, 0x45, 0x25, 0x2b, 0x2a, 0x27, 0x4b, 0x2a, 0x2b, 0x2b, 0x27, 0x48, 0x67, 0x49, 0x2a, 0x00, 0x00, 0x00, 0x03, 0x07, 0xff,
    0xb2, 
    0x37, 0x65, 0x80, 
    0x51, 0x00, 
    0xc4, 
    0xb4, 
    0x1d, MP_QSTR_append & 0xff, MP_QSTR_append >> 8, 
    0xc5, 
    0x1a, 0x03, 
    0x37, 0x27, 0x80, 
    0xb1, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x1a, 0x00, 
    0xc6, 
    0x1a, 0x03, 
    0x1a, 0x00, 
    0xb6, 
    0x64, 0x02, 
    0x37, 0x0c, 0x80, 
    0xb6, 
    0x1e, MP_QSTR_kill & 0xff, MP_QSTR_kill >> 8, 
    0x66, 0x00, 
    0x32, 
    0xb5, 
    0xb6, 
    0x64, 0x01, 
    0x32, 
    0x35, 0xe3, 0x7f, 
    0x35, 0x2f, 0x80, 
    0x1a, 0x00, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x1d, MP_QSTR_colliderect & 0xff, MP_QSTR_colliderect >> 8, 
    0x23, 0x07, 
    0xb1, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x1b, 0x00, 
    0xc6, 
    0x1a, 0x07, 
    0xb6, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x64, 0x01, 
    0x37, 0x0c, 0x80, 
    0xb6, 
    0x1e, MP_QSTR_kill & 0xff, MP_QSTR_kill >> 8, 
    0x66, 0x00, 
    0x32, 
    0xb5, 
    0xb6, 
    0x64, 0x01, 
    0x32, 
    0x35, 0xe2, 0x7f, 
    0xb4, 
    0x5b, 
    0x1a, 0x03, 
    0x37, 0x09, 0x80, 
    0xb0, 
    0xb3, 
    0x62, 0x04, 0x02, 
    0xb1, 
    0x64, 0x01, 
    0x5b, 
    0x1a, 0x00, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x1d, MP_QSTR_colliderect & 0xff, MP_QSTR_colliderect >> 8, 
    0x23, 0x07, 
    0xb7, 
    0x62, 0x05, 0x01, 
    0xb1, 
    0x64, 0x01, 
    0x5b, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__spritecollide[6] = {
    MP_ROM_QSTR(MP_QSTR_sprite),
    MP_ROM_QSTR(MP_QSTR_group),
    MP_ROM_QSTR(MP_QSTR_dokill),
    MP_ROM_QSTR(MP_QSTR_collided),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__spritecollide__lt_listcomp_gt_2),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__spritecollide = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 4,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__spritecollide,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__spritecollide,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 174,
        .n_obj = 0,
        .n_raw_code = 2,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__groupcollide
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__groupcollide[106] = {
    0x12, 0x00, 0x00, 0x05, 0x00, 0x01, 0x15,
    MP_QSTR_groupcollide & 0xff, MP_QSTR_groupcollide >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x91, 0x04, 0x23, 0x24, 0x24, 0x2b, 0x28, 0x24, 0x24, 0x4d, 0x26, 0x28, 0x24, 0x27, 0x00, 0x00, 0xff,
    0x53, 0x00, 
    0xc5, 
    0x1c, MP_QSTR_spritecollide & 0xff, MP_QSTR_spritecollide >> 8, 
    0xc6, 
    0xb2, 
    0x37, 0x28, 0x80, 
    0xb0, 
    0x1e, MP_QSTR_sprites & 0xff, MP_QSTR_sprites >> 8, 
    0x66, 0x00, 
    0x47, 
    0x43, 0x1b, 0x00, 
    0xc7, 
    0xb6, 
    0xb7, 
    0xb1, 
    0xb3, 
    0xb4, 
    0x64, 0x04, 
    0xc8, 
    0xb8, 
    0x37, 0x0b, 0x80, 
    0xb8, 
    0xb5, 
    0xb7, 
    0x27, 
    0xb7, 
    0x1e, MP_QSTR_kill & 0xff, MP_QSTR_kill >> 8, 
    0x66, 0x00, 
    0x32, 
    0x35, 0xe2, 0x7f, 
    0x35, 0x19, 0x80, 
    0xb0, 
    0x47, 
    0x43, 0x14, 0x00, 
    0xc7, 
    0xb6, 
    0xb7, 
    0xb1, 
    0xb3, 
    0xb4, 
    0x64, 0x04, 
    0xc8, 
    0xb8, 
    0x37, 0x04, 0x80, 
    0xb8, 
    0xb5, 
    0xb7, 
    0x27, 
    0x35, 0xe9, 0x7f, 
    0xb5, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__groupcollide[5] = {
    MP_ROM_QSTR(MP_QSTR_groupa),
    MP_ROM_QSTR(MP_QSTR_groupb),
    MP_ROM_QSTR(MP_QSTR_dokilla),
    MP_ROM_QSTR(MP_QSTR_dokillb),
    MP_ROM_QSTR(MP_QSTR_collided),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__groupcollide = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 5,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__groupcollide,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__groupcollide,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 106,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite__lt_module_gt__spritecollideany
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt__spritecollideany[81] = {
    0x0c, 0x00, 0x00, 0x03, 0x00, 0x01, 0x11,
    MP_QSTR_spritecollideany & 0xff, MP_QSTR_spritecollideany >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x91, 0x14, 0x24, 0x26, 0x28, 0x68, 0x28, 0x26, 0x2a, 0x25, 0x00, 0x00, 0xff,
    0xb2, 
    0x37, 0x16, 0x80, 
    0xb1, 
    0x47, 
    0x43, 0x0e, 0x00, 
    0xc3, 
    0xb2, 
    0xb0, 
    0xb3, 
    0x64, 0x02, 
    0x37, 0x02, 0x80, 
    0xb3, 
    0x5b, 
    0x35, 0xef, 0x7f, 
    0x35, 0x1d, 0x80, 
    0xb0, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x1d, MP_QSTR_colliderect & 0xff, MP_QSTR_colliderect >> 8, 
    0xc4, 
    0xb1, 
    0x47, 
    0x43, 0x10, 0x00, 
    0xc3, 
    0xb4, 
    0xb3, 
    0x1d, MP_QSTR_rect & 0xff, MP_QSTR_rect >> 8, 
    0x64, 0x01, 
    0x37, 0x02, 0x80, 
    0xb3, 
    0x5b, 
    0x35, 0xed, 0x7f, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt__spritecollideany[3] = {
    MP_ROM_QSTR(MP_QSTR_sprite),
    MP_ROM_QSTR(MP_QSTR_group),
    MP_ROM_QSTR(MP_QSTR_collided),
};
STATIC const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt__spritecollideany = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 3,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt__spritecollideany,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt__spritecollideany,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 81,
        .n_obj = 0,
        .n_raw_code = 0,
        #endif
    },
};

// frozen bytecode for file micropython/sprite.py, scope micropython_sprite_<module>
STATIC const byte bytecode_data_micropython_sprite__lt_module_gt_[125] = {
    0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16,
    MP_QSTR__lt_module_gt_ & 0xff, MP_QSTR__lt_module_gt_ >> 8,
    MP_QSTR_micropython_slash_sprite_dot_py & 0xff, MP_QSTR_micropython_slash_sprite_dot_py >> 8,
    0x49, 0x8e, 0x32, 0x8e, 0x9f, 0x6e, 0x40, 0x26, 0x46, 0x85, 0x0d, 0x89, 0x1b, 0x89, 0x10, 0x00, 0x00, 0xff,
    0x80, 
    0x11, 
    0x68, MP_QSTR_upygame & 0xff, MP_QSTR_upygame >> 8, 
    0x24, MP_QSTR_pygame & 0xff, MP_QSTR_pygame >> 8, 
    0x20, 
    0x60, 0x00, 
    0x16, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x1b, MP_QSTR_object & 0xff, MP_QSTR_object >> 8, 
    0x64, 0x03, 
    0x24, MP_QSTR_Sprite & 0xff, MP_QSTR_Sprite >> 8, 
    0x20, 
    0x60, 0x01, 
    0x16, MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8, 
    0x1b, MP_QSTR_object & 0xff, MP_QSTR_object >> 8, 
    0x64, 0x03, 
    0x24, MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8, 
    0x20, 
    0x60, 0x02, 
    0x16, MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8, 
    0x1b, MP_QSTR_AbstractGroup & 0xff, MP_QSTR_AbstractGroup >> 8, 
    0x64, 0x03, 
    0x24, MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8, 
    0x1b, MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8, 
    0x24, MP_QSTR_RenderPlain & 0xff, MP_QSTR_RenderPlain >> 8, 
    0x1b, MP_QSTR_Group & 0xff, MP_QSTR_Group >> 8, 
    0x24, MP_QSTR_RenderClear & 0xff, MP_QSTR_RenderClear >> 8, 
    0x60, 0x03, 
    0x24, MP_QSTR_collide_mask & 0xff, MP_QSTR_collide_mask >> 8, 
    0x11, 
    0x50, 0x01, 
    0x18, 
    0x61, 0x04, 
    0x24, MP_QSTR_spritecollide & 0xff, MP_QSTR_spritecollide >> 8, 
    0x11, 
    0x50, 0x01, 
    0x18, 
    0x61, 0x05, 
    0x24, MP_QSTR_groupcollide & 0xff, MP_QSTR_groupcollide >> 8, 
    0x11, 
    0x50, 0x01, 
    0x18, 
    0x61, 0x06, 
    0x24, MP_QSTR_spritecollideany & 0xff, MP_QSTR_spritecollideany >> 8, 
    0x11, 
    0x5b, 
};
STATIC const mp_rom_obj_t const_table_data_micropython_sprite__lt_module_gt_[7] = {
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Sprite),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__AbstractGroup),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__Group),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__collide_mask),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__spritecollide),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__groupcollide),
    MP_ROM_PTR(&raw_code_micropython_sprite__lt_module_gt__spritecollideany),
};
const mp_raw_code_t raw_code_micropython_sprite__lt_module_gt_ = {
    .kind = MP_CODE_BYTECODE,
    .scope_flags = 0x00,
    .n_pos_args = 0,
    .data.u_byte = {
        .bytecode = bytecode_data_micropython_sprite__lt_module_gt_,
        .const_table = (mp_uint_t*)const_table_data_micropython_sprite__lt_module_gt_,
        #if MICROPY_PERSISTENT_CODE_SAVE
        .bc_len = 125,
        .n_obj = 0,
        .n_raw_code = 7,
        #endif
    },
};

const char mp_frozen_mpy_names[] = {
"main.py\0"
"micropython/sprite.py\0"
"\0"};
const mp_raw_code_t *const mp_frozen_mpy_content[] = {
    &raw_code_main__lt_module_gt_,
    &raw_code_micropython_sprite__lt_module_gt_,
};