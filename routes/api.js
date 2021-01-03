'use strict';
const ObjectId = require('mongodb').ObjectId;

module.exports = function (app, database) {
  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;

      console.log(req.query);

      const filter = { ...req.query };
      if (filter.open) {
        filter.open = filter.open === 'true' ? true : false;
      }
      console.log(filter);
      database
        .collection(project)
        .find(filter)
        .toArray((err, data) => {
          if (err) {
            return res.status(500).json({ error: 'server error' });
          }

          res.json(data);
        });
    })

    .post(function (req, res) {
      let project = req.params.project;

      const { issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'Missing data' });
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
        return res.json({ error: 'Missing data' });
      }

      const query = { _id: ObjectId(req.body._id) };

      const update = { open: true, updated_on: new Date().toISOString() };
      for (const property in req.body) {
        if (property !== '_id' && req.body[property]) {
          update[property] = req.body[property];
        }
      }

      database
        .collection(project)
        .updateOne(query, { $set: { ...update } }, (err, data) => {
          if (err) {
            return res.status(500).json({ error: 'server error' });
          }
          console.log(`Object with id ${req.body._id} updated`);
          return res.json({
            result: 'successfully updated',
            _id: req.body._id,
          });
        });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing data' });
      }

      const query = { _id: ObjectId(req.body._id) };

      database.collection(project).deleteOne(query, (err, data) => {
        if (err) {
          return res.status(500).json({ error: 'server error' });
        }

        res.json({ result: 'successfully deleted', _id: req.body._id });
      });
    });
};
