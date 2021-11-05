import * as React from 'react';
import type { InspectProps } from '{{{ inspxpath }}}';
import Inspect from '{{{ inspxpath }}}';


export function _InspxContainer(props: InspectProps) {
  return (
    <React.Suspense fallback={null}>
      <div onClick={()=>{
        const event = new CustomEvent('inspxswitch');
        document.dispatchEvent(event);
        }}>Click me!</div>
      <Inspect {...props} {{#inspx}} disabled={ {{{inspx.disabled}}} } margin={ {{{inspx.margin}}} } size={ {{{inspx.size}}} } padding={ {{{inspx.padding}}} } {{/inspx }} />
    </React.Suspense>
  );
}
