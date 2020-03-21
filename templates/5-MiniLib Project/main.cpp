#include "PokittoMini.h"

int main(){
    enableDAC();
    int i=0;
    int x=0, t=0;
    while(true){
        if(aBtn() || bBtn() || cBtn() || upBtn() || downBtn() || leftBtn() || rightBtn())
            writePixel(i++);
        if( !x-- ){
            writeDAC((t>>5)|(t>>4)|t++);
            x = 500;
        }
    }
}