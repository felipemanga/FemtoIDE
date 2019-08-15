package femto.sound;

/// Represents a playable sound.
public class Procedural {
    /// The index into the sound data.
    public uint t = 0;

    /// The channel this sound will play on.
    public char channel = 0;

    /// Constructs a `Procedural` on channel 0.
    public Procedural(){}

    /// Constructs a `Procedural` on the specified channel.
    public Procedural(char channel){
        this.channel = channel;
    }

    /// Plays the sound by assigning it to play on `channel`.
    public void play(){
        Mixer.setChannel(channel, this);
    }

    /// Resets the sound data index.
    public void reset(){
        t = 0;
    }

    /// Retrieves the next byte of sound data.
    public ubyte update(){
        return 0;
    }
}
