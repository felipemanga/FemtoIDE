package femto;

public class State {
    /// `preinit` is called on the new state, before shutdown is called in the old state. This is only useful when you need to get some information from the old state.
    public void preinit(){}

    /// `init` is called when entering a state. Here, you can create objects knowing that the old state has cleaned up after itself.
    public void init(){}

    /// `update` is called every frame. This is the heartbeat, or "tick", of the game.
    public void update(){}

    /// `shutdown` is called when leaving a state. This can be used to free up memory by setting variables to null, leaving more memory available for the next state.
    public void shutdown(){}

    /// `resume` is called when returning from the Reset-button Menu. It can be used to trigger a full redraw in Direct mode games.
    public void resume(){}
}
