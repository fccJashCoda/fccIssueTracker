'use strict';
const ObjectId = require('mongodb').ObjectId;

module.exports = function (app, database) {
  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;

      const filter = { ...req.query };
      if (filter.open) {
        filter.open = filter.open === 'true' ? true : false;
      }
      if (filter._id) {
        filter._id = ObjectId(filter._id);
      }

      database
        .collection(project)
        .find(filter)
        .toArray((err, data) => {
          if (err) {
            return res.status(500).json({ error: 'server error' });
          }

          res.json(data.reverse());
        });
    })

    .post(function (req, res) {
      let project = req.params.project;

      const { issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const assigned_to = req.body.assigned_to ? req.body.assigned_to : '';
      const status_text = req.body.status_text ? req.body.status_text : '';

      const date = new Date().toISOString();

      database.collection(project).insertOne(
        {
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to,
          status_text: status_text,
          open: true,
          created_on: date,
          updated_on: date,
        },
        (err, data) => {
          if (err) {
            return res.status(500).json({ error: 'server error' });
          }

          return res.json(...data.ops);
        }
      );
    })

    .put(function (req, res) {
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      const query = { _id: ObjectId(req.body._id) };

      const baseCase = { open: true };
      const update = {};
      for (const property in req.body) {
        if (property !== '_id' && req.body[property]) {
          update[property] = req.body[property];
        }
      }

      if (!Object.keys(update).length) {
        return res.json({
          error: 'no update field(s) sent',
          _id: req.body._id,
        });
      }

      const payload = Object.assign({}, baseCase, update);

      database
        .collection(project)
        .findOneAndUpdate(
          query,
          { $set: { ...payload, updated_on: new Date().toISOString() } },
          { returnOriginal: false },
          (err, data) => {
            if (err) {
              return res.status(500).json({ error: 'server error' });
            }

            if (!data.value) {
              return res.json({
                error: 'could not update',
                _id: req.body._id,
              });
            }

            return res.json({
              result: 'successfully updated',
              _id: req.body._id,
            });
          }
        );
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      const query = { _id: ObjectId(req.body._id) };

      database.collection(project).deleteOne(query, (err, data) => {
        if (err) {
          return res.status(500).json({ error: 'server error' });
        }

        if (data.deletedCount === 0) {
          return res.json({ error: 'could not delete', _id: req.body._id });
        }

        return res.json({ result: 'successfully deleted', _id: req.body._id });
      });
    });
};
