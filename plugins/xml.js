APP.addPlugin("XML", ["Text"], TextView => {
    const extensions = ["XML", "TMX", "HTML", "SVG", "HTM"];
    
    class XMLView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/xml");
        }
    }
    
    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = XMLView;
                vf.priority = 1;
            }
            
        }
        
    });

    return XMLView;
});
