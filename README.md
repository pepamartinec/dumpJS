dumpJS - In-page variables dumping for JavaScript 
=================================================

dumpJS allows you to dump variables content right into web-page content
so it's much easier write your own debugging and inspecting tools.

Sample usage:

    var myVar = {
        a : 1,
        b : 'some string'
        c : {
            x : [ 123, 456 ]
        }
    };
    
    document.body.appendChild( dump( myVar ) );
    
All funcionality is hidden within `dump` function, which takes one
argument - the variable you want to dump and returns `HTMLElement`
element containing formated dump.
