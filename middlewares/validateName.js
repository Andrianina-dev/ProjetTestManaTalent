module.exports = function validateName(req, res, next) {
    if (!req.body.name) {
      return res.status(400).json({ error: 'Le champ name est obligatoire' });
    }
    next();
  };
  