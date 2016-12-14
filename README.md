# KeyCenter

(c) 2016 Philip Kuperberg  
github.com/lostclawz/keycenter  
Javascript keyboard shortcut management system. Uses a single top-level listener for all keyboard events.  


## Setup

Babel requirements:  

	*	transform-class-properties  
	*	transform-object-rest-spread  
	*	transform-es2015-destructuring  


## keyCenter.addListener  
Registers a keystroke listener on a specific key.  
For a react component, this is usually called on componentDidMount:  
  
		this.keyListeners = [];
		this.keyListeners.push(
			KeyCenter.addListener("n", () => {
				// action
			}, ['ctrlKey'])
		);

@param  {string}   	key             		The key to watch for, matches to e.key  
@param  {function} 	callback        		Callback to fire when key is pressed  
@param  {array}   	modifiers       		An array of modifier strings, can be: 'altKey', 'ctrlKey', 'shiftKey', 'metaKey'  
@param  {Boolean}  	preventDefault  		Prevent default functionality (optional)  
@param  {Boolean}  	stopPropagation 		Stop keystroke from bubbling up (optional)  
@return {integer}                   		the ID of the listener (to use when removing the listener)  
  

## keyCenter.removeListener
Remove a keystroke listener by ID.  
In a React component, this should be called in componentWillUnmount:  
   
	   this.keyListeners.forEach((id) => {
		   KeyCenter.removeListener(id);
	   });
	   this.keyListeners = [];
	
 @param  {integer}   	id       	The ID of the keystroke listener (returned from addListener)  
 @return {boolean}            		Whether listener has been successfully removed  
