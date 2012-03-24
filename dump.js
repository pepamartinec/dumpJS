/**
 * DumpJS
 * 
 * @singleton
 * @class DumpJS
 */
DumpJS = {};

(function() {
	
	var types = DumpJS.types = {},
	    popup = null;
	
	function findType( value )
	{
		var name = null;
		
		for( name in types ) {
			if( types.hasOwnProperty( name ) === false ) {
				continue;
			}
			
			if( types[ name ].check( value ) ) {
				return name;
			}
		}
		
		throw 'Unknown type variable';
	}
	
	/**
	 * Dumps supplied variable
	 * 
	 * @param {Mixed} variable
	 * @return {HTMLElement}
	 */
	DumpJS.dump = function dump( variable )
	{
		var type = types[ findType( variable ) ],
		    dump = type.dump( variable ),
		    wrap = document.createElement( 'div' );
		
		wrap.className = 'var-dump';
		wrap.appendChild( dump );
		
		return wrap;
	};
	
	/**
	 * Shows variable dump popup
	 * 
	 * @param {Array} position
	 * @param {Mixed} variable
	 * @return {HTMLElement}
	 */
	DumpJS.popup = function ( position, variable )
	{
		if( popup === null ) {
			popup = new Popup();
		}
		
		var type = types[ findType( variable ) ],
		    dump = type.dump( variable );
		
		popup.setDump( dump );
		popup.showAt( position );
	};
	
	/**
	 * Data type class
	 * 
	 * @class DumpJS.Type
	 */
	var Type = DumpJS.Type = function( name, config ) {
		this.name = name;
		
		for( k in config ) {
			if( config.hasOwnProperty( k ) === false ) {
				continue;
			}
			
			this[ k ] = config[ k ];
		}
		
		this.value = function( v ) {
			return '<span class="'+ name +'">'+ config.value.call( this, v ) +'</span>';
		};
		
		if( this.dump == null ) {
			this.dump = this.value;
		}
		
		types[ this.name ] = this;
	};
	
	Type.prototype = {
		/**
		 * Ckecks whether supplied value type matches this
		 * 
		 * @param {Mixed} value
		 * @return {boolean}
		 */
		check : null,
		
		/**
		 * Converts value to its string representation
		 * 
		 * @param {Mixed} value
		 * @return {string}
		 */
		value : null,
		
		/**
		 * Creates value dump
		 * 
		 * @param {Mixed} value
		 * @return {HTMLElement}
		 */
		dump  : null,
		
		/**
		 * Dumps content of 'container' value (e.g. Object and Array)
		 * 
		 * @param {Mixed} value
		 * @return {HTMLElement}
		 */
		dumpContent : null,
		
		dumpEnumerableContent : function( name, item ) {
			var type = types[ findType( item ) ],
			    li   = document.createElement( 'li' );
			
			if( type.dumpContent ) {
				var bullet = document.createElement( 'div' );
				bullet.className = 'bullet';
				li.appendChild( bullet );
				
				li.className = 'collapsed';
				
				
				li.addEventListener( 'click', function() {
					var detailEl = li.nextSibling;
					
					if( detailEl == null || detailEl.nodeName !== 'OL' ) {
						detailEl = type.dumpContent( item );
						
						li.parentNode.insertBefore( detailEl, li.nextSibling );
					}
		
					if( /collapsed/.test( li.className ) === true ) {
						li.className = 'expanded';
						detailEl.style.display = 'block';
						
					} else {
						li.className = 'collapsed';
						detailEl.style.display = 'none';
					}
				});
			}
			
			span = document.createElement( 'span' );
			span.className   = 'name';
			span.textContent = name;
			li.appendChild( span );
			
			span = document.createElement( 'span' );
			span.className   = 'separator';
			span.textContent = ': ';
			li.appendChild( span );
			
			span = document.createElement( 'span' );
			span.className = 'value';
			span.innerHTML = type.value( item );
			li.appendChild( span );
			
			return li;
		}
	};
	
	/**
	 * Popup class
	 * 
	 * @class DumpJS.Popup
	 */
	var Popup = DumpJS.Popup = function() {
		var div = this.div = document.createElement( 'div' );
		
		div.className = 'var-dump popup';
		div.addEventListener( 'mousedown', function( e ) {
			e.stopPropagation();
		});
		
		var me = this;
		this.blurCheck = function( e )
		{
			me.dispose();
			document.body.removeEventListener( 'mousedown', me.blurCheck );
		};
	};
	
	Popup.prototype = {
		setDump : function( dump )
		{
			var div = this.div;
			
			div.innerHTML = '';
			div.appendChild( dump );
		},
		
		showAt : function( pos )
		{
			var div    = this.div,
			    vpSize = this.viewportSize(),
			    left   = pos[0] - 30,
			    bottom = vpSize[1] - pos[1] + 15;
			
			div.setAttribute( 'style', 'bottom:'+ bottom +'px; left:'+ left +'px' );
			document.body.appendChild( div );
			document.body.addEventListener( 'mousedown', this.blurCheck );
		},
		
		dispose : function()
		{
			this.div.parentNode.removeChild( this.div );
		},
		
		viewportSize : function()
		{
			var e = window,
			    a = 'inner';
			
			if( !( 'innerWidth' in window ) ) {
				a = 'client';
				e = document.documentElement || document.body;
			}
			
			return [ e[ a+'Width' ], e[ a+'Height' ] ];
		}
	};

	
	// ****** REGISTER DATA TYPES ****** //
	
	/**
	 * Javascript Array
	 * 
	 * @class DumpJS.types.Array
	 * @extends DumpJS.Type
	 */
	new Type( 'Array', {
		check : function( v ) {
			return toString.call( v ) === '[object Array]';
		},
		
		value : function( v ) {
			return 'Array['+ v.length +']';
		},
		
		dump : function( obj ) {
			return this.dumpContent( obj );
		},
		
		dumpContent : function( obj ) {
			var ol = document.createElement( 'ol' );
			
			for( var i = 0, len = obj.length; i < len; ++i ) {				
				ol.appendChild( this.dumpEnumerableContent( i, obj[ i ] ) );
			}
			
			if( ol.childNodes.length === 0 ) {
				var span = document.createElement( 'span' );
				span.className   = 'empty';
				span.textContent = 'empty';
				
				ol.appendChild( span );
			}
			
			return ol;
		}
	});
	
	/**
	 * Javascript Object
	 * 
	 * @class DumpJS.types.Object
	 * @extends DumpJS.Type
	 */
	new Type( 'Object', {
		check : function( v ) {
			return v === Object( v );
		},
		
		value : function( v ) {
			return 'Object';
		},
		
		dump : function( obj ) {
			return this.dumpContent( obj );
		},
		
		dumpContent : function( obj ) {
			var ol = document.createElement( 'ol' ),
			    k  = null;
			
			for( k in obj ) {
				if( obj.hasOwnProperty( k ) === false ) {
					continue;
				}
				
				ol.appendChild( this.dumpEnumerableContent( k, obj[ k ] ) );
			}
			
			if( ol.childNodes.length === 0 ) {
				var span = document.createElement( 'span' );
				span.className   = 'empty';
				span.textContent = 'empty';
				
				ol.appendChild( span );
			}
			
			return ol;
		}
	});
	
	/**
	 * Javascript Function
	 * 
	 * @class DumpJS.types.Function
	 * @extends DumpJS.Type
	 */
	new Type( 'Function', {
		check : function( v ) {
			return toString.call( v ) === '[object Function]';
		},
		
		value : function( v ) {
			return '[object Function]';
		}
	});
	
	/**
	 * Javascript String object or string primitive
	 * 
	 * @class DumpJS.types.String
	 * @extends DumpJS.Type
	 */
	new Type( 'String', {
		check : function( v ) {
			return toString.call( v ) === '[object String]';
		},
		
		value : function( v ) {
			return '"'+ v + '"';
		}
	});

	/**
	 * Javascript Number object or number primitive
	 * 
	 * @class DumpJS.types.Number
	 * @extends DumpJS.Type
	 */
	new Type( 'Number', {
		check : function( v ) {
			return toString.call( v ) === '[object Number]';
		},
		
		value : function( v ) {
			return v;
		}
	});

	/**
	 * Javascript Boolean object or booean primitive
	 * 
	 * @class DumpJS.types.Boolean
	 * @extends DumpJS.Type
	 */
	new Type( 'Boolean', {
		check : function( v ) {
			return v === true || v === false || toString.call( v ) === '[object Boolean]';
		},
		
		value : function( v ) {
			return v ? 'true' : 'true';
		}
	});

	/**
	 * Javascript Date object
	 * 
	 * @class DumpJS.types.Date
	 * @extends DumpJS.Type
	 */
	new Type( 'Date', {
		check : function( v ) {
			return toString.call( v ) === '[object Date]';
		},
		
		value : function( v ) {
			return v;
		}
	});

	/**
	 * Javascript Regexp (regular expression) object
	 * 
	 * @class DumpJS.types.Regexp
	 * @extends DumpJS.Type
	 */
	new Type( 'Regexp', {
		check : function( v ) {
			return toString.call( v ) == '[object RegExp]';
		},
		
		value : function( v ) {
			return v;
		}
	});

	/**
	 * Javascript null
	 * 
	 * @class DumpJS.types.Null
	 * @extends DumpJS.Type
	 */
	new Type( 'Null', {
		check : function( v ) {
			return v === null;
		},
		
		value : function( v ) {
			return 'null';
		}
	});

	/**
	 * Javascript undefined
	 * 
	 * @class DumpJS.types.Undefined
	 * @extends DumpJS.Type
	 */
	new Type( 'Undefined', {
		check : function( v ) {
			return v === undefined;
		},
		
		value : function( v ) {
			return 'undefined';
		}
	});
})();