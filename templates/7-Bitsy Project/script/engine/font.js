/*
TODO:
- can I simplify this more now that I've removed the external resources stuff?
*/

function FontManager(packagedFontNames) {

var self = this;

var fontExtension = ".bitsyfont";
this.GetExtension = function() {
	return fontExtension;
}

// place to store font data
var fontResources = {};

// load fonts from the editor
if (packagedFontNames != undefined && packagedFontNames != null && packagedFontNames.length > 0
		&& Resources != undefined && Resources != null) {

	for (var i = 0; i < packagedFontNames.length; i++) {
		var filename = packagedFontNames[i];
		fontResources[filename] = Resources[filename];
	}
}

// manually add resource
this.AddResource = function(filename, fontdata) {
	fontResources[filename] = fontdata;
}

this.ContainsResource = function(filename) {
	return fontResources[filename] != null;
}

function GetData(fontName) {
	return fontResources[fontName + fontExtension];
}
this.GetData = GetData;

function Create(fontData) {
	return new Font(fontData);
}
this.Create = Create;

this.Get = function(fontName) {
	var fontData = self.GetData(fontName);
	return self.Create(fontData);
}

function Font(fontData) {
	var name = "unknown";
	var width = 6; // default size so if you have NO font or an invalid font it displays boxes
	var height = 8;
	var chardata = {};
	var invalidCharData = {};

	this.getName = function() {
		return name;
	}

	this.getData = function() {
		return chardata;
	}

	this.getWidth = function() {
		return width;
	}

	this.getHeight = function() {
		return height;
	}

	this.hasChar = function(char) {
		var codepoint = char.charCodeAt(0);
		return chardata[codepoint] != null;
	}

	this.getChar = function(char) {

		var codepoint = char.charCodeAt(0);

		if (chardata[codepoint] != null) {
			return chardata[codepoint];
		}
		else {
			return invalidCharData;
		}
	}

	this.allCharCodes = function() {
		var codeList = [];
		for (var code in chardata) {
			codeList.push(code);
		}
		return codeList;
	}

	function parseFont(fontData) {
		if (fontData == null)
			return;

		var lines = fontData.split("\n");

		var isReadingChar = false;
		var isReadingCharProperties = false;
		var curCharLineCount = 0;
		var curCharCode = 0;

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			if (line[0] === "#") {
				continue; // skip comment lines
			}

			if (!isReadingChar) {
				// READING NON CHARACTER DATA LINE
				var args = line.split(" ");
				if (args[0] == "FONT") {
					name = args[1];
				}
				else if (args[0] == "SIZE") {
					width = parseInt(args[1]);
					height = parseInt(args[2]);
				}
				else if (args[0] == "CHAR") {
					isReadingChar = true;
					isReadingCharProperties = true;

					curCharLineCount = 0;
					curCharCode = parseInt(args[1]);
					chardata[curCharCode] = { 
						width: width,
						height: height,
						offset: {
							x: 0,
							y: 0
						},
						spacing: width,
						data: []
					};
				}
			}
			else {
				// CHAR PROPERTIES
				if (isReadingCharProperties) {
					var args = line.split(" ");
					if (args[0].indexOf("CHAR_") == 0) { // Sub-properties start with "CHAR_"
						if (args[0] == "CHAR_SIZE") {
							// Custom character size - overrides the default character size for the font
							chardata[curCharCode].width = parseInt(args[1]);
							chardata[curCharCode].height = parseInt(args[2]);
							chardata[curCharCode].spacing = parseInt(args[1]); // HACK : assumes CHAR_SIZE is always declared first
						}
						else if (args[0] == "CHAR_OFFSET") {
							// Character offset - shift the origin of the character on the X or Y axis
							chardata[curCharCode].offset.x = parseInt(args[1]);
							chardata[curCharCode].offset.y = parseInt(args[2]);
						}
						else if (args[0] == "CHAR_SPACING") {
							// Character spacing:
							// specify total horizontal space taken up by the character
							// lets chars take up more or less space on a line than its bitmap does
							chardata[curCharCode].spacing = parseInt(args[1]);
						}
					}
					else {
						isReadingCharProperties = false;
					}
				}

				// CHAR DATA
				if (!isReadingCharProperties) {
					// READING CHARACTER DATA LINE
					for (var j = 0; j < chardata[curCharCode].width; j++)
					{
						chardata[curCharCode].data.push( parseInt(line[j]) );
					}

					curCharLineCount++;
					if (curCharLineCount >= height) {
						isReadingChar = false;
					}
				}
			}
		}

		// init invalid character box
		invalidCharData = { 
			width: width,
			height: height,
			offset: {
				x: 0,
				y: 0
			},
			spacing: width, // TODO : name?
			data: []
		};
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				if (x < width-1 && y < height-1) {
					invalidCharData.data.push(1);
				}
				else {
					invalidCharData.data.push(0);
				}
			}
		}
	}

	parseFont(fontData);
}

} // FontManager