export default function logger(req, res, next) {
  const now = new Date();
  console.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.debug("Request body:", req.body);
  next(); 
}
