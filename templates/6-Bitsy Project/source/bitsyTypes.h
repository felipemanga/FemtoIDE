
struct Sprite {
    uint16_t animId, dlgId;
    uint8_t roomId;
    int8_t x, y, col;
};

struct Item {
  uint16_t animId, dlgId;
  uint8_t roomId;
  int8_t x, y, col;
  const char *name;
};

enum class VarType {
  String,
  Integer,
  Float,
  Void
};

struct Constant {
  union{
    const char *s;
    int32_t i;
    float f;
  };
  VarType type;
  Constant( int32_t _i ) : i(_i), type(VarType::Integer){}
  Constant( float _f ) : f(_f), type(VarType::Float){}
  Constant( const char *_s ) : s(_s), type(VarType::String){}
};

struct Variable {
  std::string s;     // 0
  union{
    int32_t  i;      // 1
    float    f;      // 2
  };
  VarType type;
  uint32_t id;

  Variable() = default;

  Variable( uint32_t id, int32_t _i ) : i(_i), type(VarType::Integer) , id(id) {}
  Variable( uint32_t id, float _f ) : f(_f), type(VarType::Float) , id(id) {}
  Variable( uint32_t id, const std::string &_s ) : s(_s), type(VarType::String) , id(id) {}

  Variable &operator = (const Constant &c){
    
    type = c.type;

    if( type == VarType::String )
      s = c.s;
    else
      i = c.i;

    return *this;
  }

} retVal;

void equalizeTypes( Variable &left, Variable &right ){
  
  if( left.type == right.type )
    return;

  if( left.type == VarType::Void || right.type == VarType::Void ){
    left.type = right.type = VarType::Void;
    return;
  }
      
  if( left.type == VarType::String || right.type == VarType::String ){
	
    switch( left.type ){
    case VarType::Void:
    case VarType::String: break;
    case VarType::Integer:
      left.s = std::to_string( left.i );
      break;
    case VarType::Float:
      left.s = std::to_string( left.f );
    }
    left.type = VarType::String;

    switch( right.type ){
    case VarType::Void:
    case VarType::String: break;
    case VarType::Integer:
      right.s = std::to_string( right.i );
      break;
    case VarType::Float:
      right.s = std::to_string( right.f );
    }
    right.type = VarType::String;
	
  }else{

    if( left.type == VarType::Integer )
      left.f = static_cast<float>(left.i);

    if( right.type == VarType::Integer )
      right.f = static_cast<float>(right.i);

  }

}

extern Variable vars[];

struct Exit {
  uint8_t roomId, tRoomId;
  int8_t x, y, tx, ty;
};

struct Block {
  void (*call)( const Block * );
  uint16_t const * children;
  void *extra;
  
};

extern Sprite &player;
extern uint16_t playerInventory[];
const extern uint16_t *palettes[];
extern const Block blocks[];
extern const Item items[];
extern const uint32_t itemCount;

uint32_t execDepth = 0;
void exec( int id ){

  if( execDepth == 0 ){
    printCount = 0;
    if( player.y > 4 ){
      minCursorY = 0;
      maxCursorY = 8*4;
    }else{
      minCursorY = POK_LCD_H - 8*4;
      maxCursorY = POK_LCD_H;
    }
    
    Display::setCursor( 5, minCursorY );
    Display::directcolor = COLOR_WHITE;
    Display::directbgcolor = COLOR_BLACK;

    forceWait = Buttons::buttons_state;
  }
  
  execDepth++;

  retVal.type = VarType::Void;
  (*blocks[id].call)( &blocks[id] );
  
  execDepth--;

  if( execDepth == 0 && printCount > 0 ){
//    fill_txtline();
    wait();
    clearScreen();
  }
  
}

