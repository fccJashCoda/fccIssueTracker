const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { ObjectId } = require('mongodb');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Routing Tests', function () {
    // storign the test model id
    let id, id2;

    suite('POST /api/issues/:project', function () {
      test('Create an issue with every field', function (done) {
        const issue = {
          issue_title: 'Test title',
          issue_text: 'placeholder text',
          created_by: 'tdd',
          assigned_to: 'admin',
          status_text: 'in QA',
        };

        chai
          .request(server)
          .post('/api/issues/apitest')
          .send(issue)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Test title');
            assert.equal(res.body.issue_text, 'placeholder text');
            assert.equal(res.body.created_by, 'tdd');
            assert.equal(res.body.assigned_to, 'admin');
            assert.equal(res.body.status_text, 'in QA');
            id = res.body._id;
            done();
          });
      });

      test('Create an issue with only required fields', function (done) {
        const issue = {
          issue_title: 'Test title',
          issue_text: 'placeholder text',
          created_by: 'tdd',
        };

        chai
          .request(server)
          .post('/api/issues/apitest')
          .send(issue)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Test title');
            assert.equal(res.body.issue_text, 'placeholder text');
            assert.equal(res.body.created_by, 'tdd');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            id2 = res.body._id;
            done();
          });
      });

      test('Create an issue with missing required fields', function (done) {
        const issue = {
          created_by: 'tdd',
        };

        chai
          .request(server)
          .post('/api/issues/apitest')
          .send(issue)
          .end(function (req, res) {
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'missing data');
            done();
          });
      });
    });

    suite('GET /api/issues/:project', function () {
      test('View issues on a project', function (done) {
        chai
          .request(server)
          .get('/api/issues/apitest')
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 1);
            done();
          });
      });

      test('View issues on a project with one filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/apitest?open=true')
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 1);

            res.body.forEach((entry) => {
              assert.equal(entry.open, true);
            });
            done();
          });
      });

      test('View issues on a project with multiple filters', function (done) {
        chai
          .request(server)
          .get('/api/issues/apitest?open=true&assigned_to=admin')
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 1);

            res.body.forEach((entry) => {
              assert.equal(entry.open, true);
              assert.equal(entry.assigned_to, 'admin');
            });
            done();
          });
      });
    });

    suite('PUT /api/issues/:project', function () {
      test('Update one field on an issue', function (done) {
        const update = {
          _id: ObjectId(id),
          issue_text: 'updated text',
        };

        chai
          .request(server)
          .put('/api/issues/apitest')
          .send(update)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            // assert.equal(res.body.value.issue_title, 'Test title');
            // assert.equal(res.body.value.issue_text, 'updated text');
            // assert.equal(res.body.value.created_by, 'tdd');
            // assert.equal(res.body.value.assigned_to, 'admin');
            // assert.equal(res.body.value.status_text, 'in QA');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, id);
            done();
          });
      });
      test('Update multiple fields on an issue', function (done) {
        const update = {
          _id: ObjectId(id),
          issue_text: 'updated text',
          assigned_to: 'bill',
          status_text: 'extended QA',
        };

        chai
          .request(server)
          .put('/api/issues/apitest')
          .send(update)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            // assert.equal(res.body.value.issue_title, 'Test title');
            // assert.equal(res.body.value.issue_text, 'updated text');
            // assert.equal(res.body.value.created_by, 'tdd');
            // assert.equal(res.body.value.assigned_to, 'bill');
            // assert.equal(res.body.value.status_text, 'extended QA');
            assert.equal(res.body.result, 'successfully updated');
            assert.equal(res.body._id, id);
            done();
          });
      });
      test('Update an issue with missing _id', function (done) {
        const update = {
          issue_text: 'updated text again',
        };
        chai
          .request(server)
          .put('/api/issues/apitest')
          .send(update)
          .end(function (req, res) {
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
      test('Update an issue with no fields to update', function (done) {
        const update = {
          _id: ObjectId(id),
        };

        chai
          .request(server)
          .put('/api/issues/apitest')
          .send(update)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, id);
            done();
          });
      });
      // Update an issue with an invalid _id: PUT request to /api/issues/{project}
      //   {
      //     "error": "could not update",
      //     "_id": "5fb90854487c295755641111"
      // } expected with status 200
      test('Update an issue with an invalid _id', function (done) {
        const update = {
          _id: ObjectId('5fb90854487c295755641111'),
          issue_text: 'Morty',
        };

        chai
          .request(server)
          .put('/api/issues/apitest')
          .send(update)
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body._id, '5fb90854487c295755641111');
            done();
          });
      });
    });

    suite('DELETE /api/issues/:project', function () {
      test('Delete an issue', function (done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({ _id: id })
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, id);
            assert.equal(res.body.result, 'successfully deleted');
            done();
          });
      });
      test('Delete an issue', function (done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({ _id: id2 })
          .end(function (req, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, id2);
            assert.equal(res.body.result, 'successfully deleted');
            done();
          });
      });
      test('Delete an issue with an invalid _id', function (done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .send({ _id: id2 })
          .end(function (req, res) {
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'invalid _id');
            done();
          });
      });
      test('Delete an issue with missing _id', function (done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .end(function (req, res) {
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
  });
});
