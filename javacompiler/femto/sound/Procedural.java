package femto.sound;

public class Procedural {
    public uint t = 0;
    public char channel = 0;

    public Procedural(){}
    
    public Procedural(char channel){
        this.channel = channel;
    }

    public void play(){ Mixer.setChannel(channel, this); }

    public void reset(){ t = 0; }

    public ubyte update(){ return 0; }
}
