{{#loaders}}
import { clientLoader as {{name}} } from "{{{path}}}";
{{/loaders}}

const loaders = {
{{#loaders}}
  {{name}}: {{name}},
{{/loaders}}
};

export async function executeClientLoader(routeKey: string) {
  const loader = loaders[routeKey.replace(/\//, "_") + "_client_loader"];
  if (!loader) return;
  return await loader();
}
