# uPyGame performance test
# Copyright (C) 2019 Hannu Viitala
#
# The source code in this file is released under the MIT license.
# Go to http://opensource.org/licenses/MIT for the full license details.
#
# The graphics in this file are released under the Creative Commons Attribution license (CC-BY).
# Go to https://creativecommons.org/licenses/by/4.0/ for the full license details.

# 1) Drawing a surface of 16x16 pixels 100 times a frame gives 16 Fps (full speed). 4-bit colors for both screen and the surface.
# 2) Drawing a surface of 16x16 pixels 200 times a frame gives 12 Fps (full speed). 4-bit colors for both screen and the surface.

import upygame as upg
import urandom as random

upg.display.init()
screen_sf = upg.display.set_mode() # full screen

# Set palette
upg.display.set_palette_16bit([0,4124,1984,65535]);

# pokitto picture
w2 = 16
h2 = 16
pokittoPixels = b'\
\x00\x03\x33\x33\x33\x33\x33\x00\
\x00\x32\x22\x22\x22\x22\x32\x00\
\x00\x32\x33\x33\x33\x33\x22\x00\
\x00\x32\x31\x11\x11\x11\x22\x00\
\x00\x32\x31\x13\x11\x31\x22\x00\
\x02\x32\x31\x11\x11\x11\x22\x23\
\x03\x32\x31\x13\x33\x11\x22\x30\
\x00\x32\x31\x11\x11\x11\x22\x00\
\x00\x32\x22\x22\x22\x22\x22\x00\
\x00\x32\x23\x22\x22\x23\x32\x00\
\x00\x32\x33\x32\x23\x33\x32\x00\
\x00\x32\x23\x22\x23\x32\x22\x00\
\x00\x32\x22\x23\x32\x22\x22\x00\
\x00\x32\x22\x22\x22\x22\x32\x00\
\x00\x33\x33\x33\x33\x33\x33\x00\
\x00\x32\x00\x00\x00\x00\x32\x00\
'

hero_sf = upg.surface.Surface(w2, h2, pokittoPixels)
#hero_sf.fill(2)

x=20
y=20
vx = 0;
vy = 0;
while True:

    eventtype = upg.event.poll()
    if eventtype != upg.NOEVENT:
        if eventtype.type== upg.KEYDOWN:
            if eventtype.key == upg.K_RIGHT:
                vx = 1
            if eventtype.key == upg.K_LEFT:
                vx = -1
            if eventtype.key == upg.K_UP:
                vy = -1
            if eventtype.key == upg.K_DOWN:
                vy = 1
        if eventtype.type == upg.KEYUP:
            if eventtype.key == upg.K_RIGHT:
                vx = 0
            if eventtype.key == upg.K_LEFT:
                vx = 0
            if eventtype.key == upg.K_UP:
                vy = 0
            if eventtype.key == upg.K_DOWN:
                vy = 0

    for i in range(1,200):
        x2 = random.getrandbits(6) + 20
        y2 = random.getrandbits(6) + 5
        screen_sf.blit(hero_sf, x2, y2)

    x = x + vx
    y = y + vy
    screen_sf.blit(hero_sf, x, y)

    upg.display.flip()
