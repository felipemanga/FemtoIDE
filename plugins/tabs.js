APP.addPlugin("Tabs", [], _=>{
    if( !DATA.enableTabs ){
        return;
    }

    const contents = document.querySelector("#contents");
    let nextAge = 1;
    let container;
    let tabs = [];

    class Tab {
        constructor(parent){
            APP.add(this);
            this.age = 0;
            this.buffer = null;
            this.DOM = DOC.index(DOC.create("div", parent, {className:"Tab"}, [
                ["div", {
                    className:"TabLabel",
                    onclick: _=>this.activate()
                }],
                ["div", {
                    className:"TabClose",
                    onclick: _=>this.setBuffer(null),
                    html:"&#8999;"
                }]
            ]));
            this.el = this.DOM.TabLabel[0];
            this.root = this.DOM.__ROOT__;
            this.hide();
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

        onDisplayBuffer( buffer ){
            if( buffer == this.buffer ){
                this.focus();
            }else{
                this.blur();
            }
        }

        activate(){
            if( !this.buffer )
                return;
            APP.displayBuffer(this.buffer);
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
