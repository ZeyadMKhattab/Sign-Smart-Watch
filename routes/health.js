const express = require('express');
const { dbRun, dbGet, dbAll } = require('../database');

const router = express.Router();

/*
  Record health metric from smart Watch 
 */
router.post('/record-metric', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { metric_type, metric_value, unit } = req.body;

    if (!metric_type || metric_value === undefined) {
      return res.status(400).json({ 
        message: 'metric_type and metric_value are required' 
      });
    }

    const result = await dbRun(
      'INSERT INTO health_metrics (user_id, metric_type, metric_value, unit) VALUES (?, ?, ?, ?)',
      [userId, metric_type, metric_value, unit || null]
    );

    const metric = await dbGet(
      'SELECT * FROM health_metrics WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Health metric recorded successfully',
      success: true,
      metric
    });
  } catch (error) {
    console.error('Error recording health metric:', error);
    res.status(500).json({ 
      message: 'Error recording health metric',
      error: error.message 
    });
  }
});

/*
   Get all health metrics for user (optional: filter by type and date range)
 */
router.get('/metrics', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { metric_type, days } = req.query;

    let sql = 'SELECT * FROM health_metrics WHERE user_id = ?';
    const params = [userId];

    if (metric_type) {
      sql += ' AND metric_type = ?';
      params.push(metric_type);
    }

    if (days) {
      sql += ` AND recorded_at >= datetime('now', '-${parseInt(days)} days')`;
    }

    sql += ' ORDER BY recorded_at DESC';

    const metrics = await dbAll(sql, params);

    res.json({
      success: true,
      total: metrics.length,
      metrics
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ 
      message: 'Error fetching health metrics',
      error: error.message 
    });
  }
});

/*
  Get summary of health metrics by type
 */
router.get('/metrics-summary', async (req, res) => {
  try {
    const userId = req.session.user.id;

    const summary = await dbAll(`
      SELECT 
        metric_type,
        COUNT(*) as count,
        AVG(metric_value) as average,
        MIN(metric_value) as minimum,
        MAX(metric_value) as maximum,
        unit
      FROM health_metrics
      WHERE user_id = ?
      GROUP BY metric_type
    `, [userId]);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching health metrics summary:', error);
    res.status(500).json({ 
      message: 'Error fetching health metrics summary',
      error: error.message 
    });
  }
});

/*
  Delete a specific health metric record
 */
router.delete('/metrics/:id', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const metricId = req.params.id;

    const metric = await dbGet(
      'SELECT id FROM health_metrics WHERE id = ? AND user_id = ?',
      [metricId, userId]
    );

    if (!metric) {
      return res.status(404).json({ 
        message: 'Health metric not found' 
      });
    }

    await dbRun('DELETE FROM health_metrics WHERE id = ?', [metricId]);

    res.json({
      message: 'Health metric deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting health metric:', error);
    res.status(500).json({ 
      message: 'Error deleting health metric',
      error: error.message 
    });
  }
});

module.exports = router;
