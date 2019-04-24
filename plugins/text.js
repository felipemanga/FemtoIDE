APP.addPlugin("Text", ["Project"], _=>{
    
    let textViewInstance = 0;
    let killRing = [];
    let yankRange;

    class TextView {

        attach(){
            APP.add(this);
        }

        detach(){
            APP.remove(this);
        }

        onCommandStarted(){
            this.ace.setReadOnly(true);
        }

        onCommandEnded(){
            this.ace.setReadOnly(false);
        }

        yank(){
            if( !killRing.length ) return;
            let start = this.ace.getCursorPosition();
            
            this.ace.session.insert(
                start,
                killRing[killRing.length-1]
            );

            let end = this.ace.getCursorPosition();
            yankRange = new ace.Range(
                start.row, start.column,
                end.row, end.column
            );

        }

        yankPop(){
            if( killRing.length < 2 || !yankRange ) return;
            killRing.pop();
            this.ace.session.replace( yankRange, killRing[killRing.length-1] );

            let end = this.ace.getCursorPosition();
            yankRange = new ace.Range(
                yankRange.start.row, yankRange.start.column,
                end.row, end.column
            );
        }

        killRingSave(){
            let range = this.ace.selection.getRange();
            let text = this.ace.session.getTextRange( range );
            killRing.push(text);
        }

        killRegion(){
            let range = this.ace.selection.getRange();
            let text = this.ace.session.getTextRange( range );
            this.ace.session.replace( range, "" );
            killRing.push(text);
        }

        constructor( frame, buffer ){
            
            let id = "text_" + (textViewInstance++);
            this.DOM = DOC.create( frame, "div", {
                id,
                className: "IDE"
            });
            
            this.ace = ace.edit( id );
            this.ace.setTheme( DATA.aceTheme || "ace/theme/kuroir" );

            APP.onCreateACE( this.ace );
            
            APP.readBuffer( buffer, "utf-8", (err, data) => {
                let session = this.ace.session;
                let hnd;
                buffer.data = session;
                buffer.transform = "transformSessionToString";

                session.setUndoManager( new ace.UndoManager() );
                session.setValue( data );
                session.on("change", _=>{
                    buffer.modified = true;
                    if( hnd ) clearTimeout( hnd );
                    hnd = setTimeout( save, 1000 );
                });

                function save(){
                    hnd = 0;
                    APP.writeBuffer( buffer );
                }
            });

        }

    };

    APP.add({

        transformSessionToString( session ){
            return session.getValue();
        },
        
        pollViewForBuffer( buffer, vf ){
            
            if( vf.priority < 0 ){
                vf.view = TextView;
                vf.priority = 0;
            }
            
        }
        
    });

    return TextView;

});
