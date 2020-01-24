#include <string>

#include "PokittoMini.h"
#include "Direct.h"
#include "compat.h"

void (*updateState)();

void clearScreen();

void stateDialog();

#include "print.hpp"

#include "bitsyTypes.h"

#include "Node.hpp"

#include "Functions.hpp"

#include "bitsy.h"

bool stateInitialized = false;
uint32_t room[256];

uint16_t currentDialogId=0;
uint8_t textPos;
uint8_t animationFrame, movementFrame;

void start_application(unsigned long app_link_location);
void reset();

bool zoomed = true;

bool window( int x, int y ){
  if( zoomed ){
    
    x = ((x - player.x)<<4) + POK_LCD_W/2 - 8;
    y = ((y - player.y)<<4) + POK_LCD_H/2 - 8;
    if( x < 0 || y < 0 || x+16>POK_LCD_W || y+16>POK_LCD_H )
      return false;
    
    DIRECT::setWindow( y, x, y+15, x+15 );
    
  }else{
    DIRECT::setWindow( (y<<3)+24, (x<<3)+46, (((y+1)<<3)-1)+24, ((x+1)<<3)-1+46 );
  }
  return true;
}

void drawEmpty(int32_t x, int32_t y, uint32_t bg ){
  auto m = zoomed ? 16 : 8;

  if( !window(x, y) )
    return;

  DIRECT::write_command(0x22);
  *DIRECT::SET_CD = DIRECT::CD_PIN;
  DIRECT::setup_data( bg );
  for( y=0; y<m; ++y ){
    for( x=0; x<m; ++x ){
        DIRECT::toggle_data();
    }
  }
    
}

void draw(int32_t x, int32_t y, int32_t imgId, uint32_t bg, uint32_t fg ){

  if( !window(x, y) )
    return;
  
  // DIRECT::setWindow( (y<<3)+24, (x<<3)+46, (((y+1)<<3)-1)+24, ((x+1)<<3)-1+46 );
  DIRECT::write_command(0x22);
  *DIRECT::SET_CD = DIRECT::CD_PIN;

  auto frameId = anims_pok[(imgId-1)<<1];
  auto frameCount = anims_pok[((imgId-1)<<1)+1];
  
  if( frameCount>1 )
    frameId += (Core::frameCount>>2)%frameCount;

  auto img = images_pok[ frameId ];

  if( zoomed ){
    
    for( y=0; y<8; ++y ){
      uint32_t m = *img;
      for( x=0; x<8; ++x, m>>=1 ){
    	DIRECT::setup_data( m&1 ? fg : bg );
    	DIRECT::toggle_data();
    	DIRECT::toggle_data();
      }
      m = *img++;
      for( x=0; x<8; ++x, m>>=1 ){
    	DIRECT::setup_data( m&1 ? fg : bg );
    	DIRECT::toggle_data();
    	DIRECT::toggle_data();
      }
    }
    
  }else{
    
    for( y=0; y<8; ++y ){
      uint32_t m = *img++;
      for( x=0; x<8; ++x, m>>=1 ){
	    DIRECT::write_data( m&1 ? fg : bg );
      }
    }
    
  }
    
}

void drawRoom(){
    auto &pal = palettes[player.roomId-1];
    
    for( int y=0; y<16; y++ ){
        for( int x=0; x<16; x++ ){
            uint32_t mixed = room[y*16+x];
            uint32_t id = mixed & 0x7FFF; // upper int16 bit indicates a wall
            uint32_t spriteId = (mixed>>16) & 0xFF;
            uint32_t itemId   = (mixed>>24) & 0xFF;
            uint32_t bg = pal[0], fg = pal[1];
            if( spriteId ){
                Sprite &sprite = sprites[spriteId-1];
                id = sprite.animId;
                fg = pal[sprite.col];
            }else if( itemId && !itemState[itemId-1] ){
                const Item &item = items[itemId-1];
                id = item.animId;
                fg = pal[item.col];
            }else if( !id ){
                drawEmpty( x, y, bg );
                continue;
            }
            
            draw( x, y, id, bg, fg );
        }
    }

    for( int i=0; i<16; i++ ){
        drawEmpty(-1,i,pal[0]);
        drawEmpty(16,i,pal[0]);
        drawEmpty( i,-1,pal[0]);
        drawEmpty( i,16,pal[0]);
    }

    DIRECT::setWindow(0, 0, 175, 219);

}

