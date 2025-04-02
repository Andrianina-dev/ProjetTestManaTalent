const { getPool } = require('../config/db');

exports.createEntity = async ({ name, description, siret, keyLicence, website }) => {
  const pool = getPool();
  try {
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.execute(
      'INSERT INTO entity (name, description, siret, keyLicence, website, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, siret || null, keyLicence || null, website || null, currentDate]
    );

    const [entity] = await pool.execute(
      'SELECT id, name, description, siret, keyLicence, website, createdAt FROM entity WHERE id = ?',
      [result.insertId]
    );

    return entity[0];
  } catch (error) {
    console.error('Error in createEntity:', error);
    throw error;
  }
};

exports.getAllEntities = async () => {
  const pool = getPool();
  try {
    const [rows] = await pool.execute('SELECT id, name, description, siret, keyLicence, website, createdAt FROM entity');
    return rows;
  } catch (error) {
    console.error('Error in getAllEntities:', error);
    throw error;
  }
};

exports.getEntityById = async (id) => {
  const pool = getPool();
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, description, siret, keyLicence, website, createdAt FROM entity WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getEntityById:', error);
    throw error;
  }
};

exports.checkEntityExists = async (id) => {
  const pool = getPool();
  try {
    const [rows] = await pool.execute('SELECT 1 FROM entity WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error in checkEntityExists:', error);
    throw error;
  }
};

exports.updateEntity = async (updateFields, entityId) => {
  const pool = getPool();
  try {
    // Filter out undefined/null fields
    const filteredFields = {};
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined && value !== null) {
        filteredFields[key] = value;
      }
    }

    if (Object.keys(filteredFields).length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = Object.keys(filteredFields)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(filteredFields), entityId];

    const [result] = await pool.execute(
      `UPDATE entity SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new Error('No entity found with this ID');
    }

    const [entity] = await pool.execute(
      'SELECT id, name, description, siret, keyLicence, website, createdAt FROM entity WHERE id = ?',
      [entityId]
    );

    return entity[0] || null;
  } catch (error) {
    console.error('Error in updateEntity:', error);
    throw error;
  }
};

exports.deleteEntity = async (id) => {
  const pool = getPool();
  try {
    // Check if entity exists
    const [entity] = await pool.execute('SELECT id FROM entity WHERE id = ? LIMIT 1', [id]);
    if (entity.length === 0) {
      throw new Error('Entity not found');
    }

    const [result] = await pool.execute('DELETE FROM entity WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Failed to delete entity');
    }

    return { success: true, deletedId: id };
  } catch (error) {
    console.error('Error in deleteEntity:', error);
    throw error;
  }
};