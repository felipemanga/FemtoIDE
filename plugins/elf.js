APP.addPlugin("Elf", [], _ => {

    const config = {
		type: 'doughnut',
		data: {
		    datasets: [
                        {
			    data: [
			    ],
			    backgroundColor: [
                                "#1a1c2c",
                                "#5d275d",
                                "#b13e53",
                                "#ef7d57",
                                "#ffcd75",
                                "#a7f070",
                                "#38b764",
                                "#257179",
                                "#29366f",
                                "#3b5dc9",
                                "#41a6f6",
                                "#73eff7",
                                "#f4f4f4",
                                "#94b0c2",
                                "#566c86",
                                "#333c57"
			    ]
		        },
                    ],
		    labels: [
		    ]
		},
		options: {
		    responsive: true,
		    legend: {
			position: 'top',
		    },
		    title: {
			display: false
		    },
		    animation: {
			animateScale: true,
			animateRotate: true
		    }
		}
    };
    
    class ElfView {

        NM(max=10){
            let ok, nok;
            let ret = new Promise((_ok, _nok)=>{ok = _ok; nok = _nok;});

            let execPath;
            if( ("NM-" + DATA.project.target) in DATA ){
                execPath = DATA[
                    "NM-" + DATA.project.target
                ] + DATA.executableExt;
            } else {
                execPath = DATA[
                    "GDB-" + DATA.project.target
                ].replace(/gdb$/, "nm") + DATA.executableExt;
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

            flags = [this.buffer.path]; // flags.filter(f=>/\.elf$/i.test(f));

            let flash = [], ram = [];
            let acc = "";
            APP.spawn(execPath, "--print-size", "--size-sort", "-r", "-C", ...flags)
                .on("data-out", str=>{
                    acc += str;
                })
                .on("data-err", err=>{
                    APP.error(err);
                })
                .on("close", _=>{
                    (acc+"")
                        .trim()
                        .split("\n")
                        .forEach((l, i)=>{
                            let match = l.match(/([0-9a-f]+)\s+([0-9a-f]+)\s+([a-z])\s+([^\s]+)/i);
                            if( !match ) return;

                            let [, address, size, type, name] = match;

                            address = parseInt(address, 16);
                            size = parseInt(size, 16);

                            let container = flash;
                            if( "AaBbCcDdGg".indexOf(type) != -1 )
                                container = ram;

                            if( container.length > max ){
                                container[max].name = "<Other>";
                                container[max].size += size;
                            }else{
                                container.push({ size, name });
                            }

                        });

                    ok({flash, ram});
                });
            
            return ret;
        }

        attach(){
            this.NM(16)
                .then(({flash, ram})=>{
                    this._update(flash, this.flashConfig, this.flashChart);
                    this._update(ram, this.ramConfig, this.ramChart);
                });
        }

        _update(data, config, chart){
            const outData = config.data.datasets[0].data;
            const outLabels = config.data.labels;
            outData.length = 0;
            outLabels.length = 0;
            data.forEach(({size, name})=>{
                outData.push(size);
                outLabels.push(name);
            });
            chart.update();
        }

        constructor( frame, buffer ){

            this.flashConfig = JSON.parse(JSON.stringify(config));
            this.ramConfig = JSON.parse(JSON.stringify(config));

            const spanStyle = {
                flexGrow: 1,
                textAlign: "center"
            };
                
            this.el = DOC.create( frame, "div", {
                style:{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                }
            }, [

                ["div", {
                    style:{
                        display:"flex",
                        flexDirection: "row",
                        flexGrow: 0,
                        fontSize:"3em"
                    }
                }, [
                    
                    ["span", {
                        text:"Flash",
                        id:"flashLabel",
                        style:spanStyle,
                        onclick:_=>{
                            this.DOM.flash.style.display = "block";
                            this.DOM.ram.style.display = "none";
                            this.DOM.flashLabel.style.opacity = 1;
                            this.DOM.ramLabel.style.opacity = 0.2;
                        }
                    }],

                    ["span", {
                        text:"RAM",
                        id:"ramLabel",
                        style:Object.assign(
                            {opacity:0.2},
                            spanStyle
                        ),
                        onclick:_=>{
                            this.DOM.ram.style.display = "block";
                            this.DOM.flash.style.display = "none";
                            this.DOM.ramLabel.style.opacity = 1;
                            this.DOM.flashLabel.style.opacity = 0.2;
                        }
                    }]

                ]],

                ["div", {style:{position:"relative", flexGrow:1}}, [
                    ["div", {
                        style:{
                            position:"absolute",
                            width:"100%",
                            height:"100%"
                        }
                    }, [
                        ["canvas", {id:"flash", width:"100%", height:"100%"}],
                
                        ["canvas", {id:"ram", width:"100%", height:"100%"}]
                    ]]
                ]]
                
            ]);

            this.DOM = DOC.index(this.el);

            this.buffer = buffer;

            this.flashCtx = this.DOM.flash.getContext("2d");
            this.flashChart = new Chart(this.flashCtx, this.flashConfig);
            this.ramCtx = this.DOM.ram.getContext("2d");
            this.ramChart = new Chart(this.ramCtx, this.ramConfig);

            this.attach();
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( buffer.type == "ELF" && vf.priority < 2 ){
                vf.view = ElfView;
                vf.priority = 2;
            }
            
        }
        
    });

    return ElfView;
});
