const { getPool } = require('../config/db'); 

exports.updateUser = async (updateFields, userId) => {
  try {
    const pool = getPool(); 
    
    const filteredFields = {};
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined && value !== null) {
        filteredFields[key] = key === 'password' 
          ? await bcrypt.hash(value, 10) 
          : value;
      }
    }

    if (Object.keys(filteredFields).length === 0) {
      throw new Error('Aucun champ valide à mettre à jour');
    }


    const setClause = Object.keys(filteredFields)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(filteredFields), userId];

    // 4. Exécution de la mise à jour
    const [result] = await pool.execute(
      `UPDATE user SET ${setClause} WHERE id = ?`,
      values
    );

    // 5. Vérification du résultat
    if (result.affectedRows === 0) {
      throw new Error('Aucun utilisateur trouvé avec cet ID');
    }

    // 6. Récupération de l'utilisateur mis à jour (sans le mot de passe)
    const [user] = await pool.execute(
      'SELECT id, name, firstName, email, language FROM user WHERE id = ?',
      [userId]
    );

    return user[0] || null;

  } catch (error) {
    console.error('Erreur dans updateUser:', error);
    throw error;
  }
};


exports.createUser = async ({ name, firstName, email, password }) => {
  const pool = getPool();
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO user (name, firstName, email, password) VALUES (?, ?, ?, ?)',
      [name, firstName, email, password]
    );
    
    const [user] = await pool.execute(
      'SELECT id, name, firstName, email FROM user WHERE id = ?',
      [result.insertId]
    );
    
    return user[0];
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};


exports.getAllUsers = async () => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM user');
  return rows;
};

exports.getUserById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM user WHERE id = ?', [id]);
  return rows[0] || null;
};


exports.checkUserExists = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT 1 FROM user WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0;
};

exports.deleteUser = async (id) => {
  const pool = getPool();
  
  // 1. Vérification que l'utilisateur existe
  const [user] = await pool.execute('SELECT id FROM user WHERE id = ? LIMIT 1', [id]);
  if (user.length === 0) {
    throw new Error('Utilisateur non trouvé');
  }

  // 2. Exécution de la suppression
  const [result] = await pool.execute('DELETE FROM user WHERE id = ?', [id]);

  // 3. Vérification du résultat
  if (result.affectedRows === 0) {
    throw new Error('Échec de la suppression');
  }

  return { success: true, deletedId: id };
};