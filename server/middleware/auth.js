const jwt = require('jsonwebtoken');
module.exports = function auth(req,res,next){
  const raw=req.headers.authorization||'';
  const token=raw.startsWith('Bearer ')?raw.slice(7):'';
  if(!token) return res.status(401).json({message:'Authentication required'});
  try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}
  catch(e){return res.status(401).json({message:'Invalid or expired session'});}
};
