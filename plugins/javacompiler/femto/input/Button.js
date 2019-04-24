module.exports = `
package femto.input;

public class Button {
uint address;

Button( uint addr ){
address = addr;
}

public boolean isPressed(){
return System.memory.read8(address) != 0;
}

public static final Button A = new Button(0xA0000020+9);
public static final Button B = new Button(0xA0000020+4);
public static final Button C = new Button(0xA0000020+10);
public static final Button D = new Button(0xA0000000+1);
public static final Button Up = new Button(0xA0000020+13);
public static final Button Down = new Button(0xA0000020+3);
public static final Button Left = new Button(0xA0000020+25);
public static final Button Right = new Button(0xA0000020+7);

}
`;
