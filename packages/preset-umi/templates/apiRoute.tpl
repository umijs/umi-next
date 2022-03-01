import _middlewares from "{{{ apiRootDirPath }}}/_middlewares";
import handler from "{{{ handlerPath }}}";

export default async (req, res) => {

  await new Promise((resolve) => _middlewares(req, res, resolve));
  await handler(req, res);

}
