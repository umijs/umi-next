{{#loaders}}
import { clientLoader as {{name}} } from "{{{path}}}";
{{/loaders}}

export default {
{{#loaders}}
  {{name}},
{{/loaders}}
};
