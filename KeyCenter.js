/**
 * KeyCenter
 * (c) 2017 Philip Kuperberg
 * github.com/lostclawz/keycenter
 * 
 * Uses a single top-level event listener for all keyboard events.
 * Use the keyListeners decorator to attach to your component's life cycle:
 * 		@import keyListeners from './KeyCenter';
 *
 * 		@keyListeners
 * 		class myComponent extends Component{
 * 			constructor(props){
 *				super(props);
 *				props.addKeyListeners([
 *					{
 *						key: "Enter",
 *						modifiers: {ctrlKey: true},
 *						action: () => this.onSubmit()
 *					}
 *				]);
 *			}
 * 
 * 		}
 *
 */

import React, {Component} from 'react';

/**
 * Class representing a KeyCenter instance
 * 
 * @class
 */
export class KeyCenter{

	/**
	 * @constructor
	 * @param  {Boolean} logging Whether logging is on
	 */
	constructor(logging=true){

		// console logging toggle
		this.loggingOn = logging;
		
		// keys we're listening for
		this.listeningFor = {};
		
		// possible key modifiers
		this.modifierKeys = ['altKey', 'ctrlKey', 'shiftKey', 'metaKey'];
		
		// number of registered listeners (for listener ID)
		this.listenerCount = 0;

		this.keyDown = this.keyDown.bind(this);
		this.addListener = this.addListener.bind(this);
		this.removeListener = this.removeListener.bind(this);

		this.logging.bind(this);

		// global key listener
		document.addEventListener("keydown", this.keyDown, false);
	}

	/**
	 * Turns console messages on or off
	 * 
	 * @param  {boolean}	on 	whether console messages should be visible
	 */
	logging(on=true){
		this.loggingOn = on;
	}

	log = (...args) => {
		if (this.logging === true){
			console.log.apply(null, args);
		}
	}

	keyDown(e){
		this.log(e, e.key);
		if (e.key in this.listeningFor){
			let stopBubble = false;
			this.listeningFor[e.key].forEach((kInfo) => {
				let ignore = false;
				if (!stopBubble){
					this.modifierKeys.forEach((modType) => {
						if (kInfo[modType] !== null
							&& kInfo[modType] !== e[modType]){
							ignore = true;
						}
					});
					if (!ignore){
						if (kInfo.preventDefault){
							e.preventDefault();
						}
						if (kInfo.stopPropagation){
							e.stopPropagation();
							stopBubble = true;
						}
						if (typeof kInfo.callback === 'function'){
							kInfo.callback.call(null)
						}
					}
				}
			});
		}
	}

	/**
	 * Registers a keystroke listener on a specific key
	 * 
	 * @example
	 * // For a react component, this is usually called on componentDidMount:
	 *	 this.keyListeners = [];
	 *	 this.keyListeners.push(
	 *	 	keyCenter.addListener("n", () => {
	 *	 		// action
	 *	 	}, ['ctrlKey'])
	 *	 );
	 *
	 * 
	 * @param  {string}   	key             	The key to watch for, matches to e.key
	 * @param  {function} 	callback        	Callback to fire when key is pressed
	 * @param  {array}   	modifiers       	An array of modifier strings, can be: 'altKey', 'ctrlKey', 'shiftKey', 'metaKey'
	 * @param  {Boolean}  	preventDefault  	Prevent default functionality (optional)
	 * @param  {Boolean}  	stopPropagation 	Stop keystroke from bubbling up (optional)
	 * @return {integer}                   		the ID of the listener (to use when removing the listener)
	 */
	addListener(key, callback, modifiers, preventDefault=false, stopPropagation=false){
		let id = ++this.listenerCount;
		this.log("next id:", id);
		var modifierDefaults = {};
		this.modifierKeys.forEach((k) => modifierDefaults[k] = null);
		let keyData = Object.assign({
			id,			
			key,
			callback,
			preventDefault,
			stopPropagation,
		}, modifierDefaults, modifiers);

		if (key in this.listeningFor){
			this.listeningFor[key].unshift(keyData);
		}
		else {
			this.listeningFor[key] = [keyData];
		}
		this.log(this.listeningFor);
		return id;
	}

	/**
	 * Remove a keystroke listener by ID
	 * 
	 *
	 * @example
	 * // In a React component, this should be called in componentWillUnmount:
	 * componentWillUnmount() {
 	 *	   this.keyListeners.forEach((id) => {
 	 *		   keyCenter.removeListener(id);
 	 *	   });
 	 *	   this.keyListeners = [];
 	 * }
 	 *	
	 * @param  {integer}   	id       	The ID of the keystroke listener (returned from addListener)
	 * @return {boolean}            	Whether listener has been successfully removed
	 */
	removeListener(id){
		let removed = false;
		if (id.constructor !== Array){
			id = [id];
		}
		for (let k in this.listeningFor){
			this.listeningFor[k].forEach((l, idx) => {
				if (id.indexOf(l.id) >= 0){
					this.listeningFor[k].splice(idx, 1);
					this.log(`removed listener id ${l.id}`, this.listeningFor);
					removed = true;
				}
			});
		}
		return removed;
	}

}

// The global KeyCenter instance
const keyCenter = new KeyCenter();
export keyCenter;




/**
 * React Component Decorator
 */
export default function keyListeners(WrappedComponent){
	return class KeyListeners extends Component{

		constructor(props){
			super(props);
			this.keyListeners = [];
			this.addKeyListener = this.addKeyListener.bind(this);
			this.addKeyListeners = this.addKeyListeners.bind(this);
			this.removeKeyListener = this.removeKeyListener.bind(this);
			this.removeAllKeyListeners = this.removeAllKeyListeners.bind(this);
		}

		componentWillUnmount() {
			this.removeAllKeyListeners();
		}

		addKeyListener({
			key,
			action,
			modifiers,
			preventDefault=false,
			stopPropagation=false
		}){
			let listenerId = keyCenter.addListener(
				key,
				action,
				modifiers,
				preventDefault,
				stopPropagation
			);
			this.keyListeners.unshift(listenerId);
			return listenerId;
		}

		addKeyListeners(listeners){
			listeners.forEach(l => this.addKeyListener(l));
		}

		removeKeyListener(id){
			keyCenter.removeListener(id);
		}

		removeAllKeyListeners(){
			this.keyListeners.forEach((id) => {
				keyCenter.removeListener(id);
			});
			this.keyListeners = [];
		}

		render(){
			return (
				<WrappedComponent
					addKeyListener={this.addKeyListener}
					addKeyListeners={this.addKeyListeners}
					removeKeyListener={this.removeKeyListener}
					removeAllKeyListeners={this.removeAllKeyListeners}
					{...this.props}
				/>
			)
		}
	}
}