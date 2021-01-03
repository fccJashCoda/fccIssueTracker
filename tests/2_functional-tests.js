const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

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
      //    Update one field on an issue: PUT request to /api/issues/{project}
      test('Update one field on an issue', function (done) {
        chai
          .request(server)
          .get('/api/issues/apitest')
          .end(function (req, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
      // Update multiple fields on an issue: PUT request to /api/issues/{project}
      // Update an issue with missing _id: PUT request to /api/issues/{project}
      // Update an issue with no fields to update: PUT request to /api/issues/{project}
      // Update an issue with an invalid _id: PUT request to /api/issues/{project}
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
            assert.equal(res.body.error, 'invalid id');
            done();
          });
      });
      test('Delete an issue with missing _id', function (done) {
        chai
          .request(server)
          .delete('/api/issues/apitest')
          .end(function (req, res) {
            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'missing data');
            done();
          });
      });
    });
  });
});
