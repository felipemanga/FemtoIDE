package femto.sound;

public class Procedural {
    public uint t;
    public char channel;

    public void play(){ Mixer.setChannel(channel, this); }

    public void reset(){ t = 0; }

    public byte update(){ return 0; }
}
