const userEntityModel = require('../models/userEntity.model');
const pool = require('../config/db');
const { initDB } = require('../config/db');

// ➕ CREATE
exports.create = async (req, res) => {
  const { user_id, entity_id } = req.body;

  if (!user_id || !entity_id) {
    return res.status(400).json({ error: 'user_id et entity_id sont requis' });
  }

  try {
    await initDB();
    
    // Check if the association already exists
    const exists = await userEntityModel.checkUserEntityExistsByPair(user_id, entity_id);
    if (exists) {
      return res.status(409).json({ error: 'Cette association existe déjà' });
    }

    const result = await userEntityModel.createUserEntity({ user_id, entity_id });
    res.status(201).json(result);
  } catch (err) {
    console.error('Erreur lors de la création:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la création',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

// 📥 READ ALL
exports.findAll = async (req, res) => {
  try {
    await initDB();
    const results = await userEntityModel.getAllUserEntities();
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération:', err);
    res.status(500).json({ 
      error: 'Erreur récupération',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

// 📥 READ BY ID
exports.findById = async (req, res) => {
  try {
    await initDB();
    const result = await userEntityModel.getUserEntityById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Association non trouvée' });
    res.json(result);
  } catch (err) {
    console.error('Erreur lors de la récupération:', err);
    res.status(500).json({ 
      error: 'Erreur récupération',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

// ✏️ UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { user_id, entity_id } = req.body;

  try {
    await initDB();
    
    // 1. Vérification de l'existence de l'association
    const exists = await userEntityModel.checkUserEntityExists(id);
    if (!exists) {
      return res.status(404).json({ error: 'Association non trouvée' });
    }

    // 2. Construction dynamique de l'objet de mise à jour
    const updateData = {
      ...(user_id !== undefined && { user_id }),
      ...(entity_id !== undefined && { entity_id })
    };
    
    // 3. Vérification qu'il y a bien des données à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée valide à mettre à jour' });
    }

    // 4. Vérification si la nouvelle association existe déjà
    if (user_id !== undefined && entity_id !== undefined) {
      const pairExists = await userEntityModel.checkUserEntityExistsByPair(user_id, entity_id);
      if (pairExists) {
        return res.status(409).json({ error: 'Cette association existe déjà' });
      }
    }
    
    // 5. Mise à jour et réponse
    const updatedAssociation = await userEntityModel.updateUserEntity(id, updateData);
    
    return res.json(updatedAssociation);

  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    const statusCode = err.message.includes('non trouvé') ? 404 : 500;
    res.status(statusCode).json({
      error: err.message || 'Erreur lors de la mise à jour',
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    });
  }
};

// ❌ DELETE
exports.remove = async (req, res) => {
  try {
    await initDB();
    const exists = await userEntityModel.checkUserEntityExists(req.params.id);
    if (!exists) return res.status(404).json({ error: 'Association non trouvée' });

    await userEntityModel.deleteUserEntity(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ 
      error: 'Erreur suppression',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
};

