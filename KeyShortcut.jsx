import React from 'react';

export class KeyCenter {
   constructor() {
      // keys we're listening for
      this.listeningFor = {};

      // possible key modifiers
      this.modifierDefaults = {
         altKey: false,
         ctrlKey: false,
         shiftKey: false,
         metaKey: false,
      };

      // number of registered listeners (for listener ID)
      this.listenerCount = 0;
      // global key listener
      if (typeof document !== 'undefined') {
         document.addEventListener('keydown', this.keyDown, false);
      }
   }

   keyDown = (e) => {
      if (e.key in this.listeningFor) {
         let stopBubble = false;
         this.listeningFor[e.key].forEach((k) => {
            let ignore = false;
            if (!stopBubble) {
               Object.keys(this.modifierDefaults)
                  .forEach((modType) => {
                     if (k[modType] !== null && k[modType] !== e[modType]) {
                        ignore = true;
                     }
                  });
               if (!ignore) {
                  if (k.preventDefault) {
                     e.preventDefault();
                  }
                  if (k.stopPropagation) {
                     e.stopPropagation();
                     stopBubble = true;
                  }
                  if (typeof k.callback === 'function') {
                     k.callback.call(null);
                  }
               }
            }
         });
      }
   }

   addListener = (
      key,
      callback,
      modifiers,
      preventDefault = false,
      stopPropagation = false
   ) => {
      const id = ++this.listenerCount;

      const keyData = {
         ...this.modifierDefaults,
         ...modifiers,
         modifiers,
         id,
         key,
         callback,
         preventDefault,
         stopPropagation,
      };

      if (key in this.listeningFor) {
         this.listeningFor[key].unshift(keyData);
      } else {
         this.listeningFor[key] = [keyData];
      }
      return id;
   }

   removeListener = (id) => {
      const ids = Array.isArray(id) ? id.slice() : [id];
      Object.entries(this.listeningFor).forEach(([keyLabel, keyList]) => {
         this.listeningFor[keyLabel] = keyList.filter(
            (key) => !ids.includes(key.id)
         );
      });
   }
}

export const keyCenter = new KeyCenter();

export default function KeyShortcut({
   k,
   action,
   shift=false,
   alt=false,
   ctrl=false,
   meta=false,
   preventDefault,
   stopPropagation
}){
   const actionRef = React.useRef();
   React.useEffect(() => {
      actionRef.current = action;
      const id = keyCenter.addListener(
         k,
         actionRef.current,
         {
            altKey: alt,
            shiftKey: shift,
            ctrlKey: ctrl,
            metaKey: meta 
         },
         preventDefault,
         stopPropagation
      );
      return () => {
         keyCenter.removeListener(id);
      };
   }, [])
   return null;
}