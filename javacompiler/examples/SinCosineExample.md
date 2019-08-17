# Sine and cosine graphical representation {#sincosgraphical}

![](../images/SineAndCosineGraphicalRepresentation.png)

```java
import femto.mode.HiRes16Color;
import femto.input.Button;
import femto.font.TIC80;
import femto.palette.Pico8;
import Math;

public class Main {

    public static void main(String[] args) {
        HiRes16Color screen = new HiRes16Color(Pico8.palette(), TIC80.font());

        int centerX = screen.width() / 2;
        int centerY = screen.height() / 2;
        float angle = 0;
        float angleInc = Math.PI / 360.0;
        float radious = 50;
        float pointX, pointY, sinVal, cosVal = 0;
        boolean pause = false;

        while (true) {

            if (Button.A.isPressed()) angle = 0;
            pause = Button.B.isPressed();

            sinVal = Math.sin(angle);
            cosVal = Math.cos(angle);

            screen.clear(0);
            screen.setTextColor(5);
            screen.setTextPosition(10, 10);
            screen.print("Angle Rad: " + angle);
            screen.setTextPosition(10, 20);
            screen.print("Angle Deg: " + (angle * 180.0) / Math.PI);

            screen.setTextColor(12);
            screen.setTextPosition(10, 155);
            screen.print("Sin: " + sinVal);
            screen.setTextColor(9);
            screen.setTextPosition(10, 165);
            screen.print("Cos: " + cosVal);

            screen.setTextColor(3);
            screen.setTextPosition(120, 155);
            screen.print("A reset angle");
            screen.setTextPosition(120, 165);
            screen.print("B pause angle");

            pointX = centerX + (radious * cosVal);
            pointY = centerY + (radious * sinVal);

            //Circumference
            screen.drawCircle(centerX, centerY, radious, 5, false);

            //Sin values
            screen.drawLine(pointX, centerY, pointX, pointY, 12, false);
            screen.drawLine(centerX, centerY, pointX, centerY, 9, false);

            //Cos values
            screen.drawLine(centerX, pointY, pointX, pointY, 9, false);
            screen.drawLine(centerX, centerY, centerX, pointY, 12, false);

            //Center to point
            screen.drawLine(centerX, centerY, pointX, pointY, 4, false);

            //Point
            screen.fillCircle(pointX, pointY, 2, 3, false);

            if (!pause)
                angle += angleInc;
            screen.flush();
        }
    }
}
```