package femto;

public class XMLNode {
    String tag;
    StringPair[] attributes;
    XMLNode[] children;
    String value;

    XMLNode( String tag, StringPair[] attributes, XMLNode[] children, String value ){
        this.tag = tag;
        this.attributes = attributes;
        this.children = children;
        this.value = value;
    }
}
