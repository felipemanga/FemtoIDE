let buffer = new Buffer();
buffer.name = "*init*";

APP.add({

    queryMenus(){
        APP.addMenu("File", {
            "Open Project":"openProject"
        });
    },

    openProject(...args){
        if( !args.length ) 
            APP.displayBuffer( buffer );
    },
    
    pollViewForBuffer( buffer, vf ){

        if( buffer.name == "*init*" ){
            vf.view = ProjectsListView;
            vf.priority = 999;
        }
        
    }
    
});

class ProjectsListView {

    constructor( frame, buffer ){
        this.css = "blocking InitView";
        
        let projectsList;

        try{
            projectsList = fs
                .readdirSync(DATA.projectsPath)
                .filter( item => {
                    try{
                        return fs
                            .lstatSync(DATA.projectsPath + path.sep + item)
                            .isDirectory();
                    }catch(ex){
                        return false;
                    }
                });
        }catch(ex){
            projectsList = [];
        }

        DOC.create("h1", {text:"FemtoIDE"}, frame);

        DOC.create(
            frame,
            "ul",
            {className:"initProjectList"},
            [
                
                [ "li", {
                    text: "[New Project...]",
                    className:"initProjectListNewProject",
                    onclick: _=>APP.newProject()
                }],
                
                ...projectsList.map( project => [
                    "li",
                    {
                        text: project,
                        onclick: _=>APP.openProject(DATA.projectsPath + path.sep + project)
                    }
                ])
                
            ]
        );
    }
}

APP.displayBuffer( buffer );
