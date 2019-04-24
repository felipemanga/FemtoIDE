module.exports = `
package femto;

import mode.HiRes16Color;

public class Sprite extends Object implements __stub__ {
	public float x, y;
	public uint currentFrame, startFrame, endFrame, frameTime;
	public boolean flip, mirror;

	Sprite(){
		x = y = 0;
		currentFrame = startFrame = endFrame = frameTime = 0;
		flip = mirror = false;
	}

void draw( HiRes16Color screen ){
	updateAnimation();
__inline_cpp__("const up_femto::uc_FrameRef &f = *(const up_femto::uc_FrameRef*)getFrameDataForScreen(currentFrame, screen);\n__blit_4bpp( f.frame, x.getInteger() + f.offsetX, y.getInteger() + f.offsetY, &screen->buffer->access(0) )");
}

	pointer getFrameDataForScreen( uint number, HiRes16Color screen ){
while(true);
		return 0;
		new FrameRef(); // dummy type ref
	}


	void updateAnimation(){
		if( startFrame != endFrame ){

			uint now = System.currentTimeMillis();
			int delta = now - frameTime;
			pointer frameData;

			while( __inline_cpp__("((up_femto::uc_FrameRef*)(frameData=getFrameDataForScreen(currentFrame, (up_femto::up_mode::uc_HiRes16Color*)nullptr)))->duration") < delta ){
				currentFrame++;
				delta -= __inline_cpp__("((up_femto::uc_FrameRef*)frameData)->duration");

				if( currentFrame > endFrame )
					currentFrame = startFrame;

				frameTime = now - delta;
			}
		}

	}

	protected void __blit_4bpp( pointer src, int x, int y, pointer out ){}
}

`;
