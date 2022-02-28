import _middlewares from "{{{ apiRootDirPath }}}";
import handler from "{{{ handlerPath }}}";

export default (req, res) => {

  await new Promise((resolve) => _middlewares(req, res, resolve));
  await handler(req, res);

}