bool collision( int x, int y ){
  auto &mixed = room[y*16+x];
  uint32_t spriteId = (mixed>>16) & 0xFF;
  uint32_t itemId   = (mixed>>24) & 0xFF;
  uint32_t dlgId = 0;
  
  if( itemId && !itemState[ itemId-1 ] ){
    playerInventory[ itemId-1 ]++;
    dlgId = items[ itemId-1 ].dlgId;
    itemState[ itemId-1 ] = 1;
    mixed &= ~(0xFF<<24);
  }

  if( !dlgId && spriteId && sprites[ spriteId-1 ].dlgId )
    dlgId = sprites[ spriteId-1 ].dlgId;
  
  if( dlgId ){
    auto oldExecDepth = execDepth;
    execDepth = 0;
    exec( dialog[ dlgId-1 ] );
    execDepth = oldExecDepth;
  }
  
  return mixed >= 0x8000;  
}

bool isWall( int x, int y ){
  return room[y*16+x] & 0x8000;
}

void movePlayer(){
  if( (Buttons::buttons_state & (1<<LEFTBIT)) && player.x > 0 && !collision( player.x-1, player.y) ){
    player.x--;
    stateInitialized = false;
  }
  
  if( (Buttons::buttons_state & (1<<RIGHTBIT)) && player.x < 15 && !collision( player.x+1, player.y) ){
    player.x++;
    stateInitialized = false;
  }

  if( (Buttons::buttons_state & (1<<UPBIT)) && player.y > 0 && !collision( player.x, player.y-1) ){
    player.y--;
    stateInitialized = false;
  }
  
  if( (Buttons::buttons_state & (1<<DOWNBIT)) && player.y < 15 && !collision( player.x, player.y+1) ){
    player.y++;
    stateInitialized = false;
  }

  if( !stateInitialized ){
    
    for( uint32_t i=0; i<sizeof(exits)/sizeof(Exit); ++i ){
      const Exit &exit = exits[i];
      if( exit.roomId == player.roomId && exit.x == player.x && exit.y == player.y ){
	if( !exit.tRoomId ){ // an ending
	  clearScreen();
	  Display::setCursor( 0, 0 );
	  Display::directcolor = COLOR_WHITE;
	  Display::directbgcolor = COLOR_BLACK;
	  print( endings[exit.tx-1] );
	  wait();
	  reset();
	}else{
	  player.x = exit.tx;
	  player.y = exit.ty;
	  player.roomId = exit.tRoomId;
	}
	return;
      }
    }
    
  }
  
}

uint32_t prevRoom=~0;

void clearScreen(){
  DIRECT::fillRect( 0, 0, 220, 176, palettes[player.roomId-1][0] );  
}

extern "C" void __wrap_exit( int num );
void reset(){
  // NVIC_SystemReset();
  __wrap_exit(0);
}

void stateMap(){

  if( !stateInitialized ){
    stateInitialized = true;
    
    
    if( player.roomId != prevRoom ){
      clearScreen();
      prevRoom = player.roomId;
    }

    auto &src = rooms[player.roomId-1];
    for( uint32_t i=0; i<256; ++i )
      room[i] = src[i]; // uint16 -> uint32, erase sprites/items

    for( uint32_t i=0; i<sizeof(sprites)/sizeof(Sprite); ++i ){
      auto &sprite = sprites[i];
      if(
	 sprite.roomId != player.roomId ||
	 sprite.x<0 ||
	 sprite.y<0 ||
	 sprite.x>=16 ||
	 sprite.y>=16
	 )
	continue;
      room[sprite.y*16+sprite.x] |= (i+1)<<16;	
    }


    for( uint32_t i=0; i<itemCount; ++i ){
      const auto &item = items[i];
      if(
	 (item.roomId+1) != player.roomId ||
	 item.x<0 ||
	 item.y<0 ||
	 item.x>=16 ||
	 item.y>=16 ||
	 itemState[i]
	 )
	continue;
      room[item.y*16+item.x] |= (i+1)<<24;
    }
    
  }

  drawRoom();

  if( !Buttons::buttons_state )
    movementFrame = 1;

  if( !movementFrame-- ){
    movementFrame = 3;
    movePlayer();
  }

}

int main () {
  
  Core::begin();
  updateState = stateMap;

  clearScreen();
  Display::cursorY = 172 / 2 - 4;
  Display::cursorX = 5;
  print(bitsyTitle);
  wait();
  
  clearScreen();
  exec( title );
    
  while( true ){
      Core::wait(33);
    Core::frameCount++;
    updateButtons();
    if( Buttons::buttons_state & ~Buttons::buttons_held & (1<<CBIT) ){
        clearScreen();
        zoomed = !zoomed;
    }
    updateState();
  }
    
}
