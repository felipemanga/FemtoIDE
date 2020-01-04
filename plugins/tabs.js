APP.addPlugin("Tabs", [], _=>{
    if( DATA.enableTabs === false ){
        return;
    }

    const contents = document.querySelector("#contents");
    let nextAge = 1;
    let container;
    let tabs = [];

    class Tab {
        constructor(parent){
            APP.add(this);
            this.count = 0;
            this.age = 0;
            this.buffer = null;
            this.DOM = DOC.index(DOC.create("div", parent, {className:"Tab"}, [
                ["div", {
                    className:"TabLabel",
                    onclick: evt=>{
                        this.activate(evt.ctrlKey);
                    }
                }],
                ["div", {
                    className:"TabClose",
                    onclick: _=>this._close(),
                    html:"&#8999;"
                }]
            ]));
            this.el = this.DOM.TabLabel[0];
            this.root = this.DOM.__ROOT__;
            this.hide();
        }

        _close(){
            if(!this.buffer)
                return;
            
            this.buffer.views.forEach(v=>{
                if( v.frame != null )
                    APP.closeFrame(v.view);
            });

            this.setBuffer(null);
        }

        onOpenProject(){
            this.hide();
        }

        onKillBuffer(buffer){
            if( buffer != this.buffer )
                return;
            this.buffer = null;
            this.age = 0;
            this.hide();
        }

        updateCount(inc){
            this.count += inc;

            if( this.count <= 0 ){

                this.blur();
                this.count = 0;

            }else{

                this.focus();

            }
        }

        onAttachView( view ){
            if( this.buffer && this.buffer.views.find(v=>v.view == view) )
                this.updateCount(1);
        }

        onDetachView( view ){
            if( this.buffer && this.buffer.views.find(v=>v.view == view) )
                this.updateCount(-1);
        }

        activate(useAltView){
            if( !this.buffer )
                return;
            if( !useAltView )
                APP.displayBuffer(this.buffer);
            else
                APP.displayBufferInRightFrame(this.buffer);
        }

        setBuffer(buffer){
            this.buffer = buffer;
            if( buffer ){
                let name = (buffer.name||"") + "";
                if( name.length > 16 ){
                    name = name.substr(0, 3) + '...' + name.substr(name.length-6);
                }
                this.el.textContent = name;
                this.show();
                this.count = 0;
                this.updateCount(1);
            }else{
                this.hide();
            }
        }

        hide(){
            this.root.classList.add("hidden");
        }

        show(){
            this.root.classList.remove("hidden");
        }

        focus(){
            this.root.classList.add("focus");
            this.age = nextAge++;
        }

        blur(){
            this.root.classList.remove("focus");
        }
    }

    APP.add(new class Tabs {
        
        displayBufferInFrame(buffer, frame){
            if( !buffer || !buffer.path )
                return;

            if( !container ){
                const parent = contents.parentElement;
                container = DOC.create("div", {
                    className:"TabBar",
                    before:contents
                });
                for( let i=0; i<10; ++i ){
                    tabs.push(new Tab(container));
                }
            }

            let oldest = tabs[0];
            for(let i=0; i<tabs.length; ++i){
                if( tabs[i].buffer == buffer )
                    return;
                if( tabs[i].age < oldest.age )
                    oldest = tabs[i];
            }
            oldest.setBuffer(buffer);
        }
    });
});
