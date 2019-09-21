APP.addPlugin("Profiler", [], _=>{
    let buffer, socket, pos;
    
    class ProfilerView {
        constructor( frame, buffer ){
            APP.add(this);

            let container = this.container = DOC.create("div", {
                className:"ProfilerContainer"
            }, frame);

            this.list = DOC.create(
                "ul",
                {className:"LineList"},
                container
            );

            this.root = null;
            this.stale = true;
            APP.async(_=>this.onGetProfilingSample(buffer.data));
            this._update();
        }

        _update(){
            if( !socket )
                return;
            setTimeout(this._update.bind(this), 1000);
            APP.requestProfilingSample();
        }

        onGetProfilingSample(data){
            APP.onResize();
            let ops = new Uint32Array(data.buffer);
            let samples = [];
            let sum = 0, sumc = 0;
            for( let i=0; i<ops.length; ++i ){
                if( ops[i] ){
                    sum += ops[i];
                    sumc++;
                    samples.push({addr:i, hits:ops[i]});
                }
            }

            let out = '';
            let avg = sum / sumc;
            samples = samples
                .sort((a, b)=>{
                    return b.hits - a.hits;
                });
            if( samples.length > 1000 )
                samples.length = 1000;

            sum = 0;
            for( let i=0; i<samples.length; ++i )
                sum += samples[i].hits;

            let execPath;
            if( ("ADDR2LINE-" + DATA.project.target) in DATA ){
                execPath = DATA[
                    "ADDR2LINE-" + DATA.project.target
                ] + DATA.executableExt;
            } else {
                execPath = DATA[
                    "GDB-" + DATA.project.target
                ].replace(/gdb$/, "addr2line") + DATA.executableExt;
            }

            let flags = [];

            let typeFlags = DATA.project["GDBFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
                if( typeFlags[DATA.releaseMode] )
                    flags.push( ...typeFlags[DATA.buildMode] );
            }

            flags = flags.filter(f=>/\.elf$/i.test(f));
            
            let acc = "";
            APP.spawn(execPath, "-f", "-C", "-e", ...flags, ...samples.map(m=>(m.addr*2).toString(16)))
                .on("data-out", str=>{
                    acc += str;
                })
                .on("data-err", err=>{
                    APP.error(err);
                })
                .on("close", _=>{
                    (acc+"")
                        .trim()
                        .split("\n").forEach((l, i)=>{
                            if(i&1) return;
                            i >>= 1;
                            if( !samples[i] )
                                return;
                            l = APP.demangle(l.trim()).replace(/\(.*/, "");
                            samples[i].label = l;
                        });
                    renderSamples.call(this, samples);
                });

            function renderSamples(samples){
                let sampleIndex = {};
                for( let i=0; i<samples.length; ++i ){
                    let name = samples[i].label;
                    if(!name){
                        name = "0x" + (samples[i].addr*2).toString(16);
                    }else{
                        name = name.replace(/\s*\(discriminator [0-9]+\)$/, "");
                    }

                    samples[i].label = name;

                    if( name in sampleIndex ){
                        sampleIndex[name].hits += samples[i].hits;
                    }else{
                        sampleIndex[name] = samples[i];
                    }
                }

                Object.values(sampleIndex)
                    .sort((a, b)=>b.hits - a.hits)
                    .forEach((s, i)=>{
                        let percent = s.hits / sum;
                        let r = 0.5 + percent;
                        r = (r*r)*255|0;
                        if( r>255 ) r = 255;
                        
                        let g = 255 - r;
                        out += `<li style="background-color: rgb(${r},${g*0.5},0)">${(percent*1000|0)/10}% ${s.label || ("0x" + (s.addr*2).toString(16))}</li>`;
                    });
                this.list.innerHTML = out;
                this.container.parentElement.style.display = "block";
            }
        }

        onEmulatorStopped(){
            this.container.parentElement.style.display = "none";
            APP.onResize();
            this.stale = true;
        }

    }

    function close(){
	if( !socket ) return;
	try{
	    socket.end();
	}catch(ex){}
        socket = null;	
    }

    APP.add({

        runProfiler(){
            if( !APP.isEmulatorRunning() ){
                APP.run(["-x"]);
                setTimeout( _=>{
                    if( APP.isEmulatorRunning() ){
                        APP.onProfilingEmulatorStarted();
                    }
                }, 500);            
                return;
            }else{
                APP.onProfilingEmulatorStarted();
            }
        },

        requestProfilingSample(){
            pos = 0;
            if(socket)
                socket.write("P;");
        },

        onProfilingEmulatorStarted(){
            if( socket )
                close();

            setTimeout(_=>{
                let acc = new Uint32Array(256*1024>>1);
                let accb = new Uint8Array(acc.buffer);
                
                let net = require("net");
                socket = net.connect(2000, "localhost");

                socket.on("close", _=>{
                    close();
                });

                socket.on("data", data=>{
                    accb.set(data, pos);
                    pos += data.length;
                    if( pos >= accb.length ){
                        APP.onGetProfilingSample(accb);
                        pos = 0;
                    }
                });
                
                socket.write("p;");

                setTimeout(_=>{
                    APP.requestProfilingSample();
                }, 1000);
            });
            
        },

        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*Profiler View*" ){
                vf.view = ProfilerView;
                vf.priority = 999;
            }
            
        },

        onGetProfilingSample(data){
            
            if( !buffer ){
                buffer = new Buffer();
                buffer.name = "*Profiler View*";
                buffer.data = data;
                APP.displayBufferInRightFrame(buffer);            
            }

        },

        queryMenus(){
            APP.addMenu("Debug", {
                "CPU Profiler":"runProfiler"
            });
        }

    });

});
